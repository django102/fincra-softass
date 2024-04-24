import { promisify } from "util";

import redis, { RedisClient } from "redis";

import { env } from "../../env";
import { Logger } from "../../lib/logger";


export default class CacheService {
    client: RedisClient;

    constructor(private log: Logger) {
        const { clusterIp: host, port, username: user, password } = env.redis;
        const connectionInfo = {
            host,
            ...(port && { port }),
            ...(user && { user }),
            ...(password && { password }),
        };

        this.client = redis.createClient(connectionInfo);

        /* istanbul ignore next: Unable to script a test case for this */
        this.client.on("error", (err) => {
            this.log.error("Unable to connect to Redis Client", { err });
        });

        // Promisify all relevant methods
        this.client.getAsync = promisify(this.client.get).bind(this.client);
        this.client.setAsync = promisify(this.client.set).bind(this.client);
        this.client.delAsync = promisify(this.client.del).bind(this.client);
    }

    /**
   * @description set a value in the redis cache
   * @param key the cache item identifier
   * @param value the value of the cache item
   * @param expire expiry time, in seconds
   * @returns true, if the operation was successful; false otherwise
   */
    public async setValue({ key, value, expire = 0 }): Promise<boolean> {
        try {
            if (typeof value === "object") {
                value = JSON.stringify(value);
            }

            if (expire) {
                await this.client.setAsync(key, value, "EX", expire);
                return true;
            }

            await this.client.setAsync(key, value);
            return true;
        } catch (err) {
            this.log.error("Compliance: Unable to set Redis item", { err });
            return false;
        }
    }

    /**
   * @description get a value in the redis cache
   * @param key the cache item identifier
   * @returns value the value of the cache item
   */
    public async getValue(key: string): Promise<any> {
        try {
            const value = await this.client.getAsync(key);

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (err) {
            this.log.error("Compliance: Unable to get Redis item", { err });
            return null;
        }
    }

    /**
   * @description delete a value in the redis cache
   * @param key the cache item identifier
   * @returns true, if the operation was successful; false otherwise
   */
    public async deleteValue(key: string): Promise<boolean> {
        try {
            const ret: number = await this.client.delAsync(key);
            return ret > 0;
        } catch (err) {
            this.log.error("Compliance: Unable to delete Redis item", { err });
            return false;
        }
    }
}