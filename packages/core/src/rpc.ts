import { SessionState, User } from "./types";
import { Validator } from "./input";
import { RpcHandlerOf, rpcMethod } from "./base";

export interface GetInfoResult {
  system: { version: string };
  session?: SessionState;
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

export interface UserDepositResult {
  balanceAmount: number;
}

export const rpcSchema = {
  getInfo: rpcMethod<GetInfoResult>().input(Validator.getInfo()),
  userRegister: rpcMethod<UserRegisterResult>().input(Validator.userRegister()),
  userLogin: rpcMethod<UserLoginResult>().input(Validator.userLogin()),
  userDeposit: rpcMethod<UserDepositResult>().input(Validator.userDeposit()),
};

export type RpcSchema = typeof rpcSchema;
export type RpcHandler = RpcHandlerOf<RpcSchema, SessionState>;
