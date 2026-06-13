import canvaPlugin from "@canva/app-eslint-plugin";

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
      "templates/**/*",
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
];
