import { MicroframeworkLoader, MicroframeworkSettings } from "microframework-w3tec";
import { DataSource } from "typeorm";

import { env } from "../env";


const url = `mongodb://${env.db.mongo.username}:${env.db.mongo.password}@${env.db.mongo.host}`;


export const dataSource = new DataSource({
    type: env.db.mongo.type as any,
    url,
    database: env.db.mongo.database,
    port: env.db.mongo.port,
    synchronize: env.db.mongo.synchronize,
    logging: env.db.mongo.logging,
    entities: env.app.dirs.mongo.entities,
    migrations: env.app.dirs.mongo.migrations,
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

export const mongoLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    await dataSource.initialize()
        .then(async (connection) => {
            if (settings) {
                console.log("connected to mongo!");
                settings.setData("defaultConnection", connection);
                settings.onShutdown(() => dataSource.destroy());
            }
        })
        .catch((err) => {
            console.log(`Error connecting to Mongo DB ${err}`);
        });
};

export const getDataSource = async () => {
    if (!dataSource.isInitialized) {
        await mongoLoader();
    }

    return dataSource;
};
