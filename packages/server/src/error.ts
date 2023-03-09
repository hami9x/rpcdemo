import { JSONRPCErrorException } from "json-rpc-2.0";
import { ErrorCode } from "@auctiondemo/core";
import _ from "lodash";

export { ErrorCode } from "@auctiondemo/core";

export function getErrorMessage(code: ErrorCode) {
  return ErrorCode[code].toLowerCase().replace("_", " ");
}

export function newError(code: ErrorCode, message?: string, data?: any) {
  return new JSONRPCErrorException(message ?? getErrorMessage(code), code, data);
}
