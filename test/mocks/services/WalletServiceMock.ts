import WalletService from "../../../src/api/services/WalletService";
import { LogMock } from "../../../src/utils/test/unit/LogMock";

import LedgerServiceMock from "./LedgerServiceMock";


export default class WalletServiceMock {
    public static logger = new LogMock();
    public static ledgerService = LedgerServiceMock.getInstance();

    public static getInstance(
    ): WalletService {
        return new WalletService(
            this.logger,
            this.ledgerService
        );
    }
}