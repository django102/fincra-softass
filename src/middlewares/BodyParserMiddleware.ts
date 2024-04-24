import * as bodyParser from "body-parser";
import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";


@Middleware({
    type: "before",
    priority: 5
})
export class BodyParser implements ExpressMiddlewareInterface {
    private jsonBodyParser;

    constructor() {
        this.jsonBodyParser = bodyParser.json();
    }

    use(req: Request, res: Response, next: NextFunction) {
        this.jsonBodyParser(req, res, next);
    }
}