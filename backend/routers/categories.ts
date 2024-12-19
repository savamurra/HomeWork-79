import express from "express";
import mysqlDB from "../mysqlDB";
import {Category, CategoryWithoutId} from "../types";
import {ResultSetHeader} from "mysql2";
import {imagesUpload} from "../multer";

const categoriesRouter = express.Router();

categoriesRouter.get('/', async (req, res) => {
    const connection = await mysqlDB.getConnection();
    const [result] = await connection.query('SELECT * FROM categories');
    const categories = result as Category[];

    res.send(categories);
});

categoriesRouter.post('/', imagesUpload.single('image'), async (req, res,next) => {
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
})

export default categoriesRouter