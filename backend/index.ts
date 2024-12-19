import express from "express";
import categoriesRouter from "./routers/categories";
import mysqlDB from "./mysqlDB";

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static('public'));

app.use('/categories', categoriesRouter);

const run  = async () => {
    await mysqlDB.init();

    app.listen(port, () => {
        console.log(`Server started on port http://localhost:${port}`);
    });
}

run().catch(err => console.log(err));