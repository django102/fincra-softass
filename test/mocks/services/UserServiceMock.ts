import UserService from "../../../src/api/services/UserService";
import { LogMock } from "../../../src/utils/test/unit/LogMock";

import AuthenticationServiceMock from "./AuthenticationServiceMock";

export default class UserServiceMock {
    public static logger = new LogMock();
    public static authenticationService = AuthenticationServiceMock.getInstance();

    public static getInstance(
    ): UserService {
        return new UserService(
            this.logger,
            this.authenticationService
        );
    }
}