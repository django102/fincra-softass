import { Service } from "typedi";

import LedgerAccountBalance from "../models/LedgerAccountBalance";
import Ledger from "../models/mysql/Ledger";
import { LedgerRepository } from "../repositories/LedgerRepository";

@Service()
export default class LedgerService{
    constructor(){}

    public async getAccountBalance(accountNumber: string): Promise<LedgerAccountBalance> {
        const { credit, debit } = await LedgerRepository.getBalance(accountNumber);

        const ledgerAccountBalance: LedgerAccountBalance = {
            accountNumber,
            availableBalance: credit - debit,
            ledgerBalance: credit - debit
        };

        return ledgerAccountBalance;
    }

    public async addLedgerEntry(entries: Ledger[]): Promise<Ledger[]> {
        const ledger = await LedgerRepository.addEntries(entries);
        return ledger;
    }
}