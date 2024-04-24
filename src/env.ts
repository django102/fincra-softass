import * as path from "path";

import * as dotenv from "dotenv";

import * as pkg from "../package.json";

import {
    getOsEnv,
    getOsEnvOptional,
    getOsEnvWithDefault,
    getOsPathsWithDefault,
    getOsPathWithDefault,
    normalizePort,
    toBool,
    toNumber,
} from "./lib/env";

/**
 * Load .env file or for tests the .env.test file.
 */
dotenv.config({
    path: path.join(
        process.cwd(),
        `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`
    ),
});


/**
 * Environment variables
 */
export const env = {
    node: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
    isDevelopment: process.env.NODE_ENV === "development",
    app: {
        name: (pkg as any).name,
        displayName: (pkg as any).displayName,
        version: (pkg as any).version,
        description: (pkg as any).description,
        host: getOsEnvOptional("APP_HOST"),
        port: normalizePort(process.env.PORT || undefined),
        schema: getOsEnvOptional("APP_SCHEMA"),
        exposedPort: normalizePort(process.env.APP_EXPOSED_PORT || undefined),
        banner: toBool(getOsEnvOptional("APP_BANNER") || "true"),
        dirs: {
            mongo: {
                migrations: getOsPathsWithDefault("DB_MIGRATIONS", "src/database/migrations/**/*.ts"),
                migrationsDir: getOsPathWithDefault("DB_MIGRATIONS_DIR", "src/database/migrations"),
                entities: getOsPathsWithDefault("DB_ENTITIES", "src/api/models/**/*.ts"),
                entitiesDir: getOsPathWithDefault("DB_ENTITIES_DIR", "src/api/models"),
            },
            mysql: {
                migrations: getOsPathsWithDefault("TYPEORM_MIGRATIONS", "src/database/migrations/mysql/**/*.ts"),
                migrationsDir: getOsPathWithDefault("TYPEORM_MIGRATIONS_DIR", "src/database/migrations/mysql"),
                entities: getOsPathsWithDefault("TYPEORM_ENTITIES", "src/api/models/mysql/**/*.ts"),
                entitiesDir: getOsPathWithDefault("TYPEORM_ENTITIES_DIR", "src/api/models/mysql"),
            },
            controllers: getOsPathsWithDefault("CONTROLLERS", "src/api/controllers/**/*Controller.ts,src/controllers/**/*Controller.ts"),
            middlewares: getOsPathsWithDefault("MIDDLEWARES", "src/middlewares/**/*Middleware.ts"),
            subscribers: getOsPathsWithDefault("SUBSCRIBERS", "src/api/subscribers/**/*Subscriber.ts"),
            interceptors: getOsPathsWithDefault("INTERCEPTORS", "src/interceptors/**/*Interceptor.ts"),
        },
    },
    log: {
        level: getOsEnv("LOG_LEVEL"),
        json: toBool(getOsEnvOptional("LOG_JSON")),
        output: getOsEnv("LOG_OUTPUT"),
        logglyToken: getOsEnvOptional("LOG_LOGGLY_TOKEN"),
        udpHost: getOsEnvOptional("LOG_UDP_HOST"),
        udpPort: getOsEnvOptional("LOG_UDP_PORT"),
        enabled: toBool(getOsEnvOptional("LOGGLY_ENABLED") || "true"),
    },
    db: {
        mysql: {
            type: getOsEnv("TYPEORM_CONNECTION"),
            host: getOsEnvOptional("TYPEORM_HOST"),
            url: getOsEnvOptional("TYPEORM_URL"),
            password: getOsEnv("TYPEORM_PASSWORD"),
            username: getOsEnv("TYPEORM_USERNAME"),
            port: toNumber(getOsEnvOptional("TYPEORM_PORT")),
            database: getOsEnvOptional("TYPEORM_DATABASE"),
            synchronize: toBool(getOsEnvOptional("TYPEORM_SYNCHRONIZE")),
            logging: toBool(getOsEnv("TYPEORM_LOGGING")),
            disabled: toBool(getOsEnv("TYPEORM_DISABLED")),
        },
        mongo: {
            type: getOsEnv("DB_CONNECTION"),
            host: getOsEnvOptional("DB_HOST"),
            password: getOsEnv("DB_PASSWORD"),
            username: getOsEnv("DB_USERNAME"),
            port: toNumber(getOsEnvOptional("DB_PORT")),
            database: getOsEnvOptional("DB_DATABASE"),
            synchronize: toBool(getOsEnvOptional("DB_SYNCHRONIZE")),
            logging: toBool(getOsEnv("DB_LOGGING")),
            disabled: toBool(getOsEnv("DB_DISABLED")),
        }
    },
    swagger: {
        enabled: toBool(getOsEnv("SWAGGER_ENABLED")),
        route: getOsEnv("SWAGGER_ROUTE"),
        file: getOsEnv("SWAGGER_FILE"),
        swaggerStatsRoute: getOsEnv("SWAGGER_STATS_ROUTE"),
    },
    metrics: {
        datadog: {
            traceEnabled: toBool(getOsEnvOptional("DD_TRACE_ENABLED") || "true"),
            env: getOsEnvOptional("DD_ENV") || "prod",
            agentHost: getOsEnvOptional("DD_AGENT_HOST") || "datadog.private.paystack.co",
            traceAgentPort: getOsEnvOptional("DD_TRACE_AGENT_PORT") || 8126,
            traceLogLevel: getOsEnvOptional("DD_TRACE_LOG_LEVEL") || "error",
            logInjection: toBool(getOsEnvOptional("DD_LOGS_INJECTION") || "true"),
            traceReportHostName: toBool(getOsEnvOptional("DD_TRACE_REPORT_HOSTNAME") || "true"),
            service: getOsEnvOptional("DD_SERVICE") || "compliance",
        },
        statsd: {
            port: toNumber(getOsEnvOptional("STATSD_PORT") || "8125"),
        },
    },
    constants: {
        jwtHasher: getOsEnv("JWT_HASHER"),
    },
    redis: {
        clusterIp: getOsEnvWithDefault("REDIS_CLUSTER_IP", "127.0.0.1"),
        port: getOsEnvWithDefault("REDIS_PORT", "6379"),
        username: getOsEnvWithDefault("REDIS_USER", ""),
        password: getOsEnvWithDefault("REDIS_PASSWORD", ""),
    }
};