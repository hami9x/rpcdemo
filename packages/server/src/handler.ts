// @ts-ignore
import pkgInfo from "../package.json";
import {
  RpcHandler,
  SessionState,
  GetInfoResult,
  UserLoginInput,
  UserLoginResult,
  UserRegisterInput,
  UserRegisterResult,
} from "@assignment1/core";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import _ from "lodash";

import { AppProviders, BaseModule } from "./core";
import { ErrorCode, newError } from "./error";

const defaultSystemInfo = {
  version: pkgInfo.version,
};

export class JsonRpcHandler extends BaseModule implements RpcHandler {
  constructor(services: AppProviders) {
    super(services);
  }

  private requireUser(session?: SessionState) {
    const user = session?.user;
    if (!user) {
      throw newError(ErrorCode.UNAUTHENTICATED);
    }
    return user;
  }

  async getInfo(_params: {}, session?: SessionState): Promise<GetInfoResult> {
    const systemInfo = await this.storage.values.findOne({ key: "systemInfo" });
    if (session?.user) {
      const userId = session.user.id;
      const user = await this.storage.users.findOne({ id: userId });
      if (!user) {
        throw newError(ErrorCode.INTERNAL_SERVER_ERROR, `user not found: ${userId}`);
      }
      session.user = user.toObject();
    }
    return {
      system: { ...defaultSystemInfo, ...(systemInfo?.toJSON().value || {}) },
      session,
    };
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private signAuthToken(user: { id: string; email: string; role?: string }) {
    return jwt.sign(user, this.config.auth.jwtSecret, this.config.auth.jwtOptions);
  }

  async userRegister(input: UserRegisterInput): Promise<UserRegisterResult> {
    const { email } = input;
    if (await this.storage.users.exists({ email })) {
      throw newError(ErrorCode.INVALID_REQUEST, "email already exists");
    }

    const userDoc = await this.storage.users.create({
      id: this.storage.generateId(),
      email: input.email,
      password: await this.hashPassword(input.password),
    });
    const user = userDoc.toObject();
    return {
      authToken: this.signAuthToken(_.pick(user, "id", "email", "role")),
      user,
    };
  }

  async userLogin(input: UserLoginInput): Promise<UserLoginResult> {
    const { identifier, password } = input;
    const userDoc = await this.storage.users.findOne({
      $or: [{ email: identifier }],
    });
    if (!userDoc || !userDoc.password || !(await bcrypt.compare(password, userDoc.password))) {
      return { ok: false };
    }
    const user = userDoc.toObject();
    return {
      ok: true,
      user,
      authToken: this.signAuthToken(_.omit(user)),
    };
  }
}
