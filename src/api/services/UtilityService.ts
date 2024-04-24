import bcrypt from "bcryptjs";
import Chance from "chance";

import { CharacterCasing } from "../enums/CharacterCasing";


const chance = new Chance();


export default class UtilityService {
    public static async hashPassword(input :string) :Promise<string> {
        if(!input){
            return "";
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(input, salt);

        return hashedPassword;
    }

    public static async comparePassword(input:string, hashedPassword:string):Promise<boolean>{
        const isSame = await bcrypt.compare(input, hashedPassword);
        return isSame;
    }

    public static generateRandomString(length: number = 36, casing: CharacterCasing = CharacterCasing.LOWER) {
        if(length <= 0){
            return "";
        }

        const randomString = chance.string({ length, casing, alpha: true, numeric: true });
        return randomString;
    }
}