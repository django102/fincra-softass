import { ValidationError } from "class-validator";
import * as express from "express";
import { Action, HttpError } from "routing-controllers";
import request from "supertest";

import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import { ResponseInterceptor } from "../../../../src/interceptors/ResponseInterceptor";
import { ErrorHandlerMiddleware } from "../../../../src/middlewares/ErrorHandlerMiddleware";
import { LogMiddleware } from "../../../../src/middlewares/LogMiddleware";
import { bootstrapApp, BootstrapSettings } from "../../../../src/utils/test/e2e/bootstrap";

describe("/ping", () => {
    let settings: BootstrapSettings;

    beforeAll(async () => {
        settings = await bootstrapApp();

        jest.spyOn(LogMiddleware.prototype, "use").mockImplementation((req: express.Request, res: express.Response, next: express.NextFunction) => {    
            next();
        });
        jest.spyOn(ResponseInterceptor.prototype, "intercept").mockImplementation((action: Action, content: any) => {
            return content;
        });
        jest.spyOn(ErrorHandlerMiddleware.prototype, "error").mockImplementation((error: HttpError, request: express.Request, response: any)=>{
            response.status(error.httpCode ? error.httpCode : ResponseStatus.INTERNAL_SERVER_ERROR);
            const responseJson: any = {
                status: false,
                message: error.message,
            };
            if (error["errors"]) {
                if (error["errors"].length && error["errors"][0] instanceof ValidationError) {
                    responseJson.message = "some validation response errors";
                    response.message = responseJson.errors;
                } else {
                    responseJson.message = error["errors"];
                }
            }
            response.json(responseJson);
        });
    });
    afterAll(async () => {
        if (settings.connection) {
            await settings.connection.dropDatabase();
            await settings.connection.close();
        }

        jest.clearAllMocks();
    });

    describe("POST /", ()=>{
        it("should call ping successfully", async () => {              
            const response = await request(settings.app)
                .post("/ping")
                .send();

            expect(response.status).toBe(ResponseStatus.OK);
            expect(response.body.status).toEqual(true);
        });
    });

    describe("GET /", ()=>{
        it("should call ping successfully", async () => {              
            const response = await request(settings.app)
                .get("/ping")
                .send();

            expect(response.status).toBe(ResponseStatus.OK);
            expect(response.body.status).toEqual(true);
        });
    });
});