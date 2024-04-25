import { dataSource } from "../../loaders/typeORMLoader";
import Wallet from "../models/mysql/Wallet";


export const WalletRepository = dataSource.getRepository(Wallet).extend({
    async create(wallet: Partial<Wallet>): Promise<Wallet> {
        return this.save(wallet);
    },

    async findByUser(userId: number): Promise<Wallet[]> {
        return this.find({ where: { userId } });
    },

    async findById(id: number): Promise<Wallet> {
        return this.findOne({ where: { id } });
    },

    async findByAccountNumber(accountNumber: string): Promise<Wallet> {
        return this.findOne({ where: { accountNumber } });
    },
});