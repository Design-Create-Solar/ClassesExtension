const puppeteer = require("puppeteer");

//grabs JSON of class description and slots given the link to the detail page
//remember, this function must complete its task before returning something
//attempting to call it without await or .then will result in no return value
async function getDescSlots(link) {
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
  const page = await browser.newPage();
  await page.goto(link, {
    waitUntil: "networkidle2",
  });
  const json = await page.evaluate(() => {
    let obj = {}
    obj.description = document.querySelector("div#section p.section_data").textContent
    obj.slots = document.querySelector("div#pagewrap div#class_detail").querySelector("div#enrl_mtng_info div.data-row").querySelector("div.span1 > p").textContent
    return obj
  })

  await browser.close();
  return json;
}

//returns title, spots, waitlist, days, time, location, units, instructor, class detail link
//for each class in the given subject
async function getClassDetails(subject) {
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
  const page = await browser.newPage();
  await page.goto("https://sa.ucla.edu/ro/public/soc", {
    waitUntil: "networkidle2",
  });
  await page.click("#select_filter_subject", { clickCount: 3 });
  await page.type("#select_filter_subject", subject); //search term here

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
          obj.detail = lecture.querySelector(
            "div.sectionColumn a"
          ).href
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

  await browser.close();
  return titles;
}

//gets the class details for the subject (number) items down the list of subjects
async function getClassDetailsIter(number) {
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
  const page = await browser.newPage();
  await page.goto("https://sa.ucla.edu/ro/public/soc", {
    waitUntil: "networkidle2",
  });
  await page.click("#select_filter_subject");
  await page.waitFor(200)
  for (var i = 0; i < number; i++) {
    await page.keyboard.press("ArrowDown");
    page.waitFor(100)
  }

  await page.waitFor(300);
  await page.keyboard.press("Enter");
  await page.waitFor(300);
  await Promise.all([page.waitForNavigation(), page.keyboard.press("Enter")]);
  //now on results page
  await page.waitForSelector("#divExpandAll");
  //expand all classes
  await page.focus("#divExpandAll > a");
  await page.waitFor(500)
  await page.keyboard.press("Enter");
  await page.waitFor(5000); //need to replace with smarter check

  //create JSONs
  let titles = await page.evaluate(() => {
    let classes = []; //array of JSONs
    let elements = document.querySelectorAll("div.class-title");
    for (var element of elements) {
      if (element != null) {
        let lectures = element.querySelectorAll("div.primary-row");
        for (var lecture of lectures) {
          let obj = {};
          let title = element.querySelector("h3")
          let spots = lecture
            .querySelector("div.statusColumn > p");
          let waitlist = lecture.querySelector(
            "div.waitlistColumn > p");
          let days = lecture.querySelector("div.dayColumn a");
          let time = lecture.querySelector("div.timeColumn > p");
          let location = lecture
            .querySelector("div.locationColumn > p");
          let units = lecture.querySelector("div.unitsColumn > p");
          //classes with multiple instructors will return 2 names without a space in between the names
          let instructor = lecture.querySelector(
            "div.instructorColumn > p"
          );
          let detail = lecture.querySelector(
            "div.sectionColumn a"
          )
          if (title != null) {
            obj.title = title.textContent;
          }
          if (spots != null) {
            obj.spots = spots.innerHTML.split("<br>")[1];
          }
          if (waitlist != null) {
            obj.waitlist = waitlist.textContent;
          }
          if (days != null) {
            obj.days = days.textContent;
          }
          if (time != null) {
            obj.time = time.textContent;
          }
          if (location != null) {
            obj.location = location.textContent.trim()
              .replace("\n", "");
          }
          if (units != null) {
            obj.units = units.textContent;
          }
          if (instructor != null) {
            obj.instructor = instructor.textContent;
          }
          if (detail != null) {
            obj.detail = detail.href;
          }
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

  await browser.close();
  return titles;
}

exports.getDescSlots = getDescSlots;
exports.getClassDetails = getClassDetails;
exports.getClassDetailsIter = getClassDetailsIter;