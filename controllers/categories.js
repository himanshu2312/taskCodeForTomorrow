import db from '../db/init.js';  // Adjust path as needed

// Get all categories
const getCategories = (_, res) => {
    db.all(`SELECT id, name FROM categories`, (err, rows) => {
        if (err) return res.status(500).json({ result: false, error: err.message });
        res.json({ result: true, categories: rows });
    });
};

// Update category by ID
const updateCategory = (req, res) => {
    const categoryId = req.params.categoryId;
    const { name } = req.body;

    if (!name) return res.status(400).json({ result: false, error: 'Category name is required' });

    db.run(
        `UPDATE categories SET name = ? WHERE id = ?`,
        [name, categoryId],
        function (err) {
            if (err) return res.status(500).json({ result: false, error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({ result: false, error: 'Category not found' });
            }

            res.json({ result: true, message: 'Category updated successfully' });
        }
    );
};

// Add new category
const addCategory = (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ result: false, error: 'Category name is required' });
    }

    db.run(
        `INSERT INTO categories (name) VALUES (?)`,
        [name],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint')) {
                    return res.status(409).json({ result: false, error: 'Category already exists' });
                }
                return res.status(500).json({ result: false, error: err.message });
            }

            res.status(201).json({
                result: true,
                category: {
                    id: this.lastID,
                    name,
                },
            });
        }
    );
};

// Delete category only if no services exist
const deleteCategory = (req, res) => {
    const categoryId = req.params.categoryId;

    // Check if category has services
    db.get(
        `SELECT COUNT(*) as count FROM services WHERE category_id = ?`,
        [categoryId],
        (err, row) => {
            if (err) return res.status(500).json({ result: false, error: err.message });

            if (row.count > 0) {
                return res.status(400).json({
                    result: false,
                    error: 'Cannot delete category with existing services',
                });
            }

            // Delete category
            db.run(
                `DELETE FROM categories WHERE id = ?`,
                [categoryId],
                function (err) {
                    if (err) return res.status(500).json({ result: false, error: err.message });

                    if (this.changes === 0) {
                        return res.status(404).json({ result: false, error: 'Category not found' });
                    }

                    res.json({ result: true, message: 'Category deleted successfully' });
                }
            );
        }
    );
};

export { getCategories, updateCategory, addCategory, deleteCategory };
