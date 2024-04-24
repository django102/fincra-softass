import { MicroframeworkLoader } from "microframework-w3tec";
import { useContainer as routingUseContainer } from "routing-controllers";
import { Container } from "typedi";


export const iocLoader: MicroframeworkLoader = () => {

    /**
     * Setup routing-controllers to use typedi container.
     */
    routingUseContainer(Container);
};
