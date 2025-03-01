import * as cheerio from "cheerio";
import chromeAwsLambda from "chrome-aws-lambda";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

let chrome = {};
let puppeteerInstance;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = chromeAwsLambda;
  puppeteerInstance = puppeteerCore;
} else {
  puppeteerInstance = puppeteer;
}

function parseId(idString) {
  return idString.split(":")[2].split("-")[0];
}

async function scrapePage(userId, timeout = 20000) {
  console.log(
    "AWS_LAMBDA_FUNCTION_VERSION: ",
    process.env.AWS_LAMBDA_FUNCTION_VERSION
  );
  console.log("Fetching followers via js");
  const url = `https://open.spotify.com/user/${userId}/followers`;

  let options = {};

  console.log("Chrome Args: ", chrome.args);
  console.log("Chrome DefaultViewport: ", chrome.defaultViewport);

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  const browser = await puppeteerInstance.launch(options);

  const page = await browser.newPage();

  try {
    await page.setDefaultNavigationTimeout(timeout);
    await page.goto(url, { waitUntil: "networkidle0" });

    const htmlContent = await page.content();

    const $ = cheerio.load(htmlContent);
    const matches = $('p[id^="card-title-spotify:user"]');

    const jsonArray = matches
      .map((_, element) => ({
        followerName: $(element).attr("title"),
        followerId: parseId($(element).attr("id")),
      }))
      .get();

    return JSON.stringify(jsonArray.length ? jsonArray : []);
  } catch (error) {
    if (error instanceof puppeteerInstance.errors.TimeoutError) {
      console.error(`Page load timed out after ${timeout / 1000} seconds`);
      return JSON.stringify({ error: "Timed out" });
    }
    throw error;
  } finally {
    await browser.close();
  }
}

export { scrapePage };

// import { Builder, By, until } from "selenium-webdriver";
// import { Options, ServiceBuilder } from "selenium-webdriver/chrome.js";
// import * as cheerio from "cheerio";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// function parseId(idString) {
//   return idString.split(":")[2].split("-")[0];
// }

// async function scrapePage(userId, timeout = 20000) {
//   const chromeDriverPath = path.join(__dirname, "drivers", "chromedriver");

//   const serviceBuilder = new ServiceBuilder(chromeDriverPath);

//   console.log("Fetching followers via js");
//   const url = `https://open.spotify.com/user/${userId}/followers`;

//   let options = new Options();
//   options.addArguments("--headless");
//   options.addArguments("--no-sandbox");

//   options.addArguments("--disable-dev-shm-usage");

//   const driver = await new Builder()
//     .forBrowser("chrome")
//     .setChromeOptions(options)
//     .setChromeService(serviceBuilder)
//     .build();

//   try {
//     await driver.manage().setTimeouts({ pageLoad: timeout });
//     await driver.get(url);

//     await driver.wait(until.elementLocated(By.tagName("body")), timeout);
//     (await driver.executeScript("return document.readyState")) === "complete";

//     const htmlContent = await driver.getPageSource();

//     const $ = cheerio.load(htmlContent);
//     const matches = $('p[id^="card-title-spotify:user"]');

//     const jsonArray = matches
//       .map((_, element) => ({
//         followerName: $(element).attr("title"),
//         followerId: parseId($(element).attr("id")),
//       }))
//       .get();

//     return JSON.stringify(jsonArray.length ? jsonArray : []);
//   } catch (error) {
//     if (error.name === "TimeoutError") {
//       console.error(`Page load timed out after ${timeout / 1000} seconds`);
//       return JSON.stringify({ error: "Timed out" });
//     }
//     throw error;
//   } finally {
//     await driver.quit();
//   }
// }

// if (import.meta.main) {
//   const userId = process.argv[2];
//   if (userId) {
//     scrapePage(userId)
//       .then((result) => console.log(result))
//       .catch((error) => console.error(error));
//   } else {
//     console.log(JSON.stringify({ error: "No user ID provided" }));
//   }
// }

// export { scrapePage };
