import { ParameterizedContext } from "koa";
import { Providers as AppProviders } from "./providers";

export interface AppState {}

export type AppContext = ParameterizedContext<AppState>;

export interface BaseModule extends AppProviders {}

export class BaseModule {
  constructor(providers: AppProviders) {
    Object.assign(this, providers);
  }
}

export { Providers as AppProviders, getProviders } from "./providers";
