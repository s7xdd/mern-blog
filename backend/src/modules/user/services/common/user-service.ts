import * as bcrypt from "bcrypt";

import { UserModel } from "../../models/user-schema";
import { handleMongooseErrors } from "../../../../shared/utils/helper/mongodb/mongo-functions";
import { createPayload } from "../../../../shared/utils/helper/common-functions";
import { UserProps } from "../../../auth/types/auth-types";

export const userService = {
  async findUserByUsername({ username }: { username: string }) {
    try {
      const user = await UserModel.findOne({ username });
      return user;
    } catch (error) {
      handleMongooseErrors(error);
    }
  },

  async findUserById({ _id }: { _id: string }) {
    try {
      const user = await UserModel.findById({ _id });
      return user;
    } catch (error) {
      handleMongooseErrors(error);
    }
  },

  async createUser(userData: UserProps) {
    try {
      const allowedFields = createPayload(userData, ["username", "email", "bio"]);
      console.log("userData", allowedFields);

      const hashedPassword = await bcrypt.hash(userData?.password, 10);

      const newUser = new UserModel({ ...allowedFields, password: hashedPassword });
      await newUser.save();
      return newUser;
    } catch (error) {
      handleMongooseErrors(error);
    }
  },

  async updateBlogCount({ _id, addBlog = true }: { _id: string; addBlog?: boolean }) {
    try {
      const user: any = await this.findUserById({ _id });
      const newBlogCount = Math.max(addBlog ? user.total_blogs + 1 : user.total_blogs - 1, 0);

      await user.updateOne({ total_blogs: newBlogCount });
    } catch (error) {
      handleMongooseErrors(error);
    }
  },
};
