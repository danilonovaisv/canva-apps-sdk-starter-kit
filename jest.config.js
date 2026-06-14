const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testRegex: "(/(tests|__tests__)/.*|(\\.|/)(tests))\\.tsx?$",
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  modulePathIgnorePatterns: ["<rootDir>/examples/"],
  transform: {
    ".+\\.(css)$": "<rootDir>/node_modules/jest-css-modules-transform",
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        astTransformers: {
          before: [
            {
              path: "@formatjs/ts-transformer/ts-jest-integration.js",
              options: {
                overrideIdFn: "[sha512:contenthash:base64:6]",
                ast: true,
              },
            },
          ],
        },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/templates/",
    "/reference_apps/",
    "/scripts/start/tests/",
    "/src/intents/content_publisher/",
    "/src/intents/dam/",
    "/src/intents/data_connector/",
    "/src/intents/gen_ai/",
    "/src/intents/hello_world/",
  ],
  setupFiles: ["<rootDir>/jest.setup.ts"],
};
