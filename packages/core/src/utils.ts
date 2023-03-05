import _ from "lodash";
import { PaginatedList } from "./types";

export function parseBoolean(value: string | undefined, defaultValue = false) {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value == "false" || value == "0" ? false : Boolean(value);
}

export function paginatedListDefault<T>(): PaginatedList<T> {
  return {
    items: [],
    total: 0,
    limit: 0,
    offset: 0,
    hasNext: false,
  };
}
