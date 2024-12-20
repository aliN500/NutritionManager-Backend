import { Model } from "mongoose";
import { IUser } from "../database";
import MailService, { Mailer } from "./MailService";
import Logger from "../utils/Logger";
import User, { UserModel } from "../database/models/UserModel";
import config from "../config/config";
import jwt from "jsonwebtoken";
class UsersService {
  private usersRepository: Model<IUser>;
  private mailer: MailService;
  private logger: Logger;

  constructor(data: { usersRepository: Model<IUser>, mailer: MailService }) {
    this.usersRepository = data.usersRepository;
    this.mailer = data.mailer;
    this.logger = new Logger("UsersService");
  }
  async getProfile(id: string): Promise<IUser | null> {
    return await this.usersRepository.findById(id).select(
      "-password"
    );
  }

  async updateProfile(id: string, data: { name: string, email: string }): Promise<IUser | null> {
    return await this.usersRepository.findByIdAndUpdate(id, {});
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

  async updateResetTokenByEmail(email: string, token: string): Promise<number> {
    const result = await this.usersRepository.updateOne({ email }, { resetToken: token });
    return result.modifiedCount;
  }

  async updateConfirmTokenByEmail(email: string, token: string): Promise<number> {
    const result = await this.usersRepository.updateOne({ email }, { confirmToken: token });
    return result.modifiedCount;
  }

  async findByEmailAndResetToken(email: string, token: string): Promise<IUser | null> {
    return await this.usersRepository.findOne({
      email,
      resetToken: token
    }).select(
      "-password"
    );
  }

  async findByEmailAndConfirmToken(email: string, token: string): Promise<IUser | null> {
    return await this.usersRepository.findOne({
      email,
      confirmToken: token
    }).select(
      "-password"
    );
  }

  async clearResetToken(email: string): Promise<number> {
    const result = await this.usersRepository.updateOne({ email }, { resetToken: null });
    return result.modifiedCount;
  }

  async createUser(user: UserModel): Promise<IUser> {
    try {
      const createdUser = await this.usersRepository.create(user);
      this.logger.info(`User created: ${user}`);

      const token = await this.createSendToken({ email: user.email, name: user.name, id: createdUser.id });
      const verificationLink: string = `${config.BACK_END_LINK}/verification?token=` + token;
      userService.updateConfirmTokenByEmail(user.email, token);
      await this.mailer.sendConfirmationEmail(user.email, verificationLink);
      this.logger.info(`Confirmation link sent: ${user}`);

      return createdUser;
    } catch (ex) {
      throw new Error(
        `failed to create user: ${JSON.stringify(user)}, ${(ex as Error).message}`
      );
    }
  }
  async resetPassword(email: string, password: string): Promise<boolean> {
    try {
      const createdUser = await this.usersRepository.updateOne({ email }, { password, resetToken: null });
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
      const user = await this.findByEmailAndConfirmToken(decoded.email, token);
      if (user && !user?.verified || !user?.active) {
        const res = await this.usersRepository.updateOne({ email: decoded.email, _id: decoded.id }, { verified: true, active: true, confirmToken: null });
        return user;
      } else
        throw new Error("Invalid token");
    }
    else {
      throw new Error("Invalid token");
    }
  }

  async verifyUserPassword(token: string): Promise<IUser | null> {
    if (!token)
      throw new Error("Invalid token");
    const decoded = this.decodeToken(token);
    if (decoded && decoded.email && decoded.id) {
      const user = await this.findByEmailAndResetToken(decoded.email, token);
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
