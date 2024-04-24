import jwt from "jsonwebtoken";
import moment from "moment";
import { Service } from "typedi";

import { env } from "../../env";
import { ResponseStatus } from "../enums/ResponseStatus";
import AuthenticatedParty from "../models/AuthenticatedParty";


@Service()
export default class AuthenticationService {
    constructor(){}


    public issueToken(data:Record<string, any>, expiresIn: number = 86400): string {
        if(!data) return null;

        return jwt.sign({ data }, env.constants.jwtHasher, { expiresIn });
    }

    public verifyToken(token: string): Record<string, any> {
        if(!token) return null;

        return jwt.verify(token, env.constants.jwtHasher);
    }

    public async validateAuthorization(headers: Record<string, any>): Promise<Record<string, any>> {
        try {
            const authParty: AuthenticatedParty = new AuthenticatedParty();

            const { authorization } = headers;

            if(!authorization)
                return { status: false, message: "No authorization", code: ResponseStatus.UNAUTHORIZED };

            if (!authorization.startsWith("Bearer ")) 
                return { status: false, message: "Authorization format is 'Bearer xxxxxx'", code: ResponseStatus.UNAUTHORIZED };

            const auth = authorization.split(" ")[1];

            if (!auth) 
                return { status: false, message: "Invalid Authorization", code: ResponseStatus.UNAUTHORIZED };

            const decodedJwt = this.verifyToken(auth);
            const expiry = moment.unix(decodedJwt.exp);
            const now = moment();

            if (now.isAfter(expiry))
                return { status: false, message: "Expired token. Please log in", code: ResponseStatus.UNAUTHORIZED };

            const { email, id, role, firstName, lastName } = decodedJwt.data;
            Object.assign(authParty, { email, id, role, firstName, lastName });

            return { status: true, message: "Validation successful", data: authParty };
        } catch (err: any) {
            // console.log(err);
            return { status: false, message: err.message };
        }
    }
}