import { IsString } from "class-validator";

import WalletRequest from "./WalletRequest";

export default class WalletTransferRequest extends WalletRequest {
    @IsString({ message: "Destination Account Number is required" })
        destinationAccountNumber: string;
}