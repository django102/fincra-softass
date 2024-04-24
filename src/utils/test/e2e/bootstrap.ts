import * as http from "http";

import { Application } from "express";
import { bootstrapMicroframework } from "microframework-w3tec";

import { catchAllLoader } from "../../../loaders/catchAllLoader";
import { eventDispatchLoader } from "../../../loaders/eventDispatchLoader";
import { expressLoader } from "../../../loaders/expressLoader";
import { iocLoader } from "../../../loaders/iocLoader";
import { metricsLoader } from "../../../loaders/metricsLoader";
import { winstonLoader } from "../../../loaders/winstonLoader";

import { dbLoader } from "./databasesLoader";

export interface BootstrapSettings {
  app: Application;
  server: http.Server;
  connection: any;
}

export const bootstrapApp = async (): Promise<BootstrapSettings> => {
    return bootstrapMicroframework({
        loaders: [
            winstonLoader,
            iocLoader,
            eventDispatchLoader,
            dbLoader,
            metricsLoader,
            expressLoader,
            catchAllLoader,
        ],
    }).then((framework) => {
        return {
            app: framework.settings.getData("express_app") as Application,
            server: framework.settings.getData("express_server") as http.Server,
            connection: framework.settings.getData("mongoConnection"),
        } as BootstrapSettings;

    });
};
