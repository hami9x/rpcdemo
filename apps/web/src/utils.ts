import ms from "ms";
import Joi from "joi";
import { FormValidateInput } from "@mantine/form/lib/types";

export function parseJwt(token: string): any {
  try {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (err) {
    throw new Error("error parsing JWT token");
  }
}

export function formatDuration(duration: number): string {
  if (duration >= ms("1d")) {
    return Math.floor(duration / ms("1d")) + "d";
  }
  if (duration >= ms("1h")) {
    return Math.floor(duration / ms("1h")) + "h";
  }
  if (duration >= ms("1m")) {
    return Math.floor(duration / ms("1m")) + "m";
  }
  if (duration >= ms("1s")) {
    return Math.floor(duration / ms("1s")) + "s";
  }
  return "0s";
}

export function toFormValidator<T>(schema: Joi.ObjectSchema<T>): FormValidateInput<T> {
  return (value) => {
    const { error } = schema.validate(value, { abortEarly: false });
    if (error) {
      return error.details.reduce((errors, detail) => {
        return { ...errors, [detail.path.join(".")]: detail.message };
      }, {});
    }
    return true;
  };
}
