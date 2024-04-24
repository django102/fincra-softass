import bcrypt from "bcryptjs";
import Chance from "chance";

import { CharacterCasing } from "../../../../src/api/enums/CharacterCasing";
import UtilityService from "../../../../src/api/services/UtilityService";

jest.mock("bcryptjs", () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn()
}));


describe("UtilityService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    
    describe("should be defined", ()=>{
        it("should be defined", ()=>{
            expect(UtilityService).toBeDefined();
        });
    });

    describe("hashPassword", () => {
        it("should hash password", async () => {
            const inputPassword = "password123";
            const mockSalt = "mockSalt";
            const mockHashedPassword = "mockHashedPassword";
        
            bcrypt.genSalt.mockResolvedValue(mockSalt);
            bcrypt.hash.mockResolvedValue(mockHashedPassword);
    
            const hashedPassword = await UtilityService.hashPassword(inputPassword);
    
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith(inputPassword, mockSalt);
            expect(hashedPassword).toBe(mockHashedPassword);
        });

        it("should return empty string if input is empty", async () => {
            const emptyInput = "";
            const hashedPassword = await UtilityService.hashPassword(emptyInput);
    
            expect(hashedPassword).toBe("");
            expect(bcrypt.genSalt).not.toHaveBeenCalled();
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });
    });

    describe("comparePassword", () => {
        it("should compare password successfully", async () => {
            bcrypt.compare.mockResolvedValue(true);
            
            const inputPassword = "password123";
            const mockHashedPassword = "mockHashedPassword";
    
            const hashedPassword = await UtilityService.comparePassword(inputPassword, mockHashedPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(inputPassword, mockHashedPassword);
            expect(hashedPassword).toBe(true);
        });

        it("should fail to compare password", async () => {
            bcrypt.compare.mockResolvedValue(false);

            const inputPassword = "password123";
            const mockHashedPassword = "mockHashedPassword";
    
            const hashedPassword = await UtilityService.comparePassword(inputPassword, mockHashedPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(inputPassword, mockHashedPassword);
            expect(hashedPassword).toBe(false);
        });
    }); 
    
    describe("generateRandomString", () => {
        it("should generate a random string with default parameters", () => {
            const mockRandomString = "abc123";

            jest.spyOn(Chance.prototype, "string").mockImplementation(() => {    
                return mockRandomString;
            }); 
            
            const randomString = UtilityService.generateRandomString();
    
            expect(randomString).toBe(mockRandomString);
            expect(Chance.prototype.string).toHaveBeenCalledWith({
                length: 36,
                casing: CharacterCasing.LOWER,
                alpha: true,
                numeric: true,
            });
        });
    
        it("should generate a random string with custom length and casing", () => {
            const mockRandomString = "XYZ987";
            jest.spyOn(Chance.prototype, "string").mockImplementation(() => {    
                return mockRandomString;
            }); 
    
            const length = 8;
            const casing = CharacterCasing.UPPER;
            const randomString = UtilityService.generateRandomString(length, casing);
    
            expect(randomString).toBe(mockRandomString);
            expect(Chance.prototype.string).toHaveBeenCalledWith({
                length,
                casing,
                alpha: true,
                numeric: true,
            });
        });
    
        it("should return an empty string for negative length", () => {
            const randomString = UtilityService.generateRandomString(-5);
            expect(randomString).toBe("");
            expect(Chance.prototype.string).not.toHaveBeenCalled();
        });
    });
});