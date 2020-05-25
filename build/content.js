// Some credit goes to "Easy Bruinwalk Ratings" Chrome Extension team 
// @RobertUrsua and @preethamrn on Github
// for hint on how to get app to rerender once background page updates

function splitEasyTimes(stringBoi) {
    var reg = stringBoi.match(/[a-z]+|[^a-z]+/gi)
    // will split into arr of two elems: number time and am/pm
    // goal: get rid of the : in the 1st elem 
    // in addition to taking care of 24 hr conversion
    
    let splitColonTime = reg[0].split(":")
    if (reg[1] == "pm")
       splitColonTime[0] = (Number(splitColonTime[0])+12).toString()

    // splitColonTime is array of either one or two elems
    var finalTimeForm = splitColonTime[0]
    if (splitColonTime.length == 2) 
        finalTimeForm = splitColonTime[0] + splitColonTime[1]
    
    return finalTimeForm
}

function getDays() {
    let days = jQuery.makeArray($("a.uit-clickover-bottom").filter(function () {
        return this.innerText.match("M|T|W|R|F")
    }))
    return days
}

function getTimes() {
    let times = jQuery.makeArray($("td").filter(function () {
        return this.innerText.match("^[0-9].*m$")
    }))
    return times
}

function getTimesFromDOM() {
    // wanna put jsons formatted as: 
    //  ["M", "W"]
    //  gte: 5
    //  lte: 6
    // for each class/dis
    // into one big array

    let days = getDays()
    let times = getTimes()
    var finalArr = []
    var i, j
    for (i = 0; i < days.length; i++) {
        let thingy = times[i].innerText.split("-")
        let start = thingy[0]
        let end = thingy[1]
        let processedStart = splitEasyTimes(start)
        let processedEnd = splitEasyTimes(end)

        var daysArr = []
        var daysStr = days[i].innerText
        for (j=0; j<daysStr.length; j++)
            daysArr.push(daysStr[j])
        
        var timeSlot = {}
        timeSlot.days = daysArr
        timeSlot.gte = processedStart
        timeSlot.lte = processedEnd
        finalArr.push(timeSlot)
    }
    return finalArr
}

function getClassesFromDOM() {
    // want class names, days, and times
    let classTitles = document.querySelectorAll("td.SubjectAreaName_ClassName > p")
    // every even index, including 0, will look like "Class #: Subject"
    // every odd index will look like "180 - Introduction to Algorithms and Complexity"

    // for now want UI table to look like
    /* Existing Schedule
        ___________________________________________________________
       | days | time | type (dis/lec/sem) | class subject and num |
       | ...                                                      |
       |__________________________________________________________|
    */
    let types = document.querySelectorAll("td.section-header > a")
    let days = getDays()
    let times = getTimes()
    var i, sub, num, subNum, type, j=-1;
    var res = []; // [ { sub: , classNum: , days, time, type }, { ... }]
    var subNumArr = []

    for (i = 0; i < classTitles.length; i++) {
        if (i % 2 == 0)  // even -- sub name
            sub = classTitles[i].innerText.split(": ")[1]
        else { // odd -- class num 
            num = classTitles[i].innerText.split(" - ")[0]
            subNum = sub + " " + num
            subNumArr.push(subNum)
        }
    }
    for (i = 0; i < days.length; i++) {
        var slotJson = {}
        slotJson.days = days[i].innerText
        slotJson.times = times[i].innerText
        type = types[i].innerText.split(" ")[0]
        slotJson.type = type
        if (type != "Dis")
            j++
        slotJson.subNum = subNumArr[j]
        res.push(slotJson)
    }
    return res
}

// listen for msgs from popup
chrome.runtime.onMessage.addListener((msg, sender, res) => {
    // validate msg structure
    if ((msg.from === "popup") && (msg.subject === "processed")) {
        res(getTimesFromDOM())
    }
})

chrome.runtime.onMessage.addListener((msg, sender, res) => {
    // validate msg structure
    if ((msg.from === "popup") && (msg.subject === "UI")) {
        res(getClassesFromDOM())
    }
})

var timeout = null
document.addEventListener("DOMSubtreeModified", 
    function() {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(listener, 1000)
    }, false
)

function listener() {
    chrome.runtime.sendMessage(
        {from: "content", subject: "newClasses", stuff: getClassesFromDOM()},
        res => console.log("msg sent")
    )
}