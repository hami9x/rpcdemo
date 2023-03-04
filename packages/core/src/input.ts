import Joi from "joi";
import { ProjectionSpec } from "./types";

export type ProjectionInput = Record<string, ProjectionSpec>;

export interface PaginationInput {
  limit?: number;
  page?: number;
  after?: string;
}

export interface UserRegisterInput {
  email: string;
  password: string;
}

export interface UserLoginInput {
  identifier: string;
  password: string;
}

export class Validator {
  static id() {
    return Joi.string().alphanum();
  }

  static withId(obj: Joi.ObjectSchema<any>): Joi.SchemaLike | Joi.SchemaLike[] | undefined {
    return obj.concat(Joi.object({ id: this.id().required() }));
  }

  static projection() {
    return Joi.object<ProjectionInput>().unknown(true);
  }

  static pagination(options: { defaultLimit?: number; maxLimit?: number; maxPage?: number } = {}) {
    return Joi.object({
      limit: this.limit(options.defaultLimit ?? 20, options.maxLimit ?? 20),
      page: Joi.number()
        .integer()
        .optional()
        .default(1)
        .min(1)
        .max(options.maxPage ?? 10),
      after: Joi.string().optional(),
    });
  }

  static limit(defaultValue: number, maxValue: number = 200) {
    return Joi.number().integer().optional().default(defaultValue).min(1).max(maxValue);
  }

  static email() {
    return Joi.string().email({ tlds: { allow: false } });
  }

  static userRegister() {
    return Joi.object<UserRegisterInput>({
      email: this.email().required(),
      password: Joi.string().min(6).max(256),
    });
  }

  static userLogin() {
    return Joi.object<UserLoginInput>({
      identifier: Joi.string()
        .required()
        .regex(/^[\w.@]+$/)
        .max(256),
      password: Joi.string().max(256),
    });
  }

  static getInfo() {
    return Joi.object<{}>();
  }
}
