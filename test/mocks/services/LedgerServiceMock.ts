import LedgerService from "../../../src/api/services/LedgerService";
import { LogMock } from "../../../src/utils/test/unit/LogMock";


export default class LedgerServiceMock {
    public static logger = new LogMock();

    public static getInstance(
    ): LedgerService {
        return new LedgerService( );
    }
}