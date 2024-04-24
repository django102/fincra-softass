import * as express from "express";
import morgan from "morgan";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

import { env } from "../env";
import { Logger } from "../lib/logger";
// import { setSpanTags } from "../loaders/datadogLoader";


@Middleware({ type: "before" })
export class LogMiddleware implements ExpressMiddlewareInterface {
    private log = new Logger();

    public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
        this.logRequest(req, this.log);
        // this.logRequest(req);
        return morgan(env.log.output, {
            stream: {
                write: this.log.info.bind(this.log),
            },
        })(req, res, next);
    }

    private logRequest = (req: any, log: Logger) => {
        // private logRequest = (req: any) => {
        const startTime = req._startTime || new Date();
        const rightNow: any = new Date();
        const ageSinceRequestStart = rightNow - startTime;

        if (!req._startTime) req._startTime = startTime;

        const payload = {
            service: env.app.name,
            type: "request",
            created: startTime,
            age: req.headers.age ? req.headers.age + ageSinceRequestStart : ageSinceRequestStart,
            endpoint: req.url,
            tag: req.headers["tag"],
            payload: {
                verb: req.method,
                client: req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"].split(",")[0] : req.connection.remoteAddress,
                headers: { ...req.headers, ...(req.headers.authorization ? { authorization: "Bearer xyz" } : {}) },
                body: req.body,
                param: req.param,
                query: req.query
            },
        };
        
        // setSpanTags(req, payload, log);
        log.info("request", payload);
    };
}
