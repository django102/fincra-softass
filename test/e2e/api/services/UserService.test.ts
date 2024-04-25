import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import User from "../../../../src/api/models/mysql/User";
import { UserRepository } from "../../../../src/api/repositories/UserRepository";
import AuthenticationService from "../../../../src/api/services/AuthenticationService";
import UserService from "../../../../src/api/services/UserService";
import UtilityService from "../../../../src/api/services/UtilityService";
import WalletService from "../../../../src/api/services/WalletService";
import UserServiceMock from "../../../../test/mocks/services/UserServiceMock";

describe("UserService", () => {
    let userService: UserService;
    let authenticationService: AuthenticationService;
    let walletService: WalletService;

    const mockUser: User = {
        id: 1,
        email: "example@example.com",
        firstName: "first",
        lastName: "last",
        phoneNumber: "00000",
        password: "hashedPassword",
    };
    const mockToken = "mockToken";    

    beforeAll(()=>{
        userService = UserServiceMock.getInstance();
        authenticationService = UserServiceMock.authenticationService;
        walletService = UserServiceMock.walletService;
    });

    afterEach(()=>{
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });


    describe("should be defined", ()=>{
        it("should be defined", ()=>{
            expect(userService).toBeDefined();
        });
    });


    describe("create", ()=>{
        let createUserMock : jest.SpyInstance;
        let createWalletMock : jest.SpyInstance;
        let finduserByEmailMock : jest.SpyInstance;

        beforeEach(()=>{
            createUserMock = jest.spyOn(UserRepository, "create");
            createWalletMock = jest.spyOn(walletService, "createWallet");
            finduserByEmailMock = jest.spyOn(UserRepository, "findByEmail");
        });

        const resolvedCreateduser = { ...mockUser, id: 1, createdAt: new Date() };

        it("should create a user successfully", async () => {
            createUserMock.mockResolvedValue(resolvedCreateduser);
            finduserByEmailMock.mockResolvedValue(null);
            createWalletMock.mockResolvedValue({});

            const createduser = await userService.create(mockUser);

            expect(createUserMock).toHaveBeenCalledTimes(1);
            expect(createWalletMock).toHaveBeenCalledTimes(1);
            expect(finduserByEmailMock).toHaveBeenCalledTimes(1);
            expect(createduser.code).toEqual(ResponseStatus.CREATED);
            expect(createduser.data).toEqual(resolvedCreateduser);
        });

        it("should fail if a user already exists", async () => {
            createUserMock.mockResolvedValue(resolvedCreateduser);
            finduserByEmailMock.mockResolvedValue(resolvedCreateduser);

            const createduser = await userService.create(mockUser);

            expect(createUserMock).toHaveBeenCalledTimes(0);
            expect(createWalletMock).toHaveBeenCalledTimes(0);
            expect(finduserByEmailMock).toHaveBeenCalledTimes(1);
            expect(createduser.code).toEqual(ResponseStatus.BAD_REQUEST);
        });

        it("should fail while trying to create a user", async () => {
            createUserMock.mockRejectedValue("something happened!!!");
            finduserByEmailMock.mockResolvedValue(null);

            const createduser = await userService.create(mockUser);

            expect(createUserMock).toHaveBeenCalledTimes(1);
            expect(createWalletMock).toHaveBeenCalledTimes(0);
            expect(finduserByEmailMock).toHaveBeenCalledTimes(1);
            expect(createduser.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(createduser.data).toBeUndefined();
        });
    });

    describe("login", () => {
        let getUserByEmailMock : jest.SpyInstance;

        beforeEach(()=>{
            getUserByEmailMock = jest.spyOn(UserRepository, "findByEmail");
        });

        it("should successfully login", async () => {
            getUserByEmailMock.mockResolvedValue(mockUser);
            UtilityService.comparePassword = jest.fn().mockResolvedValue(true);
            authenticationService.issueToken = jest.fn().mockReturnValue(mockToken);
    
            const email = "example@example.com";
            const password = "password123";
    
            const response = await userService.login(email, password);

            expect(getUserByEmailMock).toHaveBeenCalledTimes(1);
            expect(response.code).toEqual(ResponseStatus.OK);
            expect(response.data).toEqual({ user: mockUser, token: mockToken });
        });
    
        it("should return error for invalid email", async () => {
            getUserByEmailMock.mockResolvedValue(null);
    
            const email = "invalid@example.com";
            const password = "invalidPassword";
    
            const response = await userService.login(email, password);

            expect(getUserByEmailMock).toHaveBeenCalledTimes(1);
            expect(response.code).toEqual(ResponseStatus.UNAUTHORIZED);
            expect(response.data).toBeUndefined();
        });

        it("should return error for invalid password", async () => {
            getUserByEmailMock.mockResolvedValue(mockUser);
            UtilityService.comparePassword = jest.fn().mockResolvedValue(false);
    
            const email = "invalid@example.com";
            const password = "invalidPassword";
    
            const response = await userService.login(email, password);

            expect(getUserByEmailMock).toHaveBeenCalledTimes(1);
            expect(response.code).toEqual(ResponseStatus.UNAUTHORIZED);
            expect(response.data).toBeUndefined();
        });
    
        it("should handle error during login", async () => {
            getUserByEmailMock.mockRejectedValue(new Error("Database error"));
    
            const email = "example@example.com";
            const password = "password123";
    
            const response = await userService.login(email, password);

            expect(getUserByEmailMock).toHaveBeenCalledTimes(1);
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });
});