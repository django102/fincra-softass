import AsyncLock from "async-lock";
import moment from "moment";
import { Service } from "typedi";

import { Logger } from "../../lib/logger";
import { CharacterCasing } from "../enums/CharacterCasing";
import { LedgerAccount } from "../enums/LedgerAccount";
import { ResponseStatus } from "../enums/ResponseStatus";
import { TransactionType } from "../enums/TransactionType";
import AuthenticatedParty from "../models/AuthenticatedParty";
import Ledger from "../models/mysql/Ledger";
import Wallet from "../models/mysql/Wallet";
import { UserRepository } from "../repositories/UserRepository";
import { WalletRepository } from "../repositories/WalletRepository";
import { ServiceResponse } from "../responses";

import BaseService from "./BaseService";
import LedgerService from "./LedgerService";
import UtilityService from "./UtilityService";


@Service()
export default class WalletService extends BaseService {
    constructor(
        private log: Logger,
        private ledgerService: LedgerService
    ) {
        super();
    }

    private lock = new AsyncLock();


    public async createUserWallet(): Promise<ServiceResponse> {
        try {
            const authParty: AuthenticatedParty = this.currentRequestHeaders["user"];

            const user = await UserRepository.findById(authParty.id);
            if(!user) {
                return ServiceResponse.error("User does not exist", ResponseStatus.BAD_REQUEST);
            }

            const wallet = await this.createWallet(user.id);

            return ServiceResponse.success("User wallet created successfully", wallet, null, ResponseStatus.CREATED);
        } catch (err) {
            this.log.error("Could not create user wallet", { err });
            return ServiceResponse.error(`Could not create user wallet: ${err}`);
        }
    }

    public async createWallet(userId: number): Promise<Wallet> {
        const accountNumber = UtilityService.generateRandomString(10, CharacterCasing.NUMERIC);

        const wallet = await WalletRepository.create({ userId, accountNumber });
        return wallet;
    }

    public async getWallet(accountNumber: string): Promise<ServiceResponse> {
        try {
            const wallet = await WalletRepository.findByAccountNumber(accountNumber);
            if(!wallet) {
                return ServiceResponse.error("Wallet does not exist", ResponseStatus.BAD_REQUEST);
            }

            const walletBalance = await this.ledgerService.getAccountBalance(accountNumber);

            return ServiceResponse.success("Wallet retrieved successfully", { ...wallet, balance: walletBalance });
        } catch (err) {
            this.log.error("Could not get user wallet", { err });
            return ServiceResponse.error(`Could not get user wallet: ${err}`);
        }
    }

    public async fundWallet(accountNumber: string, amount: number): Promise<ServiceResponse> {
        try {
            const wallet = await WalletRepository.findByAccountNumber(accountNumber);
            if(!wallet) {
                return ServiceResponse.error("Wallet does not exist", ResponseStatus.BAD_REQUEST);
            }

            // You can check any account limits for the wallet whenever they are implemented

            const reference = moment().format("yyyyMMddHHmmss");

            const creditLedgerEntry: Ledger = {
                accountNumber,
                credit: amount,
                debit: 0,
                description: `Funding of account ${accountNumber}`,
                reference,
                transactionType: TransactionType.FUNDING
            };

            const debitLedgerEntry: Ledger = {
                accountNumber: LedgerAccount.FUNDING,
                credit: 0,
                debit: amount,
                description: `Funding of account ${accountNumber}`,
                reference,
                transactionType: TransactionType.FUNDING
            };

            await this.ledgerService.addLedgerEntry([creditLedgerEntry, debitLedgerEntry]);

            return ServiceResponse.success("Wallet successfully funded");
        } catch (err) {
            this.log.error("Could not fund user wallet", { err });
            return ServiceResponse.error(`Could not fund user wallet: ${err}`);
        }
    }

    public async withdrawFromWallet(accountNumber: string, amount: number): Promise<ServiceResponse> {
        return await this.lock.acquire(accountNumber, async () => {
            try {
                const wallet = await WalletRepository.findByAccountNumber(accountNumber);
                if (!wallet) {
                    return ServiceResponse.error("Wallet does not exist", ResponseStatus.BAD_REQUEST);
                }

                // You can check any account limits for the wallet whenever they are implemented
                const walletBalance = await this.ledgerService.getAccountBalance(accountNumber);
                if (walletBalance.availableBalance < amount) {
                    return ServiceResponse.error("Insufficient funds", ResponseStatus.BAD_REQUEST);
                }

                const reference = moment().format("yyyyMMddHHmmss");

                const debitLedgerEntry: Ledger = {
                    accountNumber,
                    credit: 0,
                    debit: amount,
                    description: `Withdrawal from account ${accountNumber}`,
                    reference,
                    transactionType: TransactionType.WITHDRAWAL
                };

                const creditLedgerEntry: Ledger = {
                    accountNumber: LedgerAccount.WITHDRAWAL,
                    credit: amount,
                    debit: 0,
                    description: `Withdrawal from account ${accountNumber}`,
                    reference,
                    transactionType: TransactionType.WITHDRAWAL
                };

                await this.ledgerService.addLedgerEntry([creditLedgerEntry, debitLedgerEntry]);

                // Run other process to actually transfer to the bank account of choice. 
                // Implement reversal for when it fails...probably have a nested try/catch for this...or figure out how to wrap everything in a transaction.
                
                return ServiceResponse.success("Wallet withdrawal successful");
            } catch (err) {
                this.log.error("Could not withdraw from user wallet", { err });
                return ServiceResponse.error(`Could not withdraw from user wallet: ${err}`);
            }
        }); 
    }

    public async transferBetweenWallets(sourceAccountNumber: string, destinationAccountNumber: string, amount): Promise<ServiceResponse> {
        return await this.lock.acquire(sourceAccountNumber, async () => {
            try {
                const sourceWallet = await WalletRepository.findByAccountNumber(sourceAccountNumber);
                if(!sourceWallet) {
                    return ServiceResponse.error("Source wallet does not exist", ResponseStatus.BAD_REQUEST);
                }
    
                if(sourceAccountNumber === destinationAccountNumber) {
                    return ServiceResponse.error("Source wallet and destination wallet cannot be the same", ResponseStatus.BAD_REQUEST);
                }
    
                const destinationWallet = await WalletRepository.findByAccountNumber(destinationAccountNumber);
                if(!destinationWallet) {
                    return ServiceResponse.error("Destination wallet does not exist", ResponseStatus.BAD_REQUEST);
                }
    
                const sourceWalletBalance = await this.ledgerService.getAccountBalance(sourceAccountNumber);
                if(sourceWalletBalance.availableBalance < amount) {
                    return ServiceResponse.error("Insufficient funds", ResponseStatus.BAD_REQUEST);
                }
    
    
                const reference = moment().format("yyyyMMddHHmmss");
    
                const creditLedgerEntry: Ledger = {
                    accountNumber: destinationAccountNumber,
                    credit: amount,
                    debit: 0,
                    description: `Transfer between accounts -  ${sourceAccountNumber} >> ${destinationAccountNumber}`,
                    reference,
                    transactionType: TransactionType.WALLET_TRANSFER
                };
    
                const debitLedgerEntry: Ledger = {
                    accountNumber: sourceAccountNumber,
                    credit: 0,
                    debit: amount,
                    description: `Transfer between accounts -  ${sourceAccountNumber} >> ${destinationAccountNumber}`,
                    reference,
                    transactionType: TransactionType.WALLET_TRANSFER
                };
    
                await this.ledgerService.addLedgerEntry([creditLedgerEntry, debitLedgerEntry]);
    
                return ServiceResponse.success("Wallet transfer successful");
            } catch (err) {
                this.log.error("Could not transfer funds between wallets", { err });
                return ServiceResponse.error(`Could not transfer funds between wallets: ${err}`);
            }
        });
    }

    // implement transfer to other banks and payment of bills
}
