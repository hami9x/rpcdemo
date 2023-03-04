import Joi from "joi";

export interface RpcMethod<Result, Input> {
  _input?: Input;
  _result?: Result;
  validator?: Joi.ObjectSchema<Input>;
}

export class RpcMethod<Result, Input> {
  constructor(props: Partial<RpcMethod<Result, Input>> = {}) {
    Object.assign(this, props);
  }

  input<NewInput>(validator: Joi.ObjectSchema<NewInput>): RpcMethod<Result, NewInput> {
    return new RpcMethod<Result, NewInput>({ validator });
  }
}

export function rpcMethod<Result, Input = {}>() {
  return new RpcMethod<Result, Input>();
}

export type RpcHandlerOf<
  RpcSchema extends Record<string, RpcMethod<unknown, unknown>>,
  RpcSession,
> = {
  [K in keyof RpcSchema]: (
    input: NonNullable<RpcSchema[K]["_input"]>,
    session?: RpcSession,
  ) => Promise<NonNullable<RpcSchema[K]["_result"]>>;
};
