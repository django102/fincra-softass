import AuthenticationService from "../../../src/api/services/AuthenticationService";


export default class AuthenticationServiceMock extends AuthenticationService {
    public static getInstance(): AuthenticationService {
        return new AuthenticationService();
    }
}