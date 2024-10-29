import IBaseRequest from "../IBaseRequest";

export default interface IResetPasswordRequest extends IBaseRequest {
    email: string;
    password: string;
    confirmPassword: string;
}