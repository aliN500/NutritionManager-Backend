import { Model } from "mongoose";
import { IUser } from "../database";
import MailService, { Mailer } from "./MailService";
import Logger from "../utils/Logger";
import User, { UserModel } from "../database/models/UserModel";
import config from "../config/config";
import jwt from "jsonwebtoken";
class UsersService {
  usersRepository: Model<IUser>;
  mailer: MailService;
  logger: Logger;

  constructor(data: { usersRepository: Model<IUser>, mailer: MailService }) {
    this.usersRepository = data.usersRepository;
    this.mailer = data.mailer;
    this.logger = new Logger("UsersService");
  }

  async findByEmail(email: string, includePassword: boolean = false): Promise<IUser | null> {
    if (includePassword)
      return await this.usersRepository.findOne({ email }).select(
        "+password"
      );
    else
      return await this.usersRepository.findOne({ email }).select(
        "-password"
      );
  }

  async createUser(user: UserModel): Promise<IUser> {
    try {
      const createdUser = await this.usersRepository.create(user);
      this.logger.info(`User created: ${user}`);

      const token = await this.createSendToken({ email: user.email, name: user.name, id: createdUser.id });
      const verificationLink: string = `${config.BACK_END_LINK}verification?token=` + token;

      await this.mailer.sendConfirmationEmail(user.email, verificationLink);
      this.logger.info(`Confirmation link sent: ${user}`);

      return createdUser;
    } catch (ex) {
      throw new Error(
        `failed to create user: ${JSON.stringify(user)}, ${(ex as Error).message
        }`
      );
    }
  }

  async createSendToken(user: { id: string, email: string, name: string }): Promise<string> {
    const jwtSecret = config.JWT_SECRET as string;
    const { name, email, id } = user;
    const token = jwt.sign({ name, email, id }, jwtSecret, {
      expiresIn: "1d",
    });
    return token;
  };
}
const userService = new UsersService({ usersRepository: User, mailer: Mailer });
export default userService;
