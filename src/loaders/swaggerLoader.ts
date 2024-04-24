import * as path from "path";

import { MicroframeworkLoader, MicroframeworkSettings } from "microframework-w3tec";
import * as swStats from "swagger-stats";
import * as swaggerUi from "swagger-ui-express";

import { env } from "../env";


export const swaggerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings && env.swagger.enabled) {
        const expressApp = settings.getData("express_app");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const swaggerFile = require(path.join(__dirname, "..", env.swagger.file));

        // Add npm infos to the swagger doc
        swaggerFile.info = {
            title: env.app.displayName,
            description: env.app.description,
            version: env.app.version,
        };
        swaggerFile.servers = [
            {
                url: "/",
            },
        ];

        expressApp.use(swStats.getMiddleware({ swaggerSpec: swaggerFile }));

        expressApp.use(
            env.swagger.route,
            swaggerUi.serve,
            swaggerUi.setup(swaggerFile)
        );

    }
};
