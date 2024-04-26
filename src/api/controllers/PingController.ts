import moment from "moment";
import { Get, JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import IResponse from "../interfaces/IResponse";
import { SuccessResponse } from "../responses";


@JsonController("/ping")
export default class HealthController {
    @OpenAPI({ summary: "Ping" })
    @Post()
    public async healthCheckPost( ): Promise<IResponse> {
        return Promise.resolve(new SuccessResponse(`Application pinged at ${moment().format("MMMM Do YYYY, h:mm:ss a")}`));
    }

    @OpenAPI({ summary: "Ping" })
    @Get()
    public async healthCheckGet( ): Promise<IResponse> {
        return Promise.resolve(new SuccessResponse(`Application pinged at ${moment().format("MMMM Do YYYY, h:mm:ss a")}`));
    }
}