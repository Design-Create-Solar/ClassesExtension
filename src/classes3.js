const puppeteer = require("puppeteer");
const moment = require("moment");

//grabs JSON of class description and slots given the link to the detail page CURRENTLY DOES NOT WORK ON MULTIPLE PAGES
//remember, this function must complete its task before returning something
//attempting to call it without await or .then will result in no return value
async function getDescSlots(link) {
  const browser = await puppeteer.launch();
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
  const browser = await puppeteer.launch({headless: false});
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
  await page
    .waitForNavigation({
      timeout: 10000,
    })
    .catch(() => {
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
  await page.waitFor(10000);
  //if multiple pages, create counter for pages,
  //while loop for counter and if counter > 1 go to next page by clicking right arrow
  let numPages = 1;

  let multiplePages = await page.$("div.demo > div.demo1.jPaginate");

  if (multiplePages != null) {
    numPages = await page.evaluate(() => {
      let numPages = document
        .querySelectorAll("div.jPaginate > div")[1]
        .querySelector("ul")
        .getElementsByTagName("li").length;
      return numPages;
    });
  }

  let classInfo = [];
  while (numPages > 0) {
    //create JSONs
    classInfo = [
      ...classInfo,
      ...(await page.evaluate(async () => {
        let subject = document.querySelector("div#divSearchResultsHeader > span#spanSearchResultsHeader").textContent.split(", ")[2];
        let subjectSplit = subject.split(" (");
        let subjectName = subjectSplit[0];
        let subjectCode = "";
        if (subjectSplit.length == 2)
          subjectCode = subjectSplit[1].replace(")", "");
        else 
          subjectCode = subjectName
        let classes = []; //array of JSONs

        let elements = document.querySelectorAll("div.class-title");
        for (var element of elements) {
          if (element != null) {
            let lectures = element.querySelectorAll("div.primary-row");
            for (var lecture of lectures) {
              let time = lecture.querySelector("div.timeColumn > p");
              if (time == null || time.innerText == "" || time.innerText == "To be arranged") 
                break;
              let obj = {};
              let title = element.querySelector("h3");
              let status = lecture.querySelector("div.statusColumn > p");
              let waitlist = lecture.querySelector("div.waitlistColumn > p");
              let days = lecture.querySelector("div.dayColumn a");
              let location = lecture.querySelector("div.locationColumn > p");
              let units = lecture.querySelector("div.unitsColumn > p");
              let instructor = lecture.querySelector("div.instructorColumn > p");
              let detail = lecture.querySelector("div.sectionColumn a");
              obj.subjectName = subjectName;
              obj.subjectCode = subjectCode;
              if (title != null) 
                obj.title = title.innerText;
              if (status != null) {
                obj.status = status.innerText.split("\n")[0].replace(/ .*/, "");
                obj.spots = status.innerHTML.split("<br>")[1];
              }
              if (waitlist != null) 
                obj.waitlist = waitlist.innerText;
              if (days != null) {
                let daysString = days.innerText;
                obj.M = false;
                obj.T = false;
                obj.W = false;
                obj.R = false;
                obj.F = false;
                for (i in daysString) {
                  switch (daysString[i]) {
                    case "M":
                      obj.M = true;
                      break;
                    case "T":
                      obj.T = true;
                      break;
                    case "W":
                      obj.W = true;
                      break;
                    case "R":
                      obj.R = true;
                      break;
                    case "F":
                      obj.F = true;
                      break;
                  }
                }
              }
              if (time != null) 
                obj.time = time.innerText;
              if (location != null) {
                obj.location = location.innerText.trim().replace("\n", "");
              }
              if (units != null) 
                obj.units = units.innerText;
              //classes with multiple instructors will return names with a comma in between the names
              if (instructor != null) {
                obj.instructor = instructor.innerText.replace("\n", ", ");
              }
              if (detail != null) 
                obj.detail = detail.href;
              //discussions
              let secondarySection = element.querySelector("div.secondarySection");
              if (secondarySection != null) {
                let secondaryTimeElements = secondarySection.querySelectorAll("div.timeColumn > p");
                let secondaryStatusElements = secondarySection.querySelectorAll("div.statusColumn > p");
                let secondaryDayElements = secondarySection.querySelectorAll("div.dayColumn a");
                let discussions = [];
                let statusCounter = 0;
                let daysCounter = 0;
                for (var thingy of secondaryTimeElements) {
                  let discussionObj = {};
                  discussionObj.time = thingy.textContent;
                  discussionObj.status = secondaryStatusElements[
                    statusCounter
                  ].innerText.split("\n")[0].replace(/ .*/, "");

                  discussionObj.M = false;
                  discussionObj.T = false;
                  discussionObj.W = false;
                  discussionObj.R = false;
                  discussionObj.F = false;
                  if (secondaryDayElements[daysCounter] != null && secondaryDayElements[daysCounter] != "Not scheduled") {
                    let daysString = secondaryDayElements[daysCounter].innerText;
                    for (i in daysString) {
                      switch (daysString[i]) {
                        case "M":
                          discussionObj.M = true;
                          break;
                        case "T":
                          discussionObj.T = true;
                          break;
                        case "W":
                          discussionObj.W = true;
                          break;
                        case "R":
                          discussionObj.R = true;
                          break;
                        case "F":
                          discussionObj.F = true;
                          break;
                      }
                    }
                  }

                  discussions.push(discussionObj);
                  statusCounter += 1;
                  daysCounter += 1;
                }
                obj.discussions = discussions;
              }
              classes.push(obj);
            }
          }
        }
        return classes;
      })),
    ];
    if (numPages > 1) {
      //go to next page
      await page.$eval("div.jPag-control-front > span.jPag-snext-img", (elem) =>
        elem.click()
      );
      await page.waitFor(500);

      //now on results page
      await page.waitForSelector("#divExpandAll");
      //expand all classes
      await page.focus("#divExpandAll > a");

      await page.waitFor(500);
      await page.keyboard.press("Enter");

      await page.waitFor(10000);
    }

    numPages -= 1;
  }

//   await browser.close();
  //loop through classInfo processing the times
  for (let i = 0; i < classInfo.length; i++) {
    console.log(classInfo[i].title)
    if (classInfo[i].time == "" || classInfo[i].time.match(/\d+/) == null) {
      continue;
    }
    time = classInfo[i].time.split("-");

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
    classInfo[i].startTime = parseInt(
      moment(timeStrings[0], "hmm").format("HHmm"),
      10
    );
    classInfo[i].endTime = parseInt(
      moment(timeStrings[1], "hmm").format("HHmm"),
      10
    );

    //if there are discussions:
    if (
      classInfo[i].discussions != null &&
      classInfo[i].discussions.length > 0
    ) {
      for (let d = 0; d < classInfo[i].discussions.length; d++) {
        if (
          classInfo[i].discussions[d].time.match(/\d+/) == null ||
          classInfo[i].discussions[d].time == ""
        ) {
          continue;
        }
        time = classInfo[i].discussions[d].time.split("-");

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
        let startTime = parseInt(
          moment(timeStrings[0], "hmm").format("HHmm"),
          10
        );
        let endTime = parseInt(
          moment(timeStrings[1], "hmm").format("HHmm"),
          10
        );
        classInfo[i].discussions[d].time = {
          gte: startTime,
          lte: endTime,
        };
        // console.log(classInfo[i].discussions[d].time);
      }
    }
  }
  return classInfo;
}

exports.getDescSlots = getDescSlots;
exports.getClassDetailsIter = getClassDetailsIter;
