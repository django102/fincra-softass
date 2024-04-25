import { UserRepository } from "../../../../src/api/repositories/UserRepository";

describe("UserRepository", () => {
    const mockUser = {
        id: 1,
        name: "Example User",
        email: "example@example.com",
    // other properties...
    };

    beforeEach(() => {
   
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    
    describe("create", () => {
        it("should create a user", async () => {
            const saveMock = jest.fn().mockResolvedValue(mockUser);
            UserRepository.save = saveMock;

            const newUser = {
                name: "New User",
                email: "new@example.com",
                // other properties...
            };

            const createdUser = await UserRepository.create(newUser);

            expect(saveMock).toHaveBeenCalledWith(newUser);
            expect(createdUser).toEqual(mockUser);
        });
    });

    describe("findByEmail", () => {
        it("should find a user by email", async () => {
            const findOneMock = jest.fn().mockResolvedValue(mockUser);
            UserRepository.findOne = findOneMock;

            const email = "example@example.com";
            const foundUser = await UserRepository.findByEmail(email);

            expect(findOneMock).toHaveBeenCalledWith({ where: { email }, relations: { wallets: true } });
            expect(foundUser).toEqual(mockUser);
        });
    });

    describe("findById", () => {
        it("should find a user by id", async () => {
            const findOneMock = jest.fn().mockResolvedValue(mockUser);
            UserRepository.findOne = findOneMock;

            const id = 1;
            const foundUser = await UserRepository.findById(id);

            expect(findOneMock).toHaveBeenCalledWith({ where: { id }, relations: { wallets: true } });
            expect(foundUser).toEqual(mockUser);
        });
    });

    describe("update", () => {
        it("should update a user", async () => {        
            const updateMock = jest.fn().mockResolvedValue(mockUser);            
            UserRepository.update = updateMock;

            const updatedUser = {
                firstName: "Updated User",
                // other properties...
            };

            const updatedUserResponse = await UserRepository.updateUser(mockUser, updatedUser);

            expect(updatedUserResponse).toEqual({ ...mockUser, ...updatedUser });
        });
    });
});