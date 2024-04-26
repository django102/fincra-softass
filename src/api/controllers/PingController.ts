import moment from "moment";
import momentTz from "moment-timezone";
import { Get, JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import IResponse from "../interfaces/IResponse";
import { SuccessResponse } from "../responses";


@JsonController("/ping")
export default class PingController {
    @OpenAPI({ summary: "Ping" })
    @Post()
    public async healthCheckPost( ): Promise<IResponse> {
        return Promise.resolve(new SuccessResponse(`Application pinged at ${momentTz.tz(moment(), "Africa/Lagos").format("MMMM Do YYYY, h:mm:ss a")}`));
    }

    @OpenAPI({ summary: "Ping" })
    @Get()
    public async healthCheckGet( ): Promise<IResponse> {
        return Promise.resolve(new SuccessResponse(`Application pinged at ${momentTz.tz(moment(), "Africa/Lagos").format("MMMM Do YYYY, h:mm:ss a")}`));
    }
}