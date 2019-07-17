module.exports = {
  preset: "ts-jest",
  roots: ["./src"],
  testEnvironmentOptions: require("./knexfile.ts"),
  testEnvironment: require("./package.json").main
};
