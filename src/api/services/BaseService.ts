export default abstract class BaseService {
    protected currentRequestHeaders: Record<string, any> = {};

    public setCurrentRequestHeaders = (headers: Record<string, any>) => {
        this.currentRequestHeaders = headers;
    };
}