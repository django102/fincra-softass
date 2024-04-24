import { Container } from "typedi";

import { Logger as WinstonLogger } from "../lib/logger";


export function Logger(): ParameterDecorator {
    return (object, propertyKey, index): any => {
        const logger = new WinstonLogger();
        const propertyName = propertyKey ? propertyKey.toString() : "";
        Container.registerHandler({ object, propertyName, index, value: () => logger });
    };
}

export { LoggerInterface } from "../lib/logger";
