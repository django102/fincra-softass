import * as express from "express";
import { MicroframeworkLoader, MicroframeworkSettings } from "microframework-w3tec";


export const catchAllLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    const expressApp = settings.getData("express_app");
    expressApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!res.headersSent) {
            res.status(404);
            res.json({
                status: false,
                message: "Page Not Found: " + req.path,
            });
        }
        next();
    });
};
