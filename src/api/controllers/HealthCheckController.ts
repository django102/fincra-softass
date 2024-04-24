import { Get, JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import IResponse from "../interfaces/IResponse";
import { SuccessResponse } from "../responses";


@JsonController("/health")
export default class HealthController {
    @OpenAPI({ summary: "Run Health Check" })
    @Post()
    public async healthCheckPost( ): Promise<IResponse> {
        return Promise.resolve(new SuccessResponse("Applicaton is running"));
    }

    @OpenAPI({ summary: "Run Health Check" })
    @Get()
    public async healthCheckGet( ): Promise<IResponse> {
        return Promise.resolve(new SuccessResponse("Applicaton is running"));
    }
}