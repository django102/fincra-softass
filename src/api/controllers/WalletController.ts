import { Authorized, Body, Get, HttpCode, JsonController, Param, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";

import { GetHeaders } from "../../decorators/GetHeaders";
import { ResponseStatus } from "../enums/ResponseStatus";
import IResponse from "../interfaces/IResponse";
import WalletRequest from "../requests/payloads/WalletRequest";
import WalletTransferRequest from "../requests/payloads/WalletTransferRequest";
import { ErrorResponse, SuccessResponse } from "../responses";
import WalletService from "../services/WalletService";

@JsonController("/wallet")
export default class WalletController {
    constructor(
        private walletService: WalletService,
    ) { }


    @OpenAPI({ summary: "Create Wallet", security: [{ bearerAuth: [] }] })
    @HttpCode(ResponseStatus.CREATED)
    @Authorized()
    @Post()
    public async createWallet(
        @GetHeaders() headers: any
    ): Promise<IResponse> {
        this.walletService.setCurrentRequestHeaders(headers);

        const response = await this.walletService.createUserWallet();
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        return Promise.resolve(new SuccessResponse(response.message, response.data));
    }

    @OpenAPI({ summary: "Get Wallet", security: [{ bearerAuth: [] }] })
    @Authorized()
    @Get("/:accountNumber")
    public async getWallet(
        @Param("accountNumber") accountNumber: string,
        @GetHeaders() headers: any
    ): Promise<IResponse> {
        this.walletService.setCurrentRequestHeaders(headers);

        const response = await this.walletService.getWallet(accountNumber);
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        return Promise.resolve(new SuccessResponse(response.message, response.data));
    }

    @OpenAPI({ summary: "Fund Wallet", security: [{ bearerAuth: [] }] })
    @Authorized()
    @Post("/fund")
    public async fundWallet(
        @Body({ required: true, validate: true, type: WalletRequest }) payload: WalletRequest,
        @GetHeaders() headers: any
    ): Promise<IResponse> {
        this.walletService.setCurrentRequestHeaders(headers);

        const { accountNumber, amount } = payload;

        const response = await this.walletService.fundWallet(accountNumber, amount);
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        return Promise.resolve(new SuccessResponse(response.message, response.data));
    }

    @OpenAPI({ summary: "Withdraw From Wallet", security: [{ bearerAuth: [] }] })
    @Authorized()
    @Post("/withdraw")
    public async withdrawFromWallet(
        @Body({ required: true, validate: true, type: WalletRequest }) payload: WalletRequest,
        @GetHeaders() headers: any
    ): Promise<IResponse> {
        this.walletService.setCurrentRequestHeaders(headers);

        const { accountNumber, amount } = payload;

        const response = await this.walletService.withdrawFromWallet(accountNumber, amount);
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        return Promise.resolve(new SuccessResponse(response.message, response.data));
    }

    @OpenAPI({ summary: "Transfer Between Wallets", security: [{ bearerAuth: [] }] })
    @Authorized()
    @Post("/transfer")
    public async transferBetweenWallets(
        @Body({ required: true, validate: true, type: WalletTransferRequest }) payload: WalletTransferRequest,
        @GetHeaders() headers: any
    ): Promise<IResponse> {
        this.walletService.setCurrentRequestHeaders(headers);

        const { accountNumber, destinationAccountNumber, amount } = payload;

        const response = await this.walletService.transferBetweenWallets(accountNumber, destinationAccountNumber, amount);
        if (!response.status) {
            return Promise.reject(new ErrorResponse(response.message, response.code, response.data));
        }

        return Promise.resolve(new SuccessResponse(response.message, response.data));
    }
}