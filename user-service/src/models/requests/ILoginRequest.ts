import IBaseRequest from "../IBaseRequest";

export default interface ILoginRequest extends IBaseRequest {
  email: string;
  password: string;
}
