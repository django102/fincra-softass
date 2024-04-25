import { dataSource } from "../../loaders/typeORMLoader";
import DateFilter from "../models/DateFilter";
import Ledger from "../models/mysql/Ledger";


export const LedgerRepository = dataSource.getRepository(Ledger).extend({
    async addEntry(ledger: Partial<Ledger>): Promise<Ledger> {
        return this.save(ledger);
    },

    async addEntries(ledgers: Ledger[]): Promise<Ledger[]> {
        return this.save(ledgers);
    },

    async getBalance(accountNumber: string): Promise<{credit: number, debit: number}> {
        return this.createQueryBuilder("ledger")
            .select(["SUM(ledger.credit) as credit", "SUM(ledger.debit) as debit"])
            .where("ledger.accountNumber = :accountNumber AND ledger.isReversed = false AND ledger.isDeleted = false", { accountNumber })
            .getRawOne();
    },

    async getTransactionHistory(accountNumber: string, dateFilter?: DateFilter): Promise<Ledger[]> {
        const queryBuilder = this.createQueryBuilder("ledger")
            .select(["ledger.accountNumber", "ledger.reference", "ledger.transactionType", "ledger.credit", "ledger.debit", "ledger.isReversed", "ledger.description", "ledger.transactionDate"])
            .where("ledger.accountNumber = :accountNumber AND ledger.isDeleted = false", { accountNumber })
            .orderBy("transactionDate", "DESC");

        if (dateFilter) {
            queryBuilder.andWhere("ledger.transactionDate >= :startDate AND ledger.transactionDate <= :endDate", {
                startDate: dateFilter.startDate,
                endDate: dateFilter.endDate
            });
        }

        return queryBuilder.getRawMany();
    },

    async updateLedger(ledger: Partial<Ledger>, updates: Partial<Ledger>): Promise<Ledger> {
        await this.update({ id: ledger.id }, updates);
        return { ...ledger, ...updates } as Ledger;
    },

    async getTransactionInformation(reference: string, accountNumber?: string): Promise<Ledger | Ledger[]> {
        if(accountNumber){
            return this.findOne({ where: { reference, accountNumber } });
        }

        return this.find({ where: { reference } });
    }
});