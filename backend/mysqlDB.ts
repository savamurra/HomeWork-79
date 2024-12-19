import  {Connection} from "mysql2/promise";
import * as mysql from "mysql2/promise";
import config from "./config";

let connection: Connection;

const mysqlDB = {
    async init() {
        connection = await mysql.createConnection(config.database);
    },
    async getConnection() {
        return connection;
    }
};

export default mysqlDB;