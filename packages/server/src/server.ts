import Koa from "koa";
import Router from "koa-router";
import {
  JSONRPCErrorCode,
  JSONRPCErrorException,
  JSONRPCRequest,
  JSONRPCServer,
} from "json-rpc-2.0";
import koaBodyParser from "koa-bodyparser";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import http from "http";

import { JsonRpcHandler } from "./handler";
import { ValidationError } from "joi";
import { rpcSchema, SessionState, User, RpcMethod } from "@assignment1/core";
import { ErrorCode } from "./error";
import { AppContext, AppProviders, AppState } from "./core";
import { mustValidate } from "./helpers";
import _ from "lodash";
import SuperJSON from "superjson";

export class ApiServer {
  app: Koa<AppState, AppContext>;
  server: http.Server;
  jsonRpc: JSONRPCServer<SessionState>;
  providers: AppProviders;
  rpcHandler: JsonRpcHandler;

  constructor(services: AppProviders) {
    this.app = new Koa();
    this.server = http.createServer(this.app.callback());
    this.jsonRpc = new JSONRPCServer<SessionState>({
      errorListener: this.errorListener,
    });
    this.providers = services;
  }

  errorListener = (_message: string, _data: unknown): void => {};

  init() {
    this.initMiddlewares();
    this.initJsonRpc();
    this.initRoutes();
  }

  initJsonRpc() {
    this.rpcHandler = new JsonRpcHandler(this.providers);
    const rpcHandler = this.rpcHandler as any;
    for (const [methodName, schema] of Object.entries(rpcSchema)) {
      this.jsonRpc.addMethod(
        methodName,
        this.rpcMethod(rpcHandler[methodName].bind(rpcHandler), schema),
      );
    }
  }

  private transformOut(output: any) {
    return SuperJSON.serialize(output);
  }

  private rpcMethod(handler: any, schema: RpcMethod<any, any>) {
    return async (...params: any[]) => {
      try {
        const [rawInput, ...rest] = params;
        const input = schema.validator ? mustValidate(schema.validator, rawInput) : rawInput;
        const result = await handler(input, ...rest);
        return this.transformOut(result);
      } catch (err) {
        if (err instanceof ValidationError) {
          throw new JSONRPCErrorException(err.message, JSONRPCErrorCode.InvalidParams, err.details);
        } else if (!(err instanceof JSONRPCErrorException)) {
          console.error("error occurred: ", err.toString(), err.stack);
          throw new JSONRPCErrorException(
            "internal server error",
            ErrorCode.INTERNAL_SERVER_ERROR,
            {},
          );
        } else {
          throw err;
        }
      }
    };
  }

  initMiddlewares() {
    this.app.use(async (ctx, next) => {
      ctx.set("Access-Control-Allow-Origin", "*");
      ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
      ctx.set("Access-Control-Allow-Headers", "*");
      await next();
    });
    this.app.use(koaBodyParser({}));
  }

  getSession(ctx: AppContext): SessionState {
    const tokenHeader = ctx.headers.authorization;
    if (tokenHeader) {
      const authToken = tokenHeader.split(" ")[1] || "";
      try {
        const user = jwt.verify(authToken, this.providers.config.auth.jwtSecret) as User;
        return { user, authToken };
      } catch (err) {
        if (err instanceof JsonWebTokenError) {
          return {};
        } else {
          throw err;
        }
      }
    }
    return {};
  }

  handleJsonRpcRequest = async (ctx: AppContext) => {
    const jsonRPCRequest = ctx.request.body as JSONRPCRequest;
    const jsonRPCResponse = await this.jsonRpc.receive(jsonRPCRequest, this.getSession(ctx));
    if (jsonRPCResponse) {
      ctx.body = jsonRPCResponse;
    } else {
      ctx.status = 204;
    }
  };

  initRoutes() {
    const router = new Router();
    router.post("/rpc", this.handleJsonRpcRequest);
    router.get("/", (ctx) => {
      return (ctx.body = { message: "hello" });
    });
    this.app.use(router.routes()).use(router.allowedMethods());
  }

  get config() {
    return this.providers.config;
  }

  start() {
    this.init();
    const port = this.config.apiserver.port;
    console.log(`starting apiserver on port ${port}`);
    this.server.listen(port, () => {
      process.send?.call("ready");
    });
  }
}
