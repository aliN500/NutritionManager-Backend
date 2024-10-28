import { Model } from "mongoose";
import { IUser } from "../database";
import MailService, { Mailer } from "./MailService";
import Logger from "../utils/Logger";
import User, { UserModel } from "../database/models/UserModel";
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

      const mailOptions = {
        from: "Nutrition manager",
        to: user.email,
        subject: "Confirmation email",
        text: "This is my first email. I am so excited!",
      };

      await this.mailer.sendConfirmationEmail(mailOptions);
      this.logger.info(`Confirmation link sent: ${user}`);

      return createdUser;
    } catch (ex) {
      throw new Error(
        `failed to create user: ${JSON.stringify(user)}, ${(ex as Error).message
        }`
      );
    }
  }
}
const userService = new UsersService({ usersRepository: User, mailer: Mailer });
export default userService;
