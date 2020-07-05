// let doneByNavigator = false;

chrome.webRequest.onCompleted.addListener(
  function (details) {
    console.log("in requestor");
    console.log(details);
    if (
      details.url == "https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx" ||
      details.url == "https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx?"
    ) {
      console.log("came in here");
      chrome.tabs.executeScript({
        file: "/static/js/main.js",
      });
    } else {
      console.log("req not from myucla");
    }
  },
  { urls: ["https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx*"] }
);

// chrome.webNavigation.onDOMContentLoaded.addListener(
//   function (details) {
//     console.log("in navigator");
//     // console.log(details);
//     // console.log("in navigator bby; var: " + doneByNavigator);
//     // chrome.tabs.executeScript({
//     //   file: "/static/js/main.js",
//     // });
//     // doneByNavigator = true;
//   },
//   {
//     url: [{ "pathContains": "ClassPlanner" }],
//   }
// );

// function hashHandler() {
//   console.log("The hash has changed!");
//   alert("in background.js");
// }

// window.addEventListener("hashchange", hashHandler, false);
// chrome.webNavigation.onHistoryStateUpdated.addListener(
//   function (details) {
//     alert("url change");
//   },
//   { url: [{ "pathContains": "ClassPlanner" }] }
// );
