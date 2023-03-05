const tsPreset = require("ts-jest/jest-preset");
const mongoPreset = require("@shelf/jest-mongodb/jest-preset");

const jestOverwrites = {
  setupFiles: ["<rootDir>/jest.setup.ts"],
};

module.exports = { ...tsPreset, ...mongoPreset, ...jestOverwrites };
