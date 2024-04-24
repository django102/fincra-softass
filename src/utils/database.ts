import { MongoMemoryServer } from "mongodb-memory-server";
import Container from "typedi";
import { DataSource } from "typeorm";

import { env } from "../env";


export const createMongoConnection = async (): Promise<DataSource> => {
    const server = await MongoMemoryServer.create();
    const url = server.getUri();
  
    const dataSource = new DataSource({
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
  
    Container.set("mongoConnection", dataSource);
  
    await dataSource.initialize();
    return dataSource;
};
  
export const createMysqlConnection = async (): Promise<DataSource> => {
    const dataSource = new DataSource({
        type: env.db.mysql.type as any,
        replication: {
            master: {
                username: env.db.mysql.username,
                password: env.db.mysql.password,
                host: env.db.mysql.host,
                database: env.db.mysql.database,
                port: env.db.mysql.port,
            },
            slaves: [
                {
                    username: env.db.mysql.username,
                    password: env.db.mysql.password,
                    host: env.db.mysql.host,
                    database: env.db.mysql.database,
                    port: env.db.mysql.port,
                }
            ]
        }
    });
    await dataSource.initialize();
    Container.set("defaultConnection", dataSource);
    return dataSource;
};

export const dropDatabase = (connection: DataSource) => {
    return connection.dropDatabase();
};

export const closeDatabase = (connection: DataSource) => {
    return connection.close();
};
