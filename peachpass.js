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

  await page.goto("https://mypeachpass.com/user/login");

  // Extract the `sitekey` parameter from the page.
  const sitekey = await page.evaluate(() => {
    return document.querySelector(".g-recaptcha").getAttribute("data-sitekey");
  });

  const pageurl = await page.url();

  // Get credential from onepass "Mypeachpass"
  await page.waitForSelector("input[name=name]");
  await page.type("input[name=name]", process.env.peachpass_username);
  await page.waitForSelector("input[name=pass]");
  await page.type("input[name=pass]", process.env.peachpass_password);

  const res = await solver.recaptcha({
    pageurl: pageurl,
    googlekey: sitekey,
  });

  // Getting a captcha response including a captcha answer
  const captchaAnswer = res.data;
  //   console.log(captchaAnswer, "captchaAnswer");
  // Use captcha answer
  // It is not necessary to make this block visible, it is done here for clarity.
  const setAnswer = await page.evaluate((captchaAnswer) => {
    document.querySelector("#g-recaptcha-response").style.display = "block";
    document.querySelector("#g-recaptcha-response").value = captchaAnswer;
  }, captchaAnswer);

  await page.click("input#edit-submit"); //peach

  await page.waitForSelector(".basic-wrapper.title-block", {
    visible: true,
    timeout: 0,
  });

  const timeTaken = Date.now() - start;
  console.log("Total time taken : " + timeTaken + " milliseconds");

  browser.close();
})();
