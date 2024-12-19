import express from "express";
import mysqlDB from "../mysqlDB";
import {Category, CategoryWithoutId, LocationWithoutId} from "../types";
import {ResultSetHeader} from "mysql2";
import {imagesUpload} from "../multer";

const locationsRouter = express.Router();

locationsRouter.get('/', async (req, res) => {
    const connection = await mysqlDB.getConnection();
    const [result] = await connection.query('SELECT * FROM locations');
    const locations = result as Category[];

    res.send(locations);
});

locationsRouter.post('/', imagesUpload.single('image'), async (req, res,next) => {
    if (!req.body.location_names) {
        res.status(400).send("Please enter title");
        return;
    }

    const location: LocationWithoutId = {
        location_names: req.body.location_names,
        description: req.body.description,
    }

    try {
        const connection = await mysqlDB.getConnection();
        const [result] = await connection.query('INSERT INTO locations (location_names, description) VALUES (?, ?)',
            [location.location_names, location.description]);

        const resultHeaderLoc = result as ResultSetHeader;

        const [resultOneLocation] = await connection.query('SELECT * FROM locations WHERE id = ?', [resultHeaderLoc.insertId]);

        const oneLocation = resultOneLocation as Location[];

        if (oneLocation.length === 0) {
            res.status(404).send("Location Not Found");
        } else {
            res.send(oneLocation[0]);
        }
    } catch (e){
        next(e);
    }
})

export default locationsRouter