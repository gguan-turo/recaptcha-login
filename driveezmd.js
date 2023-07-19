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

  await page.goto("https://www.driveezmd.com/");

  // Extract the `sitekey` parameter from the page.
  const sitekey = await page.evaluate(() => {
    return document.querySelector(".g-recaptcha").getAttribute("data-sitekey");
  });

  const pageurl = await page.url();

  // Close the modal
  await page.waitForSelector("button#disableGovDelivery");
  await page.click("button#disableGovDelivery");

  // Get credential from onepass "maryland"
  await page.waitForSelector("input#username");
  await page.type("input#username", process.env.driverezmd_username);

  // await page.$eval(
  //   "input#username",
  //   (el) => (el.value = process.env.driverezmd_username)
  // );

  await page.waitForSelector("input#password");
  await page.type("input#password", process.env.driverezmd_password);

  // await page.$eval(
  //   "input#password",
  //   (el) => (el.value = process.env.driverezmd_password)
  // );

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
    document.getElementById("loginSubmit").removeAttribute("disabled");
    document
      .getElementById("recaptchaValidationToken")
      .setAttribute("value", captchaAnswer);
  }, captchaAnswer);

  const timeTaken = Date.now() - start;
  console.log("Total time taken : " + timeTaken + " milliseconds");

  // await page.evaluate(recaptchaCallback);

  await page.click("input#loginSubmit");

  await page.waitForTimeout(20000);

  browser.close();
})();
