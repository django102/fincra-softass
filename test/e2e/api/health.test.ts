import { bootstrapApp, BootstrapSettings } from "../../../src/utils/test/e2e/bootstrap";

describe("Base Application Test", () => {
    // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------

    let settings: BootstrapSettings;
    beforeAll(async () => settings = await bootstrapApp());
    afterAll(async () => {
        if (settings.connection) {
            await settings.connection.dropDatabase();
            await settings.connection.close();
        }
    });

    it("Should run base test", async () => {
        expect(true).toBe(true);
    });
});