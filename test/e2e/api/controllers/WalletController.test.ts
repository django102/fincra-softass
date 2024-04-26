import { ValidationError } from "class-validator";
import * as express from "express";
import { Action, HttpError } from "routing-controllers";
import request from "supertest";

import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import { ServiceResponse } from "../../../../src/api/responses";
import AuthenticationService from "../../../../src/api/services/AuthenticationService";
import WalletService from "../../../../src/api/services/WalletService";
import { ResponseInterceptor } from "../../../../src/interceptors/ResponseInterceptor";
import { ErrorHandlerMiddleware } from "../../../../src/middlewares/ErrorHandlerMiddleware";
import { LogMiddleware } from "../../../../src/middlewares/LogMiddleware";
import { bootstrapApp, BootstrapSettings } from "../../../../src/utils/test/e2e/bootstrap";


describe("/wallet", () => {
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


    describe("POST /", () => {
        let createWalletMock: jest.SpyInstance;   

        beforeAll(() => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: true, message: "Validation successful", data: { id: 1, firstName: "me", lastName: "you", email: "hello@me.com" }
            });
        });

        beforeEach(() => {
            createWalletMock = jest.spyOn(WalletService.prototype, "createUserWallet");
        });


        it("should create a wallet successfully", async () => {
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.CREATED,
                status: true,
                message: "OK",
                data: { id: 1, accountNumber: "0000012345" },
            };

            createWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/wallet")
                .send();

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should handle error when creating a wallet", async () => {
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            createWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/wallet")
                .send();

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });

        it("should fail if authorization fails", async () => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: false, message: "Some error"
            });
           
            const response = await request(settings.app)
                .post("/wallet")
                .send();

            expect(response.status).toBe(ResponseStatus.UNAUTHORIZED);
            expect(response.body.status).toEqual(false);
        });
    });

    describe("GET /:accountNumber", () => {
        let getWalletMock: jest.SpyInstance;   

        beforeAll(() => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: true, message: "Validation successful", data: { id: 1, firstName: "me", lastName: "you", email: "hello@me.com" }
            });
        });

        beforeEach(() => {
            getWalletMock = jest.spyOn(WalletService.prototype, "getWallet");
        });

        it("should retrieve a wallet successfully", async () => {
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.OK,
                status: true,
                message: "Wallet retrieved successfully",
                data: { id: 1, accountNumber: "0000012345" },
            };

            getWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .get("/wallet/0000012345")
                .send();

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail when account number is not supplied in the URL", async () => {
            const response = await request(settings.app)
                .get("/wallet")
                .send();

            expect(response.status).toBe(ResponseStatus.NOT_FOUND);
            expect(response.body.status).toEqual(false);
        });

        it("should handle error when retrieving a wallet", async () => {
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            getWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .get("/wallet/0000012345")
                .send();

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });

        it("should fail if authorization fails", async () => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: false, message: "Some error"
            });
           
            const response = await request(settings.app)
                .get("/wallet/0000012345")
                .send();

            expect(response.status).toBe(ResponseStatus.UNAUTHORIZED);
            expect(response.body.status).toEqual(false);
        });
    });

    describe("POST /fund", () => {
        let fundWalletMock: jest.SpyInstance;   

        beforeAll(() => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: true, message: "Validation successful", data: { id: 1, firstName: "me", lastName: "you", email: "hello@me.com" }
            });
        });

        beforeEach(() => {
            fundWalletMock = jest.spyOn(WalletService.prototype, "fundWallet");
        });


        it("should fund a wallet successfully", async () => {
            const mockWalletRequest = { accountNumber: "0000012345", amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.OK,
                status: true,
                message: "OK",
                data: { id: 1, accountNumber: "0000012345" },
            };

            fundWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail if account number is missing", async () => {
            const mockWalletRequest = { amount: 20000 };
            const response = await request(settings.app)
                .post("/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail if amount is missing", async () => {
            const mockWalletRequest = { accountNumber: "0000012345" };
            const response = await request(settings.app)
                .post("/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should handle error when funding a wallet", async () => {
            const mockWalletRequest = { accountNumber: "0000012345", amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            fundWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });

        it("should fail if authorization fails", async () => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: false, message: "Some error"
            });
            const mockWalletRequest = { accountNumber: "0000012345", amount: 20000 };

            const response = await request(settings.app)
                .post("/wallet/fund")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.UNAUTHORIZED);
            expect(response.body.status).toEqual(false);
        });
    });

    describe("POST /withdraw", () => {
        let withdrawWalletMock: jest.SpyInstance;   

        beforeAll(() => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: true, message: "Validation successful", data: { id: 1, firstName: "me", lastName: "you", email: "hello@me.com" }
            });
        });

        beforeEach(() => {
            withdrawWalletMock = jest.spyOn(WalletService.prototype, "withdrawFromWallet");
        });


        it("should withdraw from a wallet successfully", async () => {
            const mockWalletRequest = { accountNumber: "0000012345", amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.OK,
                status: true,
                message: "OK",
                data: { id: 1, accountNumber: "0000012345" },
            };

            withdrawWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail if account number is missing", async () => {
            const mockWalletRequest = { amount: 20000 };
            const response = await request(settings.app)
                .post("/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail if amount is missing", async () => {
            const mockWalletRequest = { accountNumber: "0000012345" };
            const response = await request(settings.app)
                .post("/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should handle error when withdrawing from a wallet", async () => {
            const mockWalletRequest = { accountNumber: "0000012345", amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            withdrawWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });

        it("should fail if authorization fails", async () => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: false, message: "Some error"
            });
            const mockWalletRequest = { accountNumber: "0000012345", amount: 20000 };

            const response = await request(settings.app)
                .post("/wallet/withdraw")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.UNAUTHORIZED);
            expect(response.body.status).toEqual(false);
        });
    });

    describe("POST /transfer", () => {
        let transferWalletMock: jest.SpyInstance;   

        beforeAll(() => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: true, message: "Validation successful", data: { id: 1, firstName: "me", lastName: "you", email: "hello@me.com" }
            });
        });

        beforeEach(() => {
            transferWalletMock = jest.spyOn(WalletService.prototype, "transferBetweenWallets");
        });


        it("should transfer between wallets successfully", async () => {
            const mockWalletRequest = { accountNumber: "0000012345", destinationAccountNumber: "0000012346", amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.OK,
                status: true,
                message: "OK",
                data: { id: 1, accountNumber: "0000012345" },
            };

            transferWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
            expect(response.body.message).toEqual(mockResponse.message);
        });

        it("should fail if account number is missing", async () => {
            const mockWalletRequest = { destinationAccountNumber: "0000012346", amount: 20000 };
            const response = await request(settings.app)
                .post("/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail if destination account number is missing", async () => {
            const mockWalletRequest = { accountNumber: "0000012346", amount: 20000 };
            const response = await request(settings.app)
                .post("/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should fail if amount is missing", async () => {
            const mockWalletRequest = { accountNumber: "0000012345", destinationAccountNumber: "0000012346" };
            const response = await request(settings.app)
                .post("/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.BAD_REQUEST);
            expect(response.body.status).toEqual(false);
        });

        it("should handle error when transfering from a wallet", async () => {
            const mockWalletRequest = { accountNumber: "0000012345", destinationAccountNumber: "0000012346", amount: 20000 };
            const mockResponse: ServiceResponse = {
                code: ResponseStatus.INTERNAL_SERVER_ERROR,
                status: false,
            };

            transferWalletMock.mockResolvedValue(Promise.resolve(mockResponse));

            const response = await request(settings.app)
                .post("/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(mockResponse.code);
            expect(response.body.status).toEqual(mockResponse.status);
        });

        it("should fail if authorization fails", async () => {
            jest.spyOn(AuthenticationService.prototype, "validateAuthorization").mockResolvedValue({
                status: false, message: "Some error"
            });
            const mockWalletRequest = { accountNumber: "0000012345", destinationAccountNumber: "0000012346", amount: 20000 };

            const response = await request(settings.app)
                .post("/wallet/transfer")
                .send(mockWalletRequest);

            expect(response.status).toBe(ResponseStatus.UNAUTHORIZED);
            expect(response.body.status).toEqual(false);
        });
    });
});