import { HttpError } from "routing-controllers";

import { ResponseStatus } from "../enums/ResponseStatus";
import IResponse from "../interfaces/IResponse";


// Generic API responses
export class Response implements IResponse {
    status: boolean;
    message: string;
    data: Record<string, any>;
    meta: Record<string, any>;
    constructor(status: boolean, message: string, data?: Record<string, any>, meta?: Record<string, any>) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.meta = meta;
    }
}

export class SuccessResponse extends Response {
    constructor(message: string, data?: Record<string, any>, meta?: Record<string, any>) {
        super(true, message, data, meta);
    }
}

// Generic Error response
export class ErrorResponse extends HttpError {
    status: boolean;
    name: string;
    errors: any;
    constructor(message?: string, code?: number, errors?: any) {
        const httpCode: number = code ? code : ResponseStatus.INTERNAL_SERVER_ERROR;
        super(httpCode, message || "Oops; something went wrong, please try again later!");
        this.status = false;
        this.errors = errors;
    }
}

// Not found error repsonse
export class NotFoundResponse extends ErrorResponse {
    constructor(message: string, data?: any) {
        super(message, ResponseStatus.NOT_FOUND, data);
    }
}

// Service response
export class ServiceResponse<T = any, U = any> {
    constructor(
    public status: boolean,
    public code: ResponseStatus,
    public message?: string,
    public data?: T,
    public meta?: U
    ) {}

    static success<T = any, U = any>(
        message?: string,
        data?: T,
        meta?: U,
        code: ResponseStatus = ResponseStatus.OK
    ) {
        return new ServiceResponse(true, code, message, data, meta);
    }

    static error(
        message?: string,
        code?: ResponseStatus,
        data?: Record<any, any>
    ) {
        return new ServiceResponse(
            false,
            code || ResponseStatus.INTERNAL_SERVER_ERROR,
            message || "Oops; something went wrong, please try again later!",
            data
        );
    }
}
