import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

import { dataSource } from "../loaders/typeORMLoader";


@Middleware({
    type: "before",
    priority: 10
})
export class DatabaseCheckMiddleware implements ExpressMiddlewareInterface {
    async use(req: Request, res: Response, next: NextFunction) {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }
        next();
    }
}