// @ts-ignore
import pkgInfo from "../package.json";
import {
  RpcHandler,
  SessionState,
  GetInfoResult,
  UserLoginInput,
  UserLoginResult,
  UserRegisterInput,
  UserRegisterResult,
  SessionUser,
  UserDepositInput,
  UserDepositResult,
  CreateItemInput,
  ItemCreateResult,
  FindItemsResult,
  FindItemsInput,
  ItemStatus,
} from "@assignment1/core";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import _ from "lodash";

import { AppProviders, BaseModule } from "./core";
import { ErrorCode, newError } from "./error";
import { paginatedQuery } from "./helpers";
import { CreateBidInput, CreateBidResult, User } from "./providers/storage/models";

const defaultSystemInfo = {
  version: pkgInfo.version,
};

export class JsonRpcHandler extends BaseModule implements RpcHandler {
  constructor(services: AppProviders) {
    super(services);
  }

  private requireUser(session?: SessionState): SessionUser {
    const user = session?.user;
    if (!user) {
      throw newError(ErrorCode.UNAUTHENTICATED);
    }
    return user;
  }

  private async requireFetchUser(session: SessionState | undefined): Promise<User> {
    const user = this.requireUser(session);
    const userDoc = await this.storage.users.findOne({ id: user.id });
    if (!userDoc) {
      throw newError(ErrorCode.INTERNAL_SERVER_ERROR, `User not found: ${user.id}`);
    }
    return userDoc.toObject();
  }

  async getInfo(_params: {}, session?: SessionState): Promise<GetInfoResult> {
    const systemInfo = await this.storage.values.findOne({ key: "systemInfo" });
    if (session?.user) {
      const userId = session.user.id;
      const user = await this.storage.users.findOne({ id: userId });
      if (!user) {
        throw newError(ErrorCode.INTERNAL_SERVER_ERROR, `User not found: ${userId}`);
      }
      session.user = user.toObject();
    }
    return {
      system: { ...defaultSystemInfo, ...(systemInfo?.toJSON().value || {}) },
      session,
    };
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  private signAuthToken(user: SessionUser) {
    return jwt.sign(user, this.config.auth.jwtSecret, this.config.auth.jwtOptions);
  }

  async userRegister(input: UserRegisterInput): Promise<UserRegisterResult> {
    const { email } = input;
    if (await this.storage.users.exists({ email })) {
      throw newError(ErrorCode.INVALID_REQUEST, "Email already exists");
    }

    const userDoc = await this.storage.users.create({
      id: this.storage.generateId(),
      email: input.email,
      password: await this.hashPassword(input.password),
    });
    const user = userDoc.toObject();
    return {
      authToken: this.signAuthToken(_.pick(user, "id", "email", "role")),
      user,
    };
  }

  async userLogin(input: UserLoginInput): Promise<UserLoginResult> {
    const { identifier, password } = input;
    const userDoc = await this.storage.users.findOne({
      $or: [{ email: identifier }],
    });
    if (!userDoc || !userDoc.password || !(await bcrypt.compare(password, userDoc.password))) {
      return { ok: false, message: "Invalid email or password" };
    }
    const user = userDoc.toObject();
    return {
      ok: true,
      user,
      authToken: this.signAuthToken(_.omit(user)),
    };
  }

  async userDeposit(input: UserDepositInput, session?: SessionState): Promise<UserDepositResult> {
    const { amount } = input;
    const user = this.requireUser(session);
    const userDoc = await this.storage.users.findOne({ id: user.id });
    if (!userDoc) {
      throw newError(ErrorCode.INTERNAL_SERVER_ERROR, `User not found: ${user.id}`);
    }
    userDoc.balanceAmount = (userDoc.balanceAmount || 0) + amount;
    await userDoc.save();
    return { balanceAmount: userDoc.balanceAmount! };
  }

  async createItem(
    input: CreateItemInput,
    session?: SessionState | undefined,
  ): Promise<ItemCreateResult> {
    const user = this.requireUser(session);
    if (input.endingAt <= new Date()) {
      throw newError(ErrorCode.INVALID_REQUEST, "Ending date must be in the future");
    }

    const itemDoc = await this.storage.items.create({
      id: this.storage.generateId(),
      userId: user.id,
      name: input.name,
      startingPrice: input.startingPrice,
      currentPrice: input.startingPrice,
      endingAt: input.endingAt,
    });
    return { item: itemDoc.toObject() };
  }

  async findItems(input: FindItemsInput): Promise<FindItemsResult> {
    const query: any = {};
    const filterStatus = input.filter?.status;
    if (filterStatus) {
      query.endingAt =
        filterStatus == ItemStatus.Active ? { $gt: new Date() } : { $lte: new Date() };
    }
    return await paginatedQuery(this.storage.items, query, input);
  }

  async createBid(input: CreateBidInput, session?: SessionState): Promise<CreateBidResult> {
    const user = await this.requireFetchUser(session);

    // validate
    const oldBid = await this.storage.bids.findOne({ itemId: input.itemId, userId: user.id });
    if (oldBid && oldBid.createdAt > new Date(Date.now() - 5 * 1000)) {
      throw newError(ErrorCode.INVALID_REQUEST, "You can only bid once every 5 seconds");
    }
    const item = await this.storage.items.findOne({ id: input.itemId });
    if (!item) {
      throw newError(ErrorCode.INVALID_REQUEST, "Item not found");
    }
    if (item.endingAt <= new Date()) {
      throw newError(ErrorCode.INVALID_REQUEST, "Auction has ended");
    }
    if (item.currentPrice >= input.price) {
      throw newError(ErrorCode.INVALID_REQUEST, "Bid price too low");
    }

    // check balance
    const reclaimedCost = oldBid?.price ?? 0;
    const newCost = input.price;
    const netCost = reclaimedCost - newCost;
    if ((user.balanceAmount ?? 0) + netCost < 0) {
      throw newError(ErrorCode.INVALID_REQUEST, "Account balance not enough");
    }

    const [bidDoc] = await this.storage.transact((session) => {
      return Promise.all([
        this.storage.bids.findOneAndUpdate(
          {
            itemId: input.itemId,
            userId: user.id,
          },
          {
            id: this.storage.generateId(),
            price: input.price,
            itemId: input.itemId,
            userId: user.id,
          },
          { session, new: true, upsert: true },
        ),
        this.storage.users.findOneAndUpdate(
          { id: user.id },
          { $inc: { balanceAmount: netCost } },
          { session, new: true },
        ),
        this.storage.items.updateOne(
          { id: input.itemId },
          { $set: { currentPrice: input.price } },
          { session },
        ),
      ]);
    });
    return { bid: bidDoc.toObject() };
  }
}
