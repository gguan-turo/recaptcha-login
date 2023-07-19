import puppeteer from "puppeteer";
import {Solver} from "2captcha-ts";
import "dotenv/config";

const solver = new Solver(process.env.solver_api); // Get from 1password 2captcha

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const start = Date.now();

  const page = await browser.newPage();

  await page.goto("https://www.txtag.org/txtagstorefront/en/login");

  await page.waitForSelector("button#cboxClose");
  await page.click("button#cboxClose");

  // Extract the `sitekey` parameter from the page.
  const sitekey = await page.evaluate(() => {
    return document.querySelector(".g-recaptcha").getAttribute("data-sitekey");
  });

  const pageurl = await page.url();

  await page.waitForTimeout(1000);

  // Get credential from onepass "Mypeachpass"
  await page.waitForSelector("input[name=j_username]");
  await page.type("input[name=j_username]", "thisisusername");
  await page.waitForSelector("input[name=j_password]");
  await page.type("input[name=j_password]", "thisispassword");

  const res = await solver.recaptcha({
    pageurl: pageurl,
    googlekey: sitekey,
  });

  // Getting a captcha response including a captcha answer
  const captchaAnswer = res.data;
  // Use captcha answer
  // It is not necessary to make this block visible, it is done here for clarity.
  const setAnswer = await page.evaluate((captchaAnswer) => {
    document.querySelector("#g-recaptcha-response").style.display = "block";
    document.querySelector("#g-recaptcha-response").value = captchaAnswer;
  }, captchaAnswer);

  await page.click("button#signInBtn"); //peach

  const timeTaken = Date.now() - start;
  console.log("Total time taken : " + timeTaken + " milliseconds");

  await page.waitForTimeout(30000);

  browser.close();
})();
