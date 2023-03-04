import { SessionState, User } from "./types";
import { Validator } from "./input";
import { RpcHandlerOf, rpcMethod } from "./base";

export interface GetInfoResult {
  system: { version: string };
  session?: SessionState;
  user?: User;
}

export interface UserLoginResult {
  ok: boolean;
  user?: User;
  authToken?: string;
  message?: string;
}

export interface UserRegisterResult {
  user: User;
  authToken: string;
}

export const rpcSchema = {
  getInfo: rpcMethod<GetInfoResult>().input(Validator.getInfo()),
  userRegister: rpcMethod<UserRegisterResult>().input(Validator.userRegister()),
  userLogin: rpcMethod<UserLoginResult>().input(Validator.userLogin()),
};

export type RpcSchema = typeof rpcSchema;
export type RpcHandler = RpcHandlerOf<RpcSchema, SessionState>;
