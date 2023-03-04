import _ from "lodash";

export function parseBoolean(value: string | undefined, defaultValue = false) {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value == "false" || value == "0" ? false : Boolean(value);
}
