//  @ts-check
import * as prettierPluginTailwindcss from "prettier-plugin-tailwindcss";

/** @type {import('prettier').Config} */
const config = {
  printWidth: 160,
  plugins: [prettierPluginTailwindcss],
  tailwindStylesheet: "./src/styles.css",
};

export default config;
