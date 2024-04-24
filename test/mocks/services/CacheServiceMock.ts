import CacheService from "../../../src/api/services/CacheService";
import { LogMock } from "../../../src/utils/test/unit/LogMock";

export default class CacheServiceMock {
    public static logger = new LogMock();

    public static getInstance(
    ): CacheService {
        return new CacheService(
            this.logger,
        );
    }
}