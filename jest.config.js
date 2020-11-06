module.exports = {
  verbose: true,
  coverageDirectory: "coverage",
  testEnvironment: "node",
  "modulePathIgnorePatterns": [
    "debug.d.ts",
    "bhaskara"
  ],
  "watchPathIgnorePatterns": [
    "__fixtures__\\/[^/]+\\/.*(output|error)\\.js"
  ]
};
