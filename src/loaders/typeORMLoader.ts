import { MicroframeworkLoader, MicroframeworkSettings } from "microframework-w3tec";
import Container from "typedi";
import { DataSource } from "typeorm";

import { env } from "../env";


export const dataSource = new DataSource({
    type: env.db.mysql.type as any,
    entities: env.app.dirs.mysql.entities,
    migrations: env.app.dirs.mysql.migrations,
    migrationsTableName: "migrations",
    username: env.db.mysql.username,
    password: env.db.mysql.password,
    host: env.db.mysql.host,
    database: env.db.mysql.database,
    port: env.db.mysql.port,
});

export const mysqlLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    Container.set("defaultConnection", dataSource);
    await dataSource.initialize()
        .then(async (connection) => {
            if (settings) {
                console.log("connected to mysql!");
                settings.setData("defaultConnection", connection);
                settings.onShutdown(() => {
                    dataSource.destroy();
                    console.log("disconnected from mysql!");
                });
            }
        })
        .catch((err) => {
            console.log(`Error connecting to mysql DB ${err}`);
        });
};
