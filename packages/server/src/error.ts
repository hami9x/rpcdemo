import { JSONRPCErrorException } from "json-rpc-2.0";
import _ from "lodash";

export enum ErrorCode {
  INVALID_REQUEST = 1001,
  UNAUTHENTICATED = 1002,
  UNAUTHORIZED = 1003,
  INTERNAL_SERVER_ERROR = 1004,
  NOT_FOUND = 1005,
}

export function getErrorMessage(code: ErrorCode) {
  return ErrorCode[code].toLowerCase().replace("_", " ");
}

export function newError(code: ErrorCode, message?: string, data?: any) {
  return new JSONRPCErrorException(message ?? getErrorMessage(code), code, data);
}
