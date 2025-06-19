import db from '../db/init.js';

// Add a new service under a category
export const addService = (req, res) => {
    const { categoryId } = req.params;
    const { name, type, priceOptions } = req.body;

    if (!name || !type) {
        return res.status(400).json({ result: false, error: 'Service name and type are required' });
    }
    if (type !== 'Normal' && type !== 'VIP') {
        return res.status(400).json({ result: false, error: 'Service type must be Normal or VIP' });
    }

    db.run(
        `INSERT INTO services (category_id, name, type) VALUES (?, ?, ?)`,
        [categoryId, name, type],
        function (err) {
            if (err) return res.status(500).json({ result: false, error: err.message });

            const serviceId = this.lastID;

            // Insert price options if any
            if (Array.isArray(priceOptions) && priceOptions.length > 0) {
                const stmt = db.prepare(
                    `INSERT INTO service_price_options (service_id, duration, price, type) VALUES (?, ?, ?, ?)`
                );

                for (const option of priceOptions) {
                    const { duration, price, type: optionType } = option;
                    if (!duration || !price || !optionType || !['Hourly', 'Weekly', 'Monthly'].includes(optionType)) {
                        // skip invalid options
                        continue;
                    }
                    stmt.run(serviceId, duration, price, optionType);
                }

                stmt.finalize((err) => {
                    if (err) {
                        return res.status(500).json({ result: false, error: err.message });
                    }
                    return res.status(201).json({ result: true, serviceId });
                });
            } else {
                res.status(201).json({ result: true, serviceId });
            }
        }
    );
};

// Get all services for a category, including price options
export const getServicesByCategory = (req, res) => {
    const { categoryId } = req.params;

    db.all(
        `SELECT id, name, type FROM services WHERE category_id = ?`,
        [categoryId],
        (err, services) => {
            if (err) return res.status(500).json({ result: false, error: err.message });

            if (services.length === 0) {
                return res.json({ result: true, services: [] });
            }

            // For each service, get price options
            const serviceIds = services.map(s => s.id);
            db.all(
                `SELECT service_id, duration, price, type FROM service_price_options WHERE service_id IN (${serviceIds.map(() => '?').join(',')})`,
                serviceIds,
                (err2, priceOptions) => {
                    if (err2) return res.status(500).json({ result: false, error: err2.message });

                    // Attach price options to services
                    const servicesWithPrices = services.map(service => {
                        service.priceOptions = priceOptions.filter(po => po.service_id === service.id);
                        return service;
                    });

                    res.json({ result: true, services: servicesWithPrices });
                }
            );
        }
    );
};

// Update a service and its price options
export const updateService = (req, res) => {
    const { categoryId, serviceId } = req.params;
    const { name, type, priceOptions } = req.body;

    if (type && !['Normal', 'VIP'].includes(type)) {
        return res.status(400).json({ result: false, error: 'Service type must be Normal or VIP' });
    }

    // First, update service info
    db.run(
        `UPDATE services SET name = COALESCE(?, name), type = COALESCE(?, type) WHERE id = ? AND category_id = ?`,
        [name, type, serviceId, categoryId],
        function (err) {
            if (err) return res.status(500).json({ result: false, error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({ result: false, error: 'Service not found' });
            }

            if (!Array.isArray(priceOptions)) {
                // no price option update, respond now
                return res.json({ result: true, message: 'Service updated successfully' });
            }

            // Delete existing price options for this service
            db.run(`DELETE FROM service_price_options WHERE service_id = ?`, [serviceId], (delErr) => {
                if (delErr) return res.status(500).json({ result: false, error: delErr.message });

                if (priceOptions.length === 0) {
                    // no new price options, done
                    return res.json({ result: true, message: 'Service updated successfully' });
                }

                // Insert new price options
                const stmt = db.prepare(
                    `INSERT INTO service_price_options (service_id, duration, price, type) VALUES (?, ?, ?, ?)`
                );

                for (const option of priceOptions) {
                    const { duration, price, type: optionType } = option;
                    if (!duration || !price || !optionType || !['Hourly', 'Weekly', 'Monthly'].includes(optionType)) {
                        continue;
                    }
                    stmt.run(serviceId, duration, price, optionType);
                }

                stmt.finalize((finalizeErr) => {
                    if (finalizeErr) {
                        return res.status(500).json({ result: false, error: finalizeErr.message });
                    }
                    res.json({ result: true, message: 'Service and price options updated successfully' });
                });
            });
        }
    );
};

// Delete a service and its price options
export const deleteService = (req, res) => {
    const { categoryId, serviceId } = req.params;

    // First verify service belongs to category
    db.get(
        `SELECT id FROM services WHERE id = ? AND category_id = ?`,
        [serviceId, categoryId],
        (err, service) => {
            if (err) return res.status(500).json({ result: false, error: err.message });
            if (!service) return res.status(404).json({ result: false, error: 'Service not found' });

            // Delete price options
            db.run(`DELETE FROM service_price_options WHERE service_id = ?`, [serviceId], (err2) => {
                if (err2) return res.status(500).json({ result: false, error: err2.message });

                // Delete service
                db.run(`DELETE FROM services WHERE id = ?`, [serviceId], function (err3) {
                    if (err3) return res.status(500).json({ result: false, error: err3.message });

                    res.json({ result: true, message: 'Service deleted successfully' });
                });
            });
        }
    );
};