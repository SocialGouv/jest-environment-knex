//

const { join, resolve, basename } = require("path");

// https://jestjs.io/docs/en/configuration.html#snapshotresolver-string
module.exports = {
  testPathForConsistencyCheck: join(
    "consistency_check",
    "__tests__",
    "example.spec.ts"
  ),
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    join(
      join(testPath, "..", basename(__dirname), "__snapshots__"),
      basename(testPath) + snapshotExtension
    ),
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    join(
      snapshotFilePath,
      "../../..",
      basename(snapshotFilePath.slice(0, -snapshotExtension.length))
    )
};
