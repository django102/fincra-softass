import { createParamDecorator } from "routing-controllers";


export function GetHeaders() {
    return createParamDecorator({
        required: false,
        value: action => {
            return {
                "user": action.request.headers["user"],
                "authKey": action.request.headers["authKey"]
            };
        }
    });
}