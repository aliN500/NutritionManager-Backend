import { config } from "dotenv";

const configFile = `./.env`;
config({ path: configFile });

const {
  MONGO_URI,
  PORT,
  JWT_SECRET,
  NODE_ENV,
  MESSAGE_BROKER_URL,
  FRONT_END_URL,
  EMAIL_PASSWORD,
  EMAIL,
  BACK_END_LINK,
  YOUR_COMPANY_LOGO_URL,
  APPNAME
} = process.env;
const corsOptions = {
  origin: FRONT_END_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
export default {
  YOUR_COMPANY_LOGO_URL,
  BACK_END_LINK,
  APPNAME,
  EMAIL_PASSWORD,
  EMAIL,
  MONGO_URI,
  PORT,
  JWT_SECRET,
  env: NODE_ENV,
  msgBrokerURL: MESSAGE_BROKER_URL,
  corsOptions,
};
