import puppeteer from "puppeteer";
import "dotenv/config";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.driveezmd.com/");

  await page.waitForSelector("#disableGovDelivery");
  await page.click("#disableGovDelivery");

  // Pass credential from onepass "Mypeachpass"
  await page.waitForSelector("input#username");
  await page.type("input#username", process.env.driverezmd_username);
  await page.waitForSelector("input#password");
  await page.type("input#password", process.env.driverezmd_password);

  //   await page.waitForTimeout(5000);

  const setAnswer = await page.evaluate(() => {
    document.getElementById("loginSubmit").removeAttribute("disabled");
  });

  await page.click("input#loginSubmit");

  await page.waitForTimeout(20000);

  browser.close();
})();
