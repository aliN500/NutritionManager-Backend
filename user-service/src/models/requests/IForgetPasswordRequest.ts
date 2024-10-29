import IBaseRequest from "../IBaseRequest";

export default interface IForgetPasswordRequest extends IBaseRequest {
  email: string;
}
