export type WithoutId<T> = Omit<T, "id">;
export type OptionalId<T> = Omit<T, "id"> & { id?: string };
export type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type Override<T, R> = Omit<T, keyof R> & R;

export enum SortBy {
  Default = "default",
  Time = "time",
}

export interface SessionState {
  user?: User;
  authToken?: string;
}

export interface PaginatedList<T> {
  page?: number;
  limit: number;
  total: number;
  offset: number;
  hasNext: boolean;
  items: T[];
}

export type ProjectionSpec = 0 | 1 | Record<string, any>;

export interface KVEntry {
  key: string;
  value: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  Admin = "admin",
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  profile?: UserProfile;
}

export type SessionUser = Pick<User, "id" | "email" | "role">;

export interface UserProfile {
  name: string;
}
