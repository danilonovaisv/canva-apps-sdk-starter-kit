import canvaPlugin from "@canva/app-eslint-plugin";
import reactPlugin from "eslint-plugin-react";

const disabledReactRules = Object.fromEntries(
  Object.keys(reactPlugin.rules).map((ruleName) => [
    `react/${ruleName}`,
    "off",
  ]),
);

export default [
  {
    ignores: [
      "**/node_modules/",
      "functions/lib/",
      "functions/.eslintrc.js",
      "**/dist",
      "**/*.d.ts",
      "**/*.d.tsx",
      "**/*.config.*",
      "templates/**",
      "examples/**",
      "src/intents/hello_world/**",
      "src/intents/gen_ai/**",
      "src/intents/content_publisher/**",
      "src/intents/data_connector/**",
      "src/intents/dam/**",
      "utils/backend/**",
      "functions/**",
      "scripts/**",
      "jest.setup.ts",
      "reference_apps/**",
    ],
  },
  ...canvaPlugin.configs.apps_no_i18n,
  {
    files: [
      "src/**/*",
      // Currently only the localization examples are localized and following the
      // formatjs guidelines. If more examples are localized, this list should be
      // updated:
      "examples/localization/**/*",
    ],
    ...canvaPlugin.configs.apps_i18n,
  },
  {
    files: ["src/**/*"],
    rules: disabledReactRules,
  },
  {
    files: ["src/intents/design_editor/**/*.ts", "src/intents/design_editor/**/*.tsx"],
    rules: {
      "formatjs/no-literal-string-in-jsx": "off",
      "formatjs/no-literal-string-in-object": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
