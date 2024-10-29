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
      const verificationLink: string = `${config.BACK_END_LINK}/verification?token=` + token;

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
  async resetPassword(email: string, password: string): Promise<boolean> {
    try {
      const createdUser = await this.usersRepository.updateOne({ email }, { password });
      return createdUser.modifiedCount === 1;
    } catch (ex) {
      throw new Error(
        `failed to reset user password: ${email}, ${(ex as Error).message
        }`
      );
    }
  }

  async verifyUser(token: string): Promise<IUser | null> {
    if (!token)
      throw new Error("Invalid token");

    const decoded = this.decodeToken(token);
    if (decoded && decoded.email && decoded.name && decoded.id) {
      const user = await this.findByEmail(decoded.email);
      console.log({ user, decoded });
      if (user && !user?.verified || !user?.active) {
        const res = await this.usersRepository.updateOne({ email: decoded.email, _id: decoded.id }, { verified: true, active: true });
      }
      return user;
    }
    else {
      throw new Error("Invalid token");
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

  decodeToken(token: string): { id: string, email: string, name: string } {
    const jwtSecret = config.JWT_SECRET as string;
    const decoded = jwt.verify(token, jwtSecret) as { id: string, email: string, name: string };
    return decoded;
  }
}
const userService = new UsersService({ usersRepository: User, mailer: Mailer });
export default userService;
