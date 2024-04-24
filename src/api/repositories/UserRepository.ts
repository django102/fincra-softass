import { dataSource } from "../../loaders/typeORMLoader";
import User from "../models/mysql/User";


export const UserRepository = dataSource.getRepository(User).extend({
    async create(user: Partial<User>): Promise<User> {
        return this.save(user);
    },

    async findByEmail(email: string): Promise<User> {
        return this.findOne({ where: { email } });
    },

    async findById(id: number): Promise<User> {
        return this.findOne({ where: { id } });
    },

    async updateUser(
        user: Partial<User>,
        updateData: Partial<User>
    ): Promise<User> {
        await this.update({ id: user.id }, updateData);
        return { ...user, ...updateData } as User;
    },
});