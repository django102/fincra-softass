import { ValidationError } from "class-validator";
import * as express from "express";
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from "routing-controllers";

import { ResponseStatus } from "../api/enums/ResponseStatus";
import { Logger, LoggerInterface } from "../decorators/Logger";
import { env } from "../env";
// import { ValidationError as ErrorMessage, ValidationErrorCode } from "../validation";


@Middleware({ type: "after" })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    constructor(
        @Logger() private log: LoggerInterface
    ) { }


    public error(error: HttpError, request: express.Request, response: any): void {
        response.status(error.httpCode ? error.httpCode : ResponseStatus.INTERNAL_SERVER_ERROR);

        const responseJson: any = {
            status: false,
            message: error.message,
        };

        if (error["errors"]) {
            if (error["errors"].length && error["errors"][0] instanceof ValidationError) {
                // responseJson.errors = this.handleValidationErrors(error["errors"]);
                responseJson.message = this.handleValidationErrors(error["errors"]);
                response.message = responseJson.errors;
            } else {
                // responseJson.errors = error["errors"];
                responseJson.message = error["errors"];
            }
        }

        this.logError(request, responseJson.message, this.log);

        response.json(responseJson);
    }

    /**
    * @param validationErrors ValidationError[]
    * @param errorBag
    * @returns Record<string, ErrorMessage[]>
    */
    private handleValidationErrors(
        validationErrors: ValidationError[],
        errors: string = "",
    ): string {

        validationErrors.forEach((error: ValidationError) => {
            if (typeof error.constraints === "object") {
                errors = this.formatValidationErrors(error.constraints);
            }
            if (error.children && error.children.length) {
                errors = this.handleValidationErrors(error.children);
            }
        });

        return errors;
    }

    /**
     * @param constraints Record<string, any>
     * @returns ErrorMessage[]
     */
    private formatValidationErrors(constraints: Record<string, any>): string {
        const errors: string[] = [];

        Object.keys(constraints).forEach((key: string) => {
            errors.push(constraints[key]);
        });

        return errors.toString();
    }

    private logError = (req: any, error: any, log: LoggerInterface) => {
        const startTime = req._startTime || new Date();
        const rightNow: any = new Date();
        const ageSinceRequestStart = rightNow - startTime;

        if (!req._startTime) req._startTime = startTime;

        const payload = {
            service: env.app.name,
            type: "error",
            created: startTime,
            age: req.headers.age ? req.headers.age + ageSinceRequestStart : ageSinceRequestStart,
            endpoint: req.url,
            tag: req.headers["tag"],
            payload: {
                verb: req.method,
                client: req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"].split(",")[0] : req.connection.remoteAddress,
                headers: req.headers,
                body: req.body,
                param: req.param,
                query: req.query
            },
            error
        };

        log.error("error", payload);
    };


    // public error(error: HttpError, request: express.Request, response: any): void {
    //     // const name = error.name;
    //     // const message = error.message;
    //     // const stack = error.stack !== undefined ? error.stack.split("\n") : [];

    //     // if (!env.isTest) 
    //     // console.log("logging here");
    //     // console.log("Name  ", error.name);
    //     // console.log("Message  ", error.message);
    //     // console.log("Stack  ", error.stack);
    //     // this.log.error(name, request.originalUrl, message, stack);
    //     // }

    //     response.status(error.httpCode ? error.httpCode : ResponseStatus.INTERNAL_SERVER_ERROR);

    //     const responseJson: any = {
    //         status: false,
    //         message: error.message,
    //     };

    //     if (error["errors"]) {
    //         if (error["errors"].length && error["errors"][0] instanceof ValidationError) {
    //             responseJson.errors = this.handleValidationErrors(error["errors"]);
    //             response.message = "Invalid or missing required values!";
    //         } else {
    //             responseJson.errors = error["errors"];
    //         }
    //     }

    //     this.logError(request, responseJson, this.log);

    //     response.json(responseJson);
    // }

    // /**
    //  * @param validationErrors ValidationError[]
    //  * @param errorBag
    //  * @returns Record<string, ErrorMessage[]>
    //  */
    // private handleValidationErrors(
    //     validationErrors: ValidationError[],
    //     errorBag: Record<string, any> = {},
    // ): Record<string, ErrorMessage[] | Record<string, ErrorMessage>> {

    //     validationErrors.forEach((error: ValidationError) => {
    //         if (typeof error.constraints === "object") {
    //             errorBag[error.property] = this.formatValidationErrors(error.constraints);
    //         }
    //         if (error.children && error.children.length) {
    //             errorBag[error.property] = this.handleValidationErrors(error.children);
    //         }
    //     });

    //     return errorBag;
    // }

    // /**
    //  * @param constraints Record<string, any>
    //  * @returns ErrorMessage[]
    //  */
    // private formatValidationErrors(constraints: Record<string, any>): ErrorMessage[] {
    //     const errors: ErrorMessage[] = [];

    //     Object.keys(constraints).forEach((key: string) => {
    //         errors.push(
    //             new ErrorMessage(
    //                 constraints[key],
    //                 "",
    //                 key === "isDefined" ? ValidationErrorCode.REQUIRED : ValidationErrorCode.VALUE_ERROR,
    //             )
    //         );
    //     });

    //     return errors;
    // }
}
