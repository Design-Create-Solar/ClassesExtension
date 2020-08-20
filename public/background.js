// let doneByNavigator = false;

chrome.webRequest.onCompleted.addListener(
  function (details) {
    console.log("in requestor");
    console.log(details);
    if (
      details.url == "https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx" ||
      details.url == "https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx?"
    ) {
      chrome.tabs.executeScript({
        file: "/static/js/main.js",
      });
    } else {
      console.log("req not from myucla");
    }
  },
  {
    urls: ["https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx*"],
  }
);
