
import { IsNumber, IsString } from "class-validator";


export default class WalletRequest {
    @IsString({ message: "Account Number is required" })
        accountNumber: string;

    @IsNumber({}, { message: "Amount is required" })
        amount: number;
}