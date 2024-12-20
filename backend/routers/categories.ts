import express from "express";
import mysqlDB from "../mysqlDB";
import {Category, CategoryWithoutId, } from "../types";
import {ResultSetHeader} from "mysql2";
import mysqlDb from "../mysqlDB";


const categoriesRouter = express.Router();

categoriesRouter.get('/', async (req, res) => {
    const connection = await mysqlDB.getConnection();
    const [result] = await connection.query('SELECT * FROM categories');
    const categories = result as Category[];

    res.send(categories);
});

categoriesRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    const connection = await mysqlDb.getConnection();
    const [result] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);

    const category = result as Category[];

    try {
        if (category.length === 0) {
            res.status(404).send("Category not found");
        } else {
            res.send(category[0]);
        }
    } catch (e) {
        next(e);
    }
});

categoriesRouter.post('/', async (req, res,next) => {
    if (!req.body.title) {
        res.status(400).send("Please enter title");
        return;
    }

    const category: CategoryWithoutId = {
        title: req.body.title,
        description: req.body.description,
    }

    try {
        const connection = await mysqlDB.getConnection();
        const [result] = await connection.query('INSERT INTO categories (title, description) VALUES (?, ?)',
            [category.title, category.description]);

        const resultHeader = result as ResultSetHeader;

        const [resultOneCategory] = await connection.query('SELECT * FROM categories WHERE id = ?', [resultHeader.insertId]);

        const oneCategory = resultOneCategory as Category[];

        if (oneCategory.length === 0) {
            res.status(404).send("Category Not Found");
        } else {
            res.send(oneCategory[0]);
        }
    } catch (e){
        next(e);
    }
});

categoriesRouter.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const connection = await mysqlDb.getConnection();

        const [deleteResult] = await connection.query('DELETE FROM categories WHERE id = ?', [id]);
        const resultHeader = deleteResult as ResultSetHeader;

        if (resultHeader.affectedRows > 0) {
            res.send("Category deleted successfully");
        } else {
            res.status(500).send("Failed to delete category");
        }
    } catch (e) {
        next(e);
    }
});

categoriesRouter.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const connection = await mysqlDb.getConnection();

        const [oneCategoryFromSql] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);
        const category = oneCategoryFromSql as Category[];

        if (category.length === 0) {
            res.status(404).send({error: "Category not found"});
            return;
        }

        await connection.query('UPDATE categories SET title = ?, description = ? WHERE id = ?', [req.body.title || category[0].title,req.body.description || category[0].description, id]);

        const [oneCategory] = await connection.query('SELECT * FROM categories WHERE id = ?', [id]);
        const resultUpdateCategory = oneCategory as Category[];

        res.send({"Category updated successfully": resultUpdateCategory[0]});
    } catch (e) {
        next(e);
    }

});

export default categoriesRouter;