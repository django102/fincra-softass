import { StatsD } from "hot-shots";
import { MicroframeworkLoader, MicroframeworkSettings } from "microframework-w3tec";
import { Container } from "typedi";

import { env } from "../env";


export const metricsLoader: MicroframeworkLoader = (settings: MicroframeworkSettings) => {
    console.log("Initializing StatsD client...");
    const statsd = new StatsD({
        port: env.metrics.statsd.port,
        globalTags: { env: env.metrics.datadog.env },
        errorHandler: (error) => {
            console.log(`StatsD client error: ${error}`);
        },
    });
    Container.set("datadog.statsd", statsd);
    settings.onShutdown(() => {
        console.log("Closing StatsD client...");
        statsd.close(error => {
            if (error) {
                console.log("Error closing StatsD client.", { error: error.message });
            } else {
                console.log("StatsD client closed.");
            }
            process.exit();
        });
    });
};
