type SignupUserHandlerParameterType = {
    email: string;
    password: string;
    retypePassword: string;
    firstName: string;
    lastName: string;
}

type LoginUserHandlerParameterType = {
    username: string;
    password: string;

}

export type { SignupUserHandlerParameterType, LoginUserHandlerParameterType }