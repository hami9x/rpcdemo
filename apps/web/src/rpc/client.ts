import { RpcHandler, rpcSchema, RpcSchema, SessionState, SessionUser } from "@assignment1/core";
import axios, { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from "axios";
import { JSONRPCClient } from "json-rpc-2.0";

import { parseJwt } from "../utils";

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

  private createJsonRpcClient(): JSONRPCClient<RpcClientParams> {
    return new JSONRPCClient((jsonRPCRequest) =>
      this.httpClient
        .post(this.options.endpoint, jsonRPCRequest, this.getRequestConfig())
        .then((response) => {
          if (response.status === 200) {
            return this.jsonRpcClient.receive(response.data);
          } else if (jsonRPCRequest.id !== undefined) {
            return Promise.reject(new Error("JSONRPC error: " + response.statusText));
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
      service: this.service,
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
      const results = await this.jsonRpcClient.request(method, params, {});
      return this.transform(results, method);
    };
  }

  transform(result: any, method: keyof RpcSchema) {
    return result;
  }
}
