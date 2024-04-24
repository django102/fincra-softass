import { JsonController, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import IResponse from "../interfaces/IResponse";
import { SuccessResponse } from "../responses";


@OpenAPI({ summary: "Run Health Check" })
@JsonController("/health")
export default class HealthController {
  @Post()
    public async healthCheck( ): Promise<IResponse> {
        return Promise.resolve(new SuccessResponse("Applicaton is running"));
    }
}