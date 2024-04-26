import moment from "moment";

import DateFilter from "../../../../src/api/models/DateFilter";
import { LedgerRepository } from "../../../../src/api/repositories/LedgerRepository";

describe("LedgerRepository", () => {
    const mockLedgerEntry = {
        accountNumber: "0001213727",
        credit: 2300.00,
        debit: 0.00,
        reference: "20240101000000",
        id: 1
    };

    const createQueryBuilder: any = {
        select: jest.fn().mockImplementation(() => {
            return createQueryBuilder;
        }),
        addSelect: jest.fn().mockImplementation(() => {
            return createQueryBuilder;
        }),
        groupBy: jest.fn().mockImplementation(() => {
            return createQueryBuilder;
        }),
        where: jest.fn().mockImplementation(() => {
            return createQueryBuilder;
        }),
        andWhere: jest.fn().mockImplementation(() => {
            return createQueryBuilder;
        }),
        orderBy: jest.fn().mockImplementation(() => {
            return createQueryBuilder;
        }),
        getRawMany: jest.fn(),
        getRawOne: jest.fn(),
    };

    beforeEach(() => {});

    afterEach(() => jest.clearAllMocks());

    describe("addEntry", () => {
        it("should add a ledger entry", async () => {
            const saveMock = jest.fn().mockResolvedValue(mockLedgerEntry);
            LedgerRepository.save = saveMock;

            const ledgerEntry = await LedgerRepository.addEntry(mockLedgerEntry);

            expect(saveMock).toHaveBeenCalledWith(mockLedgerEntry);
            expect(ledgerEntry).toEqual(mockLedgerEntry);
        });
    });

    describe("addEntries", () => {
        it("should add multiple ledger entries", async () => {
            const saveMock = jest.fn().mockResolvedValue(mockLedgerEntry);
            LedgerRepository.save = saveMock;

            const ledgerEntry = await LedgerRepository.addEntries([mockLedgerEntry]);

            expect(saveMock).toHaveBeenCalledWith([mockLedgerEntry]);
            expect(ledgerEntry).toEqual(mockLedgerEntry);
        });
    });

    describe("getBalance", () => {
        it("should get ledger balance for account", async () => {
            const accountBalance = { credit: 50000.00, debit: 12000.00 };

            createQueryBuilder.getRawOne.mockImplementation(() => { return accountBalance; });
            jest.spyOn(LedgerRepository, "createQueryBuilder").mockImplementation(() => createQueryBuilder);

            const ledgerBalance = await LedgerRepository.getBalance(mockLedgerEntry.accountNumber);

            expect(createQueryBuilder.where).toHaveBeenCalledWith("ledger.accountNumber = :accountNumber AND ledger.isReversed = false AND ledger.isDeleted = false", { "accountNumber": "0001213727" });
            expect(ledgerBalance).toEqual(accountBalance);
        });
    });

    describe("getTransactionHistory", () => {
        it("should get ledger balance for account without date filter", async () => {
            const transHistory = [mockLedgerEntry, mockLedgerEntry];

            createQueryBuilder.getRawMany.mockImplementation(() => { return transHistory; });
            jest.spyOn(LedgerRepository, "createQueryBuilder").mockImplementation(() => createQueryBuilder);

            const history = await LedgerRepository.getTransactionHistory(mockLedgerEntry.accountNumber);

            expect(createQueryBuilder.where).toHaveBeenCalledWith("ledger.accountNumber = :accountNumber AND ledger.isDeleted = false", { "accountNumber": "0001213727" });
            expect(createQueryBuilder.andWhere).not.toHaveBeenCalled();
            expect(history).toEqual(transHistory);
        });

        it("should get ledger balance for account with date filter", async () => {
            const transHistory = [mockLedgerEntry, mockLedgerEntry];

            const dateFilter: DateFilter = {
                startDate: moment().format("yyyy-MM-dd"),
                endDate: moment().format("yyyy-MM-dd")
            };

            createQueryBuilder.getRawMany.mockImplementation(() => { return transHistory; });
            jest.spyOn(LedgerRepository, "createQueryBuilder").mockImplementation(() => createQueryBuilder);

            const history = await LedgerRepository.getTransactionHistory(mockLedgerEntry.accountNumber, dateFilter);

            expect(createQueryBuilder.where).toHaveBeenCalledWith("ledger.accountNumber = :accountNumber AND ledger.isDeleted = false", { "accountNumber": "0001213727" });
            expect(createQueryBuilder.andWhere).toHaveBeenCalledWith("ledger.transactionDate >= :startDate AND ledger.transactionDate <= :endDate", { startDate: dateFilter.startDate, endDate: dateFilter.endDate });
            expect(history).toEqual(transHistory);
        });
    });

    describe("updateLedger", () => {
        it("should update a user", async () => {        
            const updateMock = jest.fn().mockResolvedValue(mockLedgerEntry);            
            LedgerRepository.update = updateMock;

            const updateLedger = {
                isReversed: true,
                // other properties...
            };

            const updatedUserResponse = await LedgerRepository.updateLedger(mockLedgerEntry, updateLedger);

            expect(updatedUserResponse).toEqual({ ...mockLedgerEntry, ...updateLedger });
        });
    });

    describe("getTransactionInformation", () => {
        it("should get transaction information with transaction reference only", async () => {
            const findMock = jest.fn().mockResolvedValue([mockLedgerEntry, mockLedgerEntry]);
            LedgerRepository.find = findMock;

            const ledgerEntries = await LedgerRepository.getTransactionInformation(mockLedgerEntry.reference);

            expect(findMock).toHaveBeenCalledWith({ where: { reference: mockLedgerEntry.reference } });
            expect(ledgerEntries).toEqual([mockLedgerEntry, mockLedgerEntry]);
        });

        it("should get transaction information with both transaction reference and account number", async () => {
            const findOneMock = jest.fn().mockResolvedValue(mockLedgerEntry);
            LedgerRepository.findOne = findOneMock;

            const ledgerEntry = await LedgerRepository.getTransactionInformation(mockLedgerEntry.reference, mockLedgerEntry.accountNumber);

            expect(findOneMock).toHaveBeenCalledWith({ where: { reference: mockLedgerEntry.reference, accountNumber: mockLedgerEntry.accountNumber } });
            expect(ledgerEntry).toEqual(mockLedgerEntry);
        });
    });
});