import IBaseRequest from "../IBaseRequest";

export default interface IRegisterRequest extends IBaseRequest {
  email: string;
  password: string;
  name: string;
}
