chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (details.type === "main_frame") {
      // on actual refresh -- as opposed to weird soft refresh upon xml req
      chrome.storage.local.remove("searchString");
      chrome.storage.local.remove("newClassBois");
      chrome.storage.local.remove("resultsSize");
    }
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
