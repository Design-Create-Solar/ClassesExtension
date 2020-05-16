const puppeteer = require("puppeteer");
const moment = require("moment");

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
    let obj = {};
    obj.description = document.querySelector(
      "div#section p.section_data"
    ).textContent;
    obj.slots = document
      .querySelector("div#pagewrap div#class_detail")
      .querySelector("div#enrl_mtng_info div.data-row")
      .querySelector("div.span1 > p").textContent;
    return obj;
  });

  await browser.close();
  return json;
}

//gets the class details for the subject (number) items down the list of subjects
//attempting to loop with this function does not always guarantee maintenance of order
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
  await page.waitFor(1000);

  let i = 0;
  while (i < number + 1) {
    await page.keyboard.press("ArrowDown");
    await page.waitFor(150);
    i++;
  }

  await page.waitFor(300);
  await page.keyboard.press("Enter");
  await page.waitFor(200);
  await page.keyboard.press("Enter");

  let isNull = false;
  await page.waitForNavigation({ timeout: 10000 }).catch(() => {
    isNull = true;
  });

  if (isNull == true) {
    await browser.close();
    return [{}];
  }

  //now on results page
  await page.waitForSelector("#divExpandAll");
  //expand all classes
  await page.focus("#divExpandAll > a");
  await page.waitFor(500);
  await page.keyboard.press("Enter");
  await page.waitFor(5000); //need to replace with smarter check

  //create JSONs
  let titles = await page.evaluate(async () => {
    let subject = document
      .querySelector(
        "div#divSearchResultsHeader > span#spanSearchResultsHeader"
      )
      .textContent.split(", ")[2];
    subjectSplit = subject.split(" (");
    let subjectName = subjectSplit[0];
    let subjectCode = subjectSplit[1].replace(")", "");
    let classes = []; //array of JSONs
    //PUT HERE: if multiple pages, create counter for pages,
    //while loop for counter and if counter > 1 go to next page by clicking right arrow
    if (document.querySelector("div.demo > div.jPagniate")) {
      numPages = document
        .querySelector("div.demo > div.jPagniate")
        .querySelector("ul.Jpag-pages")
        .getElementsByTagName("li").length;
    } else {
      numPages = 1;
    }
    while (numPages > 0) {
      let elements = document.querySelectorAll("div.class-title");
      for (var element of elements) {
        if (element != null) {
          let lectures = element.querySelectorAll("div.primary-row");
          for (var lecture of lectures) {
            let obj = {};
            let title = element.querySelector("h3");
            let spots = lecture.querySelector("div.statusColumn > p");
            let waitlist = lecture.querySelector("div.waitlistColumn > p");
            let days = lecture.querySelector("div.dayColumn a");
            let time = lecture.querySelector("div.timeColumn > p");
            let location = lecture.querySelector("div.locationColumn > p");
            let units = lecture.querySelector("div.unitsColumn > p");
            //classes with multiple instructors will return 2 names without a space in between the names
            let instructor = lecture.querySelector("div.instructorColumn > p");
            let detail = lecture.querySelector("div.sectionColumn a");
            obj.subjectName = subjectName;
            obj.subjectCode = subjectCode;
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
              obj.location = location.textContent.trim().replace("\n", "");
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
            let secondarySection = element.querySelector(
              "div.secondarySection"
            );
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
      if (numPages > 1) {
        //go to next page
        await page.focus("div.jPag-control-front > span.jPag-snext-img");
        await page.waitFor(500);
        await page.keyboard.press("Enter");
        //now on results page
        await page.waitForSelector("#divExpandAll");
        //expand all classes
        await page.focus("#divExpandAll > a");
        await page.waitFor(500);
        await page.keyboard.press("Enter");
        await page.waitFor(5000); //need to replace with smarter check
      }
      numPages -= 1;
    }

    return classes;
  });

  await browser.close();

  //loop through titles processing the times
  for (let i = 0; i < titles.length; i++) {
    if (titles[i].time == "" || titles[i].time.match(/\d+/) == null) {
      continue;
    }
    time = titles[i].time.split("-");

    timeStrings = [];
    for (let j = 0; j < time.length; j++) {
      if (time[j].includes(":")) {
        minutes = time[j].match(/\d+/g)[1];
      } else {
        minutes = "00";
      }
      hour = time[j].match(/\d+/)[0];
      //the 10 just means base 10
      int = parseInt(hour, 10);
      if (time[j].includes("pm")) {
        if (int + 12 < 24) {
          int += 12;
        }
      }
      timeStrings.push(int.toString() + minutes.toString());
    }
    titles[i].startTime = parseInt(
      moment(timeStrings[0], "hmm").format("HHmm"),
      10
    );
    titles[i].endTime = parseInt(
      moment(timeStrings[1], "hmm").format("HHmm"),
      10
    );

    //if there are discussions:
    if (titles[i].discussions != null) {
      for (let d = 0; d < titles[i].discussions.length; d++) {
        if (
          titles[i].discussions[d].match(/\d+/) == null ||
          titles[i].discussions[d] == ""
        ) {
          continue;
        }
        time = titles[i].discussions[d].split("-");

        timeStrings = [];
        for (let j = 0; j < time.length; j++) {
          if (time[j].includes(":")) {
            minutes = time[j].match(/\d+/g)[1];
          } else {
            minutes = "00";
          }
          hour = time[j].match(/\d+/)[0];
          //the 10 just means base 10
          int = parseInt(hour, 10);
          if (time[j].includes("pm")) {
            if (int + 12 < 24) {
              int += 12;
            }
          }
          timeStrings.push(int.toString() + minutes.toString());
        }
        titles[i].discussions[d] =
          moment(timeStrings[0], "hmm").format("HHmm") +
          "-" +
          moment(timeStrings[1], "hmm").format("HHmm");
      }
    }
  }
  return titles;
}

exports.getDescSlots = getDescSlots;
exports.getClassDetailsIter = getClassDetailsIter;
