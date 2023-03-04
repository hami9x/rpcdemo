import { rpcSchema, RpcSchema, SessionState } from "@assignment1/core";
import axios, { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from "axios";
import { JSONRPCClient } from "json-rpc-2.0";

import { parseJwt } from "../utils";

export interface RpcClientParams {}

export class RpcClient {
  service: RpcSchema;
  httpClient: AxiosInstance;
  jsonRpcClient: JSONRPCClient<RpcClientParams>;
  jwtToken?: string;
  session: SessionState;

  constructor(
    public options: {
      endpoint: string;
      httpClientOptions?: CreateAxiosDefaults<any>;
      httpClient?: AxiosInstance;
      service?: RpcSchema;
      jwtToken?: string;
      jsonRpcClient?: JSONRPCClient<RpcClientParams>;
      session?: SessionState;
    },
  ) {
    this.httpClient = options.httpClient ?? axios.create(options.httpClientOptions);
    this.service = options.service ?? this.createClientService();
    this.jsonRpcClient = options.jsonRpcClient ?? this.createJsonRpcClient();
    this.jwtToken = options.jwtToken;
    this.session = options.session ?? {};
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
      session: parseJwt(token),
    });
  }

  private createClientService(): RpcSchema {
    const service = {} as any;
    for (const method of Object.keys(rpcSchema)) {
      service[method] = this.createMethodWrapper(method as keyof RpcSchema);
    }
    return service as RpcSchema;
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
