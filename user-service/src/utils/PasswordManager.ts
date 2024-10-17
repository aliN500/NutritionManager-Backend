import bcrypt from "bcryptjs";
const encryptPassword = async (password: string) => {
  const encryptedPassword = await bcrypt.hash(password, 12);
  return encryptedPassword;
};

const isPasswordMatch = async (password: string, userPassword: string) => {
  const result = await bcrypt.compare(password, userPassword);
  return result;
};

export { isPasswordMatch, encryptPassword };
