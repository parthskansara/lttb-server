import { Builder, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import * as cheerio from "cheerio";

function parseId(idString) {
  return idString.split(":")[2].split("-")[0];
}

async function scrapePage(userId, timeout = 20000) {
  console.log("Fetching followers via js");
  const url = `https://open.spotify.com/user/${userId}/followers`;

  const options = new Options();
  options.addArguments("--headless");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.manage().setTimeouts({ pageLoad: timeout });
    await driver.get(url);

    await driver.wait(until.elementLocated(By.tagName("body")), timeout);
    (await driver.executeScript("return document.readyState")) === "complete";

    const htmlContent = await driver.getPageSource();

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
    if (error.name === "TimeoutError") {
      console.error(`Page load timed out after ${timeout / 1000} seconds`);
      return JSON.stringify({ error: "Timed out" });
    }
    throw error;
  } finally {
    await driver.quit();
  }
}

if (import.meta.main) {
  const userId = process.argv[2];
  if (userId) {
    scrapePage(userId)
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  } else {
    console.log(JSON.stringify({ error: "No user ID provided" }));
  }
}

export { scrapePage };
