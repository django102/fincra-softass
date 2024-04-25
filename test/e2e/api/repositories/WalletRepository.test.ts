import { WalletRepository } from "../../../../src/api/repositories/WalletRepository";

describe("WalletRepository", () => {
    const mockWallet = {
        id: 1,
        userId: 1,
        accountNumber: "0000012737",
    // other properties...
    };

    beforeEach(() => {
   
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    
    describe("create", () => {
        it("should create a wallet", async () => {
            const saveMock = jest.fn().mockResolvedValue(mockWallet);
            WalletRepository.save = saveMock;

            const createdWallet = await WalletRepository.create(mockWallet);

            expect(saveMock).toHaveBeenCalledWith(mockWallet);
            expect(createdWallet).toEqual(mockWallet);
        });
    });

    describe("findByUser", () => {
        it("should find a wallet by user id", async () => {
            const findMock = jest.fn().mockResolvedValue([mockWallet]);
            WalletRepository.find = findMock;

            const foundWallets = await WalletRepository.findByUser(1);

            expect(findMock).toHaveBeenCalledWith({ where: { userId: 1 } });
            expect(foundWallets).toEqual([mockWallet]);
        });
    });

    describe("findById", () => {
        it("should find a wallet by id", async () => {
            const findOneMock = jest.fn().mockResolvedValue(mockWallet);
            WalletRepository.findOne = findOneMock;

            const id = 1;
            const foundWallet = await WalletRepository.findById(id);

            expect(findOneMock).toHaveBeenCalledWith({ where: { id } });
            expect(foundWallet).toEqual(mockWallet);
        });
    });

    describe("findByAccountNumber", () => {
        it("should find a wallet by id", async () => {
            const findOneMock = jest.fn().mockResolvedValue(mockWallet);
            WalletRepository.findOne = findOneMock;

            const accountNumber = "0000000000";
            const foundWallet = await WalletRepository.findByAccountNumber(accountNumber);

            expect(findOneMock).toHaveBeenCalledWith({ where: { accountNumber } });
            expect(foundWallet).toEqual(mockWallet);
        });
    });
});