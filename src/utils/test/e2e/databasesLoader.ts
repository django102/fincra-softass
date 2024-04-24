
import { MicroframeworkLoader, MicroframeworkSettings } from "microframework-w3tec";

import { createMongoConnection, createMysqlConnection } from "../../database";

export const dbLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    await createMongoConnection().then((connection) => {
        if (settings) {
            settings.setData("mongoConnection", connection);
            settings.onShutdown(() => connection.destroy());
        }

    });
    await createMysqlConnection().then((connection) => {
        if (settings) {
            settings.setData("defaultConnection", connection);
            settings.onShutdown(() => connection.destroy());
        }
    });
};
