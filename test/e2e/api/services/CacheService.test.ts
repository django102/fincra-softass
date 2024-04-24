import CacheService from "../../../../src/api/services/CacheService";
import CacheServiceMock from "../../../mocks/services/CacheServiceMock";


describe("CacheService", () => {
    let cacheService: CacheService;
    let loggerMock: jest.SpyInstance;
    let redisClientGetMock: jest.SpyInstance;
    let redisClientSetMock: jest.SpyInstance;
    let redisClientDeleteMock: jest.SpyInstance;

    beforeEach(async () => {
        cacheService = CacheServiceMock.getInstance();
        loggerMock = jest.spyOn(cacheService["log"], "error");
        redisClientGetMock = jest.spyOn(cacheService.client, "getAsync");
        redisClientSetMock = jest.spyOn(cacheService.client, "setAsync");
        redisClientDeleteMock = jest.spyOn(cacheService.client, "delAsync");
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });


    it("should be defined", () => {
        expect(cacheService).toBeDefined();
    });


    describe("setValue", () => {
        it("should set a value in the redis cache", async () => {
            redisClientSetMock.mockResolvedValue(true);

            const result = await cacheService.setValue({
                key: "testKey",
                value: "testValue",
                expire: 10,
            });

            expect(result).toBe(true);
            expect(redisClientSetMock).toHaveBeenCalledWith("testKey", "testValue", "EX", 10);
            expect(loggerMock).not.toHaveBeenCalled();
        });

        it("should set an object value in the redis cache", async () => {
            redisClientSetMock.mockResolvedValue(true);

            const result = await cacheService.setValue({
                key: "testKey",
                value: { hi:"there" },
                expire: 10,
            });

            expect(result).toBe(true);
            expect(redisClientSetMock).toHaveBeenCalledWith("testKey", JSON.stringify({ hi:"there" }), "EX", 10);
            expect(loggerMock).not.toHaveBeenCalled();
        });

        it("should set a value without expiry in the redis cache", async () => {
            redisClientSetMock.mockResolvedValue(true);

            const result = await cacheService.setValue({
                key: "testKey",
                value: "testValue"
            });

            expect(result).toBe(true);
            expect(redisClientSetMock).toHaveBeenCalledWith("testKey", "testValue");
            expect(loggerMock).not.toHaveBeenCalled();
        });

        it("should handle errors when setting a value in the redis cache", async () => {
            const error = new Error("Mock error");
            redisClientSetMock.mockRejectedValue(error);

            const result = await cacheService.setValue({
                key: "testKey",
                value: "testValue",
                expire: 10,
            });

            expect(result).toBe(false);
            expect(redisClientSetMock).toHaveBeenCalledWith("testKey", "testValue", "EX", 10);
            expect(loggerMock).toHaveBeenCalledWith("Compliance: Unable to set Redis item", { err: error });
        });
    });

    describe("getValue", () => {
        it("should get a value from the redis cache", async () => {
            redisClientGetMock.mockResolvedValue("testValue");

            const result = await cacheService.getValue("testKey");

            expect(result).toBe("testValue");
            expect(redisClientGetMock).toHaveBeenCalledWith("testKey");
            expect(loggerMock).not.toHaveBeenCalled();
        });

        it("should handle errors when getting a value from the redis cache", async () => {
            const error = new Error("Mock error");
            redisClientGetMock.mockRejectedValue(error);

            const result = await cacheService.getValue("testKey");

            expect(result).toBe(null);
            expect(redisClientGetMock).toHaveBeenCalledWith("testKey");
            expect(loggerMock).toHaveBeenCalledWith("Compliance: Unable to get Redis item", { err: error });

        });

        it("should parse JSON values", async () => {
            redisClientGetMock.mockResolvedValue("{\"key\": \"value\"}");

            const result = await cacheService.getValue("testKey");

            expect(result).toEqual({ key: "value" });
            expect(redisClientGetMock).toHaveBeenCalledWith("testKey");
            expect(loggerMock).not.toHaveBeenCalled();
        });
    });

    describe("deleteValue", () => {
        it("should delete a value from the redis cache", async () => {
            redisClientDeleteMock.mockResolvedValue(1);

            const result = await cacheService.deleteValue("testKey");

            expect(result).toBe(true);
            expect(redisClientDeleteMock).toHaveBeenCalledWith("testKey");
            expect(loggerMock).not.toHaveBeenCalled();
        });

        it("should handle errors when deleting a value from the redis cache", async () => {
            const error = new Error("Mock error");
            redisClientDeleteMock.mockRejectedValue(error);

            const result = await cacheService.deleteValue("testKey");

            expect(result).toBe(false);
            expect(redisClientDeleteMock).toHaveBeenCalledWith("testKey");
            expect(loggerMock).toHaveBeenCalledWith("Compliance: Unable to delete Redis item", { err: error });
        });
    });
});