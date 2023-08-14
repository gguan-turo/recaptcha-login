import puppeteer from "puppeteer";
import "dotenv/config";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://mypeachpass.com/user/login");

  // Pass credential from onepass "Mypeachpass"
  await page.waitForSelector("input[name=name]");
  await page.type("input[name=name]", process.env.peachpass_username);
  await page.waitForSelector("input[name=pass]");
  await page.type("input[name=pass]", process.env.peachpass_password);

  await page.waitForTimeout(5000);

  await page.click("input#edit-submit"); //peach

  await page.waitForTimeout(20000);

  browser.close();
})();
