import { assert } from "chai";
import _ from "lodash";

import { ApiServer } from "@assignment1/server";
import { getProviders } from "@assignment1/server";
import request from "supertest";
import SuperJSON from "superjson";

interface RpcTestCase {
  label: string;
  request: {
    method: string;
    params: any;
  };
  ignore?: string[];
  response: {
    result?: any;
    error?: any;
  };
}

const testCases: RpcTestCase[] = [
  {
    label: "user",
    request: {
      method: "getInfo",
      params: {},
    },
    response: {
      result: {
        session: {},
        system: {
          version: "0.0.1",
        },
      },
    },
  },
  {
    label: "user",
    request: {
      method: "userRegister",
      params: {
        email: "user1@gmail.com",
        password: "asdasd",
      },
    },
    response: {
      result: {
        user: {
          email: "user1@gmail.com",
        },
      },
    },
    ignore: ["authToken", "user.id"],
  },
  {
    label: "user",
    request: {
      method: "userLogin",
      params: {
        identifier: "user1@gmail.com",
        password: "asdasd",
      },
    },
    response: {
      result: {
        user: {
          email: "user1@gmail.com",
        },
      },
    },
    ignore: ["authToken", "user.id"],
  },
];

const providers = getProviders({
  configOverrides: {
    db: {
      uri: globalThis.__MONGO_URI__,
      database: globalThis.__MONGO_DB_NAME__,
    },
  },
});

afterAll(async () => {
  await providers.storage.close();
});

function transform(body: any, ignoredKeys: string[] = []) {
  if (body.result) {
    body.result = _.omit(body.result, ignoredKeys);
  }
  if (body.error) {
    body.error = _.omit(body.error, ["data", "stack"]);
  }
  return _.transform(body, (result: any, _value: any, key: any) => {
    if (key == "createdAt" || key == "updatedAt") {
      delete result[key];
    }
    return result;
  });
}

describe("rpc", () => {
  const apiServer = new ApiServer(providers);
  apiServer.init();

  const app = apiServer.server;
  let requestId = 0;

  for (const testCase of testCases) {
    it(`Request ${testCase.label}.${testCase.request.method}`, async () => {
      const jsonrpc = { jsonrpc: "2.0", id: ++requestId };
      const response = await request(app)
        .post("/rpc")
        .send({
          ...jsonrpc,
          ...testCase.request,
        })
        .expect(200);
      const body = response.body;
      if (body.result) {
        body.result = SuperJSON.deserialize(body.result);
      }

      assert.deepEqual(
        transform(body, testCase.ignore),
        transform({ ...jsonrpc, ...testCase.response }, testCase.ignore),
        testCase.label,
      );
    });
  }
});
