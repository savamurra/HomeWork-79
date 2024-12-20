import express from "express";
import mysqlDB from "../mysqlDB";
import { Location, LocationWithoutId} from "../types";
import {ResultSetHeader} from "mysql2";
import {imagesUpload} from "../multer";
import mysqlDb from "../mysqlDB";


const locationsRouter = express.Router();

locationsRouter.get('/', async (req, res) => {
    const connection = await mysqlDB.getConnection();
    const [result] = await connection.query('SELECT * FROM locations');
    const locations = result as Location[];

    res.send(locations);
});

locationsRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id;
    const connection = await mysqlDb.getConnection();
    const [result] = await connection.query('SELECT * FROM locations WHERE id = ?', [id]);

    const location = result as Location[];

    try {
        if (location.length === 0) {
            res.status(404).send("Subject not found");
        } else {
            res.send(location[0]);
        }
    } catch (e) {
        next(e)
    }
});

locationsRouter.post('/', async (req, res,next) => {
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
});

locationsRouter.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const connection = await mysqlDb.getConnection();

        const [deleteResult] = await connection.query('DELETE FROM locations WHERE id = ?', [id]);
        const resultHeader = deleteResult as ResultSetHeader;

        if (resultHeader.affectedRows > 0) {
            res.send("Location deleted successfully");
        } else {
            res.status(500).send("Failed to delete location");
        }
    } catch (e) {
        next(e);
    }
});

locationsRouter.put('/:id', async (req, res, next) => {
    const id = req.params.id;
    const connection = await mysqlDb.getConnection();

    const [oneLocationFromSql] = await connection.query('SELECT * FROM locations WHERE id = ?', [id]);
    const location = oneLocationFromSql as Location[];


    await connection.query('UPDATE locations SET location_names = ?, description = ? WHERE id = ?', [req.body.location_names || location[0].location_names,req.body.description || location[0].description, id]);

    const [oneLocation] = await connection.query('SELECT * FROM locations WHERE id = ?', [id]);
    const resultUpdateLocation = oneLocation as Location[];

    res.send({"Location updated successfully": resultUpdateLocation[0]});
});

export default locationsRouter