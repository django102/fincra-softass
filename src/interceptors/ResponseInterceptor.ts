import { Action, Interceptor, InterceptorInterface } from "routing-controllers";

import { env } from "../env";
import { Logger } from "../lib/logger";
// import { setSpanTags } from "../loaders/datadogLoader";


@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
    intercept(action: Action, content: any) {
        this.logResponse(action.request, content, new Logger());
        return content;
    }

    private logResponse = (req: any, body: any, log: Logger) => {
        const startTime = req._startTime || new Date();
        const rightNow: any = new Date();
        const ageSinceRequestStart = rightNow - startTime;

        const payload = {
            service: env.app.name,
            type: "response",
            created: startTime,
            age: req.headers.age
                ? req.headers.age + ageSinceRequestStart
                : ageSinceRequestStart,
            endpoint: req.url,
            tag: req.headers["tag"],
            payload: {
                verb: req.method,
                client: req.headers["x-forwarded-for"]
                    ? req.headers["x-forwarded-for"].split(",")[0]
                    : req.connection.remoteAddress,
                body,
            },
        };

        // setSpanTags(req, payload, log);
        log.info("response", payload);
    };
}
