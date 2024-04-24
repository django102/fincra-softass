import { Body, HttpCode, JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import UserService from "../../api/services/UserService";
import { ResponseStatus } from "../enums/ResponseStatus";
import IResponse from "../interfaces/IResponse";
import CreateUserRequest from "../requests/payloads/CreateUserRequest";
import LoginRequest from "../requests/payloads/LoginRequest";
import { ErrorResponse, SuccessResponse } from "../responses";

@JsonController("/user")
export default class UserController {
    constructor(
        private userService: UserService,
    ) { }


    @OpenAPI({ summary: "User Registration" })
    @HttpCode(ResponseStatus.CREATED)
    @Post()
    public async create(
        @Body({ required: true, validate: true, type: CreateUserRequest }) payload: CreateUserRequest
    ): Promise<IResponse> {
        const response = await this.userService.create(payload);
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        return Promise.resolve(new SuccessResponse(response.message, response.data));
    }


    @OpenAPI({ summary: "User Login" })
    @Post("/login")
    public async login(
        @Body({
            required: true,
            validate: true,
            type: LoginRequest
        }) payload: LoginRequest
    ): Promise<IResponse> {
        const { email, password } = payload;

        const response = await this.userService.login(email, password);
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        return Promise.resolve(new SuccessResponse(response.message, response.data));
    }
}