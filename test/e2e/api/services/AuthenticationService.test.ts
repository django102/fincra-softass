import jwt from "jsonwebtoken";
import moment from "moment";

import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import AuthenticationService from "../../../../src/api/services/AuthenticationService";
import { env } from "../../../../src/env";
import AuthenticationServiceMock from "../../../../test/mocks/services/AuthenticationServiceMock";


jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn(),
}));


describe("AuthenticationService", () => {
    let authenticationService: AuthenticationService;

    beforeAll(() => {
        authenticationService = AuthenticationServiceMock.getInstance();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });


    describe("should be defined", ()=>{
        it("should be defined", () => {
            expect(authenticationService).toBeDefined();
        });
    });

    describe("issueToken", () => {
        it("should issue a token", () => {
            const mockToken = "mockToken";
            jwt.sign.mockReturnValue(mockToken);

            const data = { userId: 1 };
            const expiresIn = 3600;

            const token = authenticationService.issueToken(data, expiresIn);

            expect(token).toBe(mockToken);
            expect(jwt.sign).toHaveBeenCalledWith({ data }, env.constants.jwtHasher, { expiresIn });
        });

        it("should return null if data is null", () => {
            const token = authenticationService.issueToken(null);
            expect(token).toBeNull();
            expect(jwt.sign).not.toHaveBeenCalled();
        });
    });

    describe("verifyToken", () => {
        it("should verify a token", () => {
            const mockDecodedToken = { userId: 1 };
            jwt.verify.mockReturnValue(mockDecodedToken);

            const token = "mockToken";
            const decodedToken = authenticationService.verifyToken(token);

            expect(decodedToken).toEqual(mockDecodedToken);
            expect(jwt.verify).toHaveBeenCalledWith(token, env.constants.jwtHasher);
        });

        it("should return null if token is null", () => {
            const decodedToken = authenticationService.verifyToken(null);
            expect(decodedToken).toBeNull();
            expect(jwt.verify).not.toHaveBeenCalled();
        });
    });

    describe("validateAuthorization", () => {
        const mockDecodedJwt = {
            data: {
                email: "example@example.com",
                firstName: "first",
                lastName: "last",
                id: 1
            },
            exp: moment().add(1, "hour").unix()
        };

        it("should validate authorization", async () => {
            const headers = { authorization: "Bearer mockToken" };

            authenticationService.verifyToken = jest.fn().mockReturnValue(mockDecodedJwt);

            const validation = await authenticationService.validateAuthorization(headers);

            expect(validation).toEqual({
                status: true,
                message: "Validation successful",
                data: mockDecodedJwt.data
            });
        });

        it("should return status false if no authorization", async () => {
            const headers = {};

            const validation = await authenticationService.validateAuthorization(headers);

            expect(validation).toEqual({ status: false, message: "No authorization", code: ResponseStatus.UNAUTHORIZED });
        });

        it("should return status false if authorization format is incorrect", async () => {
            const headers = { authorization: "InvalidTokenFormat" };

            const validation = await authenticationService.validateAuthorization(headers);

            expect(validation).toEqual({ status: false, message: "Authorization format is 'Bearer xxxxxx'", code: ResponseStatus.UNAUTHORIZED });
        });

        it("should return status false if authorization key (JWT) is missing", async () => {
            const headers = { authorization: "Bearer " };

            const validation = await authenticationService.validateAuthorization(headers);

            expect(validation).toEqual({ status: false, message: "Invalid Authorization", code: ResponseStatus.UNAUTHORIZED });
        });

        it("should return status false if JWT token is expired", async () => {
            authenticationService.verifyToken = jest.fn().mockReturnValue({ ...mockDecodedJwt, exp: moment().add(-1, "hour").unix() });

            const headers = { authorization: "Bearer mockToken" };

            const validation = await authenticationService.validateAuthorization(headers);

            expect(validation).toEqual({ status: false, message: "Expired token. Please log in", code: ResponseStatus.UNAUTHORIZED });
        });

        it("should return status false if JWT token verification throws an error", async () => {
            authenticationService.verifyToken = jest.fn().mockImplementation(() => {
                throw new Error("Token verification failed");
            });

            const headers = { authorization: "Bearer mockToken" };

            const validation = await authenticationService.validateAuthorization(headers);

            expect(validation).toEqual({ status: false, message: "Token verification failed" });
        });
    });
});