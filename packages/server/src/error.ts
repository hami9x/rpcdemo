import { JSONRPCErrorException } from "json-rpc-2.0";
import { ErrorCode } from "@assignment1/core";
import _ from "lodash";

export { ErrorCode } from "@assignment1/core";

export function getErrorMessage(code: ErrorCode) {
  return ErrorCode[code].toLowerCase().replace("_", " ");
}

export function newError(code: ErrorCode, message?: string, data?: any) {
  return new JSONRPCErrorException(message ?? getErrorMessage(code), code, data);
}
