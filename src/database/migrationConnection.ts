import { DataSource, DataSourceOptions } from "typeorm";

import { env } from "../env";

const connectionOptions: DataSourceOptions = {
    type: env.db.mysql.type as any || "mysql",
    host: env.db.mysql.host,
    port: +env.db.mysql.port,
    username: env.db.mysql.username,
    password: env.db.mysql.password,
    database: env.db.mysql.database,
    synchronize: false,
    logging: true,
    entities: env.app.dirs.mysql.entities,
    migrations: env.app.dirs.mysql.migrations,
    migrationsTableName: "zzz_migrations",
    multipleStatements: true,
};

export default new DataSource({ ...connectionOptions });