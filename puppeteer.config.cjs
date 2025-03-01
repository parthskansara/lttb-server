import { join } from "path";

/**
 * @type {import("puppeteer").Configuration}
 */
const config = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};

export default config;
