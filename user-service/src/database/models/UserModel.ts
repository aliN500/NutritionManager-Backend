import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  resetToken: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean,
  verified: boolean,
  deleted: boolean;
}
export interface UserModel {
  name: string;
  email: string;
  password: string;
  resetToken: string;
  verified: boolean,
  active: boolean,
  deleted: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name must be provided"],
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email."],
    },
    resetToken: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      trim: false,
      required: [true, "Password must be provided"],
      minlength: 8,
    },
    active: {
      type: Boolean,
    },
    verified: {
      type: Boolean,
    },
    deleted: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
