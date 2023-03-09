import { RpcHandler, rpcSchema, RpcSchema, SessionUser, ErrorCode } from "@auctiondemo/core";
import axios, { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from "axios";
import {
  JSONRPCClient,
  JSONRPCResponse,
  JSONRPCErrorException,
  JSONRPCErrorCode,
} from "json-rpc-2.0";
import SuperJSON from "superjson";
import { showError } from "./notification";

import { parseJwt } from "./utils";

export interface RpcClientParams {}

export class RpcClient {
  service: RpcHandler;
  httpClient: AxiosInstance;
  jsonRpcClient: JSONRPCClient<RpcClientParams>;
  jwtToken?: string;
  user?: SessionUser;

  constructor(
    public options: {
      endpoint: string;
      httpClientOptions?: CreateAxiosDefaults<any>;
      httpClient?: AxiosInstance;
      service?: RpcHandler;
      jwtToken?: string;
      jsonRpcClient?: JSONRPCClient<RpcClientParams>;
      user?: SessionUser;
    },
  ) {
    this.httpClient = options.httpClient ?? axios.create(options.httpClientOptions);
    this.service = options.service ?? this.createClientService();
    this.jsonRpcClient = options.jsonRpcClient ?? this.createJsonRpcClient();
    this.jwtToken = options.jwtToken;
    this.user = options.user;
  }

  private transformIn(data: any) {
    if (data.result) {
      data.result = SuperJSON.deserialize(data.result);
    }
    return data;
  }

  private createJsonRpcClient(): JSONRPCClient<RpcClientParams> {
    return new JSONRPCClient((jsonRPCRequest) =>
      this.httpClient
        .post(this.options.endpoint, jsonRPCRequest, this.getRequestConfig())
        .then((response) => {
          if (response.status === 200) {
            return this.jsonRpcClient.receive(this.transformIn(response.data) as JSONRPCResponse);
          } else {
            return Promise.reject(new Error("Unexpected JSONRPC error"));
          }
        }),
    );
  }

  getRequestConfig(): AxiosRequestConfig<any> {
    return { headers: { authorization: this.jwtToken ? `Bearer ${this.jwtToken}` : undefined } };
  }

  withSession(token: string) {
    return new RpcClient({
      ...this.options,
      httpClient: this.httpClient,
      jwtToken: token,
      user: parseJwt(token),
    });
  }

  private createClientService(): RpcHandler {
    const service = {} as any;
    for (const method of Object.keys(rpcSchema)) {
      service[method] = this.createMethodWrapper(method as keyof RpcSchema);
    }
    return service as RpcHandler;
  }

  private createMethodWrapper(method: keyof RpcSchema): any {
    return async (params: any) => {
      try {
        return await this.jsonRpcClient.request(method, params, {});
      } catch (err: any) {
        if (err instanceof JSONRPCErrorException) {
          if (err.code == ErrorCode.INVALID_REQUEST || err.code == JSONRPCErrorCode.InvalidParams) {
            showError({ message: err.message ?? "Invalid request" });
          } else {
            showError({ message: err.message ?? "Unknown error" });
          }
        }
        throw err;
      }
    };
  }
}
