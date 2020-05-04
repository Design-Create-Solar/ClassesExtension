const puppeteer = require("puppeteer");

//I dont know how to use this inside the evaluate function
function getPrimaryInfo(obj, element) {
  obj.title = element.querySelector("h3").textContent;
  obj.spots = element
    .querySelector("div.primary-row")
    .querySelector("div.statusColumn > p")
    .innerHTML.split("<br>")[1];
  obj.waitlist = element
    .querySelector("div.primary-row")
    .querySelector("div.waitlistColumn > p").textContent;
  obj.days = element
    .querySelector("div.primary-row")
    .querySelector("div.dayColumn a").textContent;
  obj.time = element
    .querySelector("div.primary-row")
    .querySelector("div.timeColumn > p").textContent;
  obj.location = element
    .querySelector("div.primary-row")
    .querySelector("div.locationColumn > p")
    .textContent.trim()
    .replace("\n", "");
  obj.units = element
    .querySelector("div.primary-row")
    .querySelector("div.unitsColumn > p").textContent;
  //classes with multiple instructors will return 2 names without a space in between the names
  obj.instructor = element
    .querySelector("div.primary-row")
    .querySelector("div.instructorColumn > p").textContent;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-first-run",
      "--no-sandbox",
      "--no-zygote",
      "--single-process",
    ],
  });
  console.log(await browser.version());
  const page = await browser.newPage();
  await page.goto("https://sa.ucla.edu/ro/public/soc", {
    waitUntil: "networkidle2",
  });
  await page.click("#select_filter_subject", { clickCount: 3 });
  await page.type("#select_filter_subject", "computer science");

  await page.waitFor(300);
  await page.keyboard.press("Enter");
  await page.waitFor(300);
  await Promise.all([page.waitForNavigation(), page.keyboard.press("Enter")]);
  //now on results page
  await page.waitForSelector("#divExpandAll");
  //expand all classes
  await page.focus("#divExpandAll > a");
  await page.keyboard.press("Enter");
  await page.waitFor(5000); //need to replace with smarter check

  await page.screenshot({ path: "test.png", fullPage: true });

  //create JSONs
  let titles = await page.evaluate(() => {
    let classes = []; //array of JSONs
    let elements = document.querySelectorAll("div.class-title");
    for (var element of elements) {
      if (element != null) {
        let lectures = element.querySelectorAll("div.primary-row");
        for (var lecture of lectures) {
          let obj = {};
          obj.title = element.querySelector("h3").textContent;
          obj.spots = lecture
            .querySelector("div.statusColumn > p")
            .innerHTML.split("<br>")[1];
          obj.waitlist = lecture.querySelector(
            "div.waitlistColumn > p"
          ).textContent;
          obj.days = lecture.querySelector("div.dayColumn a").textContent;
          obj.time = lecture.querySelector("div.timeColumn > p").textContent;
          obj.location = lecture
            .querySelector("div.locationColumn > p")
            .textContent.trim()
            .replace("\n", "");
          obj.units = lecture.querySelector("div.unitsColumn > p").textContent;
          //classes with multiple instructors will return 2 names without a space in between the names
          obj.instructor = lecture.querySelector(
            "div.instructorColumn > p"
          ).textContent;
          //discussions
          let secondarySection = element.querySelector("div.secondarySection");
          if (secondarySection != null) {
            let secondaryTimeElements = secondarySection.querySelectorAll(
              "div.timeColumn > p"
            );
            let discussions = [];
            for (var element of secondaryTimeElements) {
              discussions.push(element.textContent);
            }
            obj.discussions = discussions;
          }
          classes.push(obj);
        }
      }
    }
    return classes;
  });

  console.log(titles);
  console.log("Success!");
  await browser.close();
})();
