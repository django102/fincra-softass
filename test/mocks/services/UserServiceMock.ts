import UserService from "../../../src/api/services/UserService";
import { LogMock } from "../../../src/utils/test/unit/LogMock";

import AuthenticationServiceMock from "./AuthenticationServiceMock";
import WalletServiceMock from "./WalletServiceMock";

export default class UserServiceMock {
    public static logger = new LogMock();
    public static authenticationService = AuthenticationServiceMock.getInstance();
    public static walletService = WalletServiceMock.getInstance();

    public static getInstance(
    ): UserService {
        return new UserService(
            this.logger,
            this.authenticationService,
            this.walletService
        );
    }
}