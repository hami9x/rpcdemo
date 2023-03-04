import * as core from "@assignment1/core";
import { Schema } from "mongoose";
export * from "@assignment1/core";

function buildModelProperties(options: { transform?: (doc: any, ret: any) => any } = {}) {
  return {
    toObject: {
      transform: function (doc: any, ret: any) {
        delete ret._id;
        delete ret.__v;
        if (options.transform) {
          options.transform(doc, ret);
        }
      },
    },
  };
}

export const KVEntrySchema = new Schema<core.KVEntry>(
  {
    key: { type: String, index: true },
    value: { type: Object },
  },
  { timestamps: true },
);

export const UserProfileSchema = new Schema<core.UserProfile>(
  {
    name: { type: String, index: true },
  },
  {
    minimize: false,
    _id: false,
    timestamps: true,
  },
);

export const UserSchema = new Schema<core.User>(
  {
    id: { type: String, unique: true },
    email: { type: String, index: true },
    password: { type: String },
    profile: { type: UserProfileSchema },
  },
  {
    minimize: false,
    timestamps: true,
    ...buildModelProperties({
      transform: function (_doc, ret) {
        delete ret.password;
      },
    }),
  },
);
