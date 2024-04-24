import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import { ErrorResponse, NotFoundResponse, Response, ServiceResponse, SuccessResponse } from "../../../../src/api/responses";

describe("Responses", () => {
    describe("GenericResponse", () => {
        it("should create a response object with status, message, and data", () => {
            const response = new Response(true, "Success", { id: 1 });
            expect(response.status).toBe(true);
            expect(response.message).toBe("Success");
            expect(response.data).toEqual({ id: 1 });
        });
    });

    describe("SuccessResponse", () => {
        it("should create a success response object with status, message, and data", () => {
            const successResponse = new SuccessResponse("Data retrieved successfully", { id: 1 });
            expect(successResponse.status).toBe(true);
            expect(successResponse.message).toBe("Data retrieved successfully");
            expect(successResponse.data).toEqual({ id: 1 });
        });
    });

    describe("ErrorResponse", () => {
        it("should create an error response object with status, message, and code", () => {
            const errorResponse = new ErrorResponse("Internal Server Error", 500);
            expect(errorResponse.status).toBe(false);
            expect(errorResponse.message).toBe("Internal Server Error");
            expect(errorResponse.httpCode).toBe(ResponseStatus.INTERNAL_SERVER_ERROR);
        });

        it("should create an error response object with status and code, and use the default message when no message is passed", () => {
            const errorResponse = new ErrorResponse(null, 500);
            expect(errorResponse.status).toBe(false);
            expect(errorResponse.message).toBe("Oops; something went wrong, please try again later!");
            expect(errorResponse.httpCode).toBe(ResponseStatus.INTERNAL_SERVER_ERROR);
        });

        it("should create an error response object when nothing is passed to the constructor", () => {
            const errorResponse = new ErrorResponse();
            expect(errorResponse.status).toBe(false);
            expect(errorResponse.message).toBe("Oops; something went wrong, please try again later!");
            expect(errorResponse.httpCode).toBe(ResponseStatus.INTERNAL_SERVER_ERROR);
        });
    });

    describe("NotFoundResponse", () => {
        it("should create a not found response object with status, message, and data", () => {
            const notFoundResponse = new NotFoundResponse("Resource not found", { id: 1 });
            expect(notFoundResponse.status).toBe(false);
            expect(notFoundResponse.message).toBe("Resource not found");
            expect(notFoundResponse.errors).toEqual({ id: 1 });
            expect(notFoundResponse.httpCode).toBe(ResponseStatus.NOT_FOUND);
        });
    });

    describe("ServiceResponse", () => {
        it("should create a success service response object with status, code, message, and data", () => {
            const serviceSuccessResponse = ServiceResponse.success("Data retrieved successfully", { id: 1 });
            expect(serviceSuccessResponse.status).toBe(true);
            expect(serviceSuccessResponse.code).toBe(ResponseStatus.OK);
            expect(serviceSuccessResponse.message).toBe("Data retrieved successfully");
            expect(serviceSuccessResponse.data).toEqual({ id: 1 });
        });

        it("should create an error service response object with status, code, message, and data", () => {
            const serviceErrorResponse = ServiceResponse.error("Internal Server Error", 500, { id: 1 });
            expect(serviceErrorResponse.status).toBe(false);
            expect(serviceErrorResponse.code).toBe(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(serviceErrorResponse.message).toBe("Internal Server Error");
            expect(serviceErrorResponse.data).toEqual({ id: 1 });
        });

        it("should create an error service response object with default message and code if not provided", () => {
            const serviceErrorResponse = ServiceResponse.error();
            expect(serviceErrorResponse.status).toBe(false);
            expect(serviceErrorResponse.code).toBe(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(serviceErrorResponse.message).toBe("Oops; something went wrong, please try again later!");
        });
    });
});
