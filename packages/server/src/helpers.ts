import ms from "ms";
import mongoose from "mongoose";
import formatDuration from "format-duration";
import _ from "lodash";
import Joi, { ObjectSchema } from "joi";
import { PaginationInput } from "@assignment1/core";

import { ErrorCode, newError } from "./error";

export function sleep(duration: number | string) {
  if (typeof duration === "string") {
    duration = ms(duration);
  }
  return new Promise((resolve) => setTimeout(resolve, <number>duration));
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { maxRetries?: number; delay?: number; backoff?: boolean } = {},
): Promise<T> {
  let err: any;
  const maxRetries = options.maxRetries || 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (e) {
      err = e;
      console.log("error occured:", e, "retrying...");
    }
    await sleep((options.delay ?? 3000) * (options.backoff !== false ? 1 + i : 1));
  }
  throw err;
}

export async function* batchIterator<T>(
  source: AsyncIterable<T> | Iterable<T>,
  size: number = 1,
): AsyncGenerator<T[], void, undefined> {
  let collection: T[] = [];
  for await (const item of source) {
    collection.push(item);
    if (collection.length == size) {
      yield collection;
      collection = [];
    }
  }
  if (collection.length) {
    yield collection;
  }
}

export function parseCursorOffset(cursor: string) {
  const content = Buffer.from(cursor, "base64").toString();
  const match = content.match(/^offset:\/\/(\d+)$/);
  if (!match) return null;
  const offset = Number(match[1]);
  return offset < 0 ? null : offset;
}

export function offsetByPage({ limit, page }: { limit: number; page: number }) {
  return (page - 1) * limit;
}

export function cursorFromOffset(offset: number) {
  return Buffer.from(`offset://${offset}`).toString("base64");
}

export function getOffset({ limit, page, after }: { limit: number; page: number; after?: string }) {
  if (after) {
    const cursorOffset = parseCursorOffset(after);
    if (cursorOffset === null) throw newError(ErrorCode.INVALID_REQUEST, "invalid cursor");
    return cursorOffset;
  } else {
    return offsetByPage({ limit, page });
  }
}

export function getPagination(params: PaginationInput) {
  const { limit = 10, page = 1, after } = params;
  const offset = getOffset({ limit, page, after });
  return { limit, page, after, offset };
}

export async function paginatedQuery<M, Q extends mongoose.FilterQuery<M>>(
  collection: mongoose.Model<M>,
  query: Q,
  params: PaginationInput & { sortBy?: any },
) {
  const { limit, offset, page } = getPagination(params);
  const { sortBy } = params;
  const [total, items] = await Promise.all([
    collection.count(query).exec(),
    collection
      .find(query)
      .sort(sortBy || { createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec(),
  ]);
  return {
    page,
    limit,
    total,
    offset,
    hasNext: total > offset + limit,
    items: items.map((item) => item.toObject<M>()),
    cursor: cursorFromOffset(Math.min(total, offset + limit)),
  };
}

export async function paginatedAgg<M, P extends mongoose.PipelineStage[]>(
  collection: mongoose.Model<M>,
  pipeline: P,
  params: PaginationInput,
) {
  const { limit, offset, page } = getPagination(params);
  const result = await collection.aggregate(pipeline);
  return {
    page,
    limit,
    total: -1,
    offset,
    hasNext: false,
    items: result,
    cursor: cursorFromOffset(offset + limit),
  };
}

export { formatDuration };

export function mustValidate<T>(validator: ObjectSchema<T>, input: any, contextPrefix?: string): T {
  const { value, error } = validator.validate(input);
  if (error) {
    if (contextPrefix) {
      throw new Joi.ValidationError(contextPrefix + ": " + error.message, error.details, error);
    } else {
      throw error;
    }
  }
  return value;
}
