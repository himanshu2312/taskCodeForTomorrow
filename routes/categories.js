import express from "express";
import { getCategories, updateCategory, addCategory, deleteCategory } from "../controllers/categories.js";
const router = express.Router();

router.post("/category", addCategory);
router.get("/categories", getCategories)
router.put("/category/:categoryID", updateCategory);
router.delete("/category/:categoryID", deleteCategory);

export default router;