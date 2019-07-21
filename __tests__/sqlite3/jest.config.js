//

const {join} = require("path");

//

module.exports = {
  preset: "ts-jest",
  rootDir: "..",
  testRegex: "/__tests__/.*\\.spec\\.ts$",
  snapshotResolver: join(__dirname, "./snapshotResolver.js"),
  testEnvironmentOptions: require("./knexfile.ts"),
  testEnvironment: join(__dirname, "../..", require("../../package.json").main)
};
