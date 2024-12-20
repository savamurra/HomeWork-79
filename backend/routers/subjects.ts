import express from "express";
import {Location, Subjects, SubjectWithoutId} from "../types";
import {imagesUpload} from "../multer";
import mysqlDb from "../mysqlDB";
import {ResultSetHeader} from "mysql2";
import locationsRouter from "./locations";

const subjectsRouter = express.Router();

subjectsRouter.get('/', async (req, res) => {
    const connection = await mysqlDb.getConnection();

    const [result] = await connection.query('SELECT * FROM subjects');
    const subject = result as Subjects[]

    res.send(subject);
});


subjectsRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    const connection = await mysqlDb.getConnection();
    const [result] = await connection.query('SELECT * FROM subjects WHERE id = ?', [id]);

    const subject = result as Subjects[];

    try {
        if (subject.length === 0) {
            res.status(404).send("Subject not found");
        } else {
            res.send(subject[0]);
        }
    } catch (e) {
        next(e)
    }
});


subjectsRouter.post('/', imagesUpload.single('subject_image'), async (req, res, next) => {
    console.log(req.body);
    if (!req.body.subject_title || !req.body.category_id || !req.body.location_id) {
        res.status(400).send({error: "Please send a subject_title and category_id and location_id"});
        return;
    }

    const subject: SubjectWithoutId = {
        category_id: req.body.category_id,
        location_id: req.body.location_id,
        subject_title: req.body.subject_title,
        subject_description: req.body.subject_description,
        subject_image: req.file ? 'images' + req.file.filename : null,
    };

    try {
        const connection = await mysqlDb.getConnection();
        const [result] = await connection.query('INSERT INTO subjects (category_id, location_id, subject_title, subject_description, subject_image) VALUES (?, ?, ? ,? ,?)',
            [subject.category_id, subject.location_id, subject.subject_title, subject.subject_description, subject.subject_image,]);

        const resultHeaderSubject = result as ResultSetHeader

        const [resultOneSubject] = await connection.query('SELECT * FROM subjects WHERE id = ?', [resultHeaderSubject.insertId]);

        const oneSubject = resultOneSubject as Subjects[];

        if (oneSubject.length === 0) {
            res.status(404).send("Product not found");
        } else {
            res.send(oneSubject[0]);
        }
    } catch (e) {
        next(e)
    }
});

subjectsRouter.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const connection = await mysqlDb.getConnection();

        const [deleteResult] = await connection.query('DELETE FROM subjects WHERE id = ?', [id]);
        const resultHeader = deleteResult as ResultSetHeader;

        if (resultHeader.affectedRows > 0) {
            res.send("Subject deleted successfully");
        } else {
            res.status(500).send("Failed to delete subject");
        }
    } catch (e) {
        next(e);
    }
});

subjectsRouter.put('/:id', imagesUpload.single('subject_image'), async (req, res, next) => {
    const id = req.params.id;
    const connection = await mysqlDb.getConnection();

    const [oneSubjectFromSql] = await connection.query('SELECT * FROM subjects WHERE id = ?', [id]);
    const subject = oneSubjectFromSql as Subjects[];


    await connection.query('UPDATE subjects SET category_id = ?, location_id = ?, subject_title = ?, subject_description = ?, subject_image = ?  WHERE id = ?', [req.body.category_id || subject[0].category_id,req.body.location_id || subject[0].location_id,req.body.subject_title || subject[0].subject_title, req.body.subject_description || subject[0].subject_description, `images${req.file?.filename}` || subject[0].subject_image, id]);

    const [oneSubject] = await connection.query('SELECT * FROM subjects WHERE id = ?', [id]);
    const resultUpdateSubject = oneSubject as Subjects[];

    res.send({"Location updated successfully": resultUpdateSubject[0]});
});


export default subjectsRouter;
