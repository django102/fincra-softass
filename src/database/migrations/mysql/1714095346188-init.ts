import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1714095346188 implements MigrationInterface {
    name = "Init1714095346188";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `phoneNumber` varchar(255) NOT NULL, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `wallets` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `accountNumber` varchar(255) NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `ledger` (`id` int NOT NULL AUTO_INCREMENT, `reference` varchar(255) NOT NULL, `accountNumber` varchar(255) NOT NULL, `transactionType` enum ('funding', 'transfer', 'withdrawal', 'wallet_transfer', 'payment') NOT NULL, `description` varchar(255) NOT NULL, `credit` int NOT NULL DEFAULT '0', `debit` int NOT NULL DEFAULT '0', `isReversed` tinyint NOT NULL DEFAULT 0, `isDeleted` tinyint NOT NULL DEFAULT 0, `transactionDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `wallets` ADD CONSTRAINT `FK_2ecdb33f23e9a6fc392025c0b97` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `wallets` DROP FOREIGN KEY `FK_2ecdb33f23e9a6fc392025c0b97`");
        await queryRunner.query("DROP TABLE `ledger`");
        await queryRunner.query("DROP TABLE `wallets`");
        await queryRunner.query("DROP TABLE `users`");
    }

}
