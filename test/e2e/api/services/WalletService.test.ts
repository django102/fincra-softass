import { CharacterCasing } from "../../../../src/api/enums/CharacterCasing";
import { ResponseStatus } from "../../../../src/api/enums/ResponseStatus";
import { TransactionType } from "../../../../src/api/enums/TransactionType";
import { UserRepository } from "../../../../src/api/repositories/UserRepository";
import { WalletRepository } from "../../../../src/api/repositories/WalletRepository";
import LedgerService from "../../../../src/api/services/LedgerService";
import UtilityService from "../../../../src/api/services/UtilityService";
import WalletService from "../../../../src/api/services/WalletService";
import WalletServiceMock from "../../../../test/mocks/services/WalletServiceMock";


describe("WalletService", () => {
    let walletService: WalletService;
    let ledgerService: LedgerService;
    const headers = { user: { email: "example@example.com", firstName: "first", lastName: "last", id: 1, password: "pass", phoneNumber: "00" } };

    beforeAll(()=>{
        walletService = WalletServiceMock.getInstance();
        ledgerService = WalletServiceMock.ledgerService;
        walletService.setCurrentRequestHeaders(headers);
    });

    afterEach(()=>{
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });


    describe("should be defined", ()=>{
        it("should be defined", ()=>{
            expect(walletService).toBeDefined();
        });
    });


    describe("createUserWallet", () => {
        const wallet = { userId: 1, accountNumber: "0000012345", };

        it("should successfully create user wallet", async () => {
            const getUserMock = jest.spyOn(UserRepository, "findById").mockResolvedValue(headers.user);
            const createWalletMock = jest.spyOn(walletService, "createWallet").mockResolvedValue(wallet);

            const response = await walletService.createUserWallet();

            expect(getUserMock).toHaveBeenCalledWith(headers.user.id);
            expect(createWalletMock).toHaveBeenCalledWith(headers.user.id);
            expect(response.code).toEqual(ResponseStatus.CREATED);
            expect(response.data).toEqual(wallet);
        });

        it("should fail if unable to get user", async () => {
            const getUserMock = jest.spyOn(UserRepository, "findById").mockResolvedValue(null);
            const createWalletMock = jest.spyOn(walletService, "createWallet").mockResolvedValue(wallet);

            const response = await walletService.createUserWallet();

            expect(getUserMock).toHaveBeenCalledWith(headers.user.id);
            expect(createWalletMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.data).toBeUndefined();
        });

        it("should throw an error while creating wallet", async () => {
            const getUserMock = jest.spyOn(UserRepository, "findById").mockRejectedValue("something happened!!!");
            const createWalletMock = jest.spyOn(walletService, "createWallet").mockResolvedValue(wallet);

            const response = await walletService.createUserWallet();

            expect(getUserMock).toHaveBeenCalledWith(headers.user.id);
            expect(createWalletMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("createWallet", () => {
        const wallet = { userId: 1, accountNumber: "0000012345", };

        it("should successfully create user wallet", async () => {
            const generateRefMock = jest.spyOn(UtilityService, "generateRandomString").mockReturnValue("0000012345");
            const createWalletMock = jest.spyOn(WalletRepository, "create").mockResolvedValue(wallet);

            const response = await walletService.createWallet(headers.user.id);

            expect(generateRefMock).toHaveBeenCalledWith(10, CharacterCasing.NUMERIC);
            expect(createWalletMock).toHaveBeenCalledWith({ userId: headers.user.id, accountNumber: "0000012345" });
            expect(response).toEqual(wallet);
        });
    });

    describe("getWallet", () => {
        const wallet = { userId: 1, accountNumber: "0000012345", };
        const balance = { accountNumber: wallet.accountNumber, availableBalance: 30000, ledgerBalance: 30000 };

        it("should successfully get user wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(wallet);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);

            const response = await walletService.getWallet(wallet.accountNumber);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(getBalanceMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(response.code).toEqual(ResponseStatus.OK);
            expect(response.data).toEqual({ ...wallet, balance });
        });

        it("should fail if unable to get user wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(null);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);

            const response = await walletService.getWallet(wallet.accountNumber);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(getBalanceMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.data).toBeUndefined();
        });

        it("should throw an error while creating wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(wallet);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockRejectedValue("something happened!!!");

            const response = await walletService.getWallet(wallet.accountNumber);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(getBalanceMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("fundWallet", () => {
        const wallet = { userId: 1, accountNumber: "0000012345", };
        const ledger = { accountNumber: "0000000000", credit: 10000, debit: 0, reference: "myRef", transactionType: TransactionType.FUNDING, description: "something" };

        it("should successfully fund user wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(wallet);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.fundWallet(wallet.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should fail if unable to get wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(null);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.fundWallet(wallet.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.data).toBeUndefined();
        });

        it("should throw an error while creating wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(wallet);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockRejectedValue("something happened!!!");

            const response = await walletService.fundWallet(wallet.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("withdrawFromWallet", () => {
        const wallet = { userId: 1, accountNumber: "0000012345", };
        const balance = { accountNumber: wallet.accountNumber, availableBalance: 30000, ledgerBalance: 30000 };
        const ledger = { accountNumber: "0000000000", credit: 10000, debit: 0, reference: "myRef", transactionType: TransactionType.FUNDING, description: "something" };

        it("should successfully withdraw from user wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(wallet);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.withdrawFromWallet(wallet.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(getBalanceMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should return insufficient funds if wallet balance is less than withdrawal amount", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(wallet);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue({ ...balance, availableBalance: 5000 });
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.withdrawFromWallet(wallet.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(getBalanceMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.message).toEqual("Insufficient funds");
        });

        it("should fail if unable to get wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(null);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.withdrawFromWallet(wallet.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(getBalanceMock).not.toHaveBeenCalled();
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.data).toBeUndefined();
        });

        it("should throw an error while withdrawing from wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValue(wallet);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockRejectedValue("something happened!!!");

            const response = await walletService.withdrawFromWallet(wallet.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(getBalanceMock).toHaveBeenCalledWith(wallet.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });

    describe("transferBetweenWallets", () => {
        const wallet1 = { userId: 1, accountNumber: "0000012345", };
        const wallet2 = { userId: 1, accountNumber: "0000012346", };
        const balance = { accountNumber: wallet1.accountNumber, availableBalance: 30000, ledgerBalance: 30000 };
        const ledger = { accountNumber: "0000000000", credit: 10000, debit: 0, reference: "myRef", transactionType: TransactionType.FUNDING, description: "something" };

        it("should successfully transfer between wallets", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValueOnce(wallet1).mockResolvedValueOnce(wallet2);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet2.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenNthCalledWith(1, wallet1.accountNumber);
            expect(getWalletMock).toHaveBeenNthCalledWith(2, wallet2.accountNumber);
            expect(getBalanceMock).toHaveBeenCalledWith(wallet1.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.OK);
        });

        it("should return insufficient funds if wallet balance is less than withdrawal amount", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValueOnce(wallet1).mockResolvedValueOnce(wallet2);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue({ ...balance, availableBalance: 5000 });
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet2.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenNthCalledWith(1, wallet1.accountNumber);
            expect(getWalletMock).toHaveBeenNthCalledWith(2, wallet2.accountNumber);
            expect(getBalanceMock).toHaveBeenCalledWith(wallet1.accountNumber);
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.message).toEqual("Insufficient funds");
        });

        it("should fail if unable to get source wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValueOnce(null).mockResolvedValueOnce(wallet2);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet2.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledTimes(1);
            expect(getBalanceMock).not.toHaveBeenCalled();
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.data).toBeUndefined();
        });

        it("should fail if unable to get destination wallet", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValueOnce(wallet1).mockResolvedValueOnce(null);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet2.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledTimes(2);
            expect(getBalanceMock).not.toHaveBeenCalled();
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.data).toBeUndefined();
        });

        it("should fail if both source and destination wallets are the same", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValueOnce(wallet1).mockResolvedValueOnce(wallet2);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockResolvedValue([ledger, ledger]);

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet1.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenCalledTimes(1);
            expect(getBalanceMock).not.toHaveBeenCalled();
            expect(addEntryMock).not.toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.BAD_REQUEST);
            expect(response.data).toBeUndefined();
        });

        it("should throw an error while transfering between wallets", async () => {
            const getWalletMock = jest.spyOn(WalletRepository, "findByAccountNumber").mockResolvedValueOnce(wallet1).mockResolvedValueOnce(wallet2);
            const getBalanceMock = jest.spyOn(ledgerService, "getAccountBalance").mockResolvedValue(balance);
            const addEntryMock = jest.spyOn(ledgerService, "addLedgerEntry").mockRejectedValue("something happened!!!");

            const response = await walletService.transferBetweenWallets(wallet1.accountNumber, wallet2.accountNumber, 20000);

            expect(getWalletMock).toHaveBeenNthCalledWith(1, wallet1.accountNumber);
            expect(getWalletMock).toHaveBeenNthCalledWith(2, wallet2.accountNumber);
            expect(getBalanceMock).toHaveBeenCalledWith(wallet1.accountNumber);
            expect(addEntryMock).toHaveBeenCalled();
            expect(response.code).toEqual(ResponseStatus.INTERNAL_SERVER_ERROR);
            expect(response.data).toBeUndefined();
        });
    });
});