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

function getClassesFromDOM() {
    // wanna put jsons formatted as: 
    //  ["M", "W"]
    //  gte: 5
    //  lte: 6
    // for each class/dis
    // into one big array

    let days = jQuery.makeArray($("a.uit-clickover-bottom").filter(function () {
                    return this.innerText.match("M|T|W|R|F")
                }))
    let times = jQuery.makeArray($("td").filter(function () {
                    return this.innerText.match("^[0-9].*m$")
                }))
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
    {
        // let classBoxes = document.querySelectorAll("div.planneritembox")

        // var classes = []
        // for (var box of classBoxes) {
        //     let content = box.innerText.split("\n")
        //     let name = content[0]
        //     let lecOrDis = content[1].split(" ")
        //     let type
        //     if (lecOrDis[0]=="Lec")
        //         type = "lec"
        //     else 
        //         type = "dis"
        //     let lecOrDisNum = lecOrDis[1]
        //     let obj = { name, type, lecOrDisNum }
        //     classes.push(obj)
        // }
    
        // return classes
    }
}

// listen for msgs from popup
chrome.runtime.onMessage.addListener((msg, sender, res) => {
    // validate msg structure
    if ((msg.from === "popup") && (msg.subject === "DOMInfo")) {
        res(getClassesFromDOM())
    }
})

// var insertedNodes = []
// var observer = new MutationObserver(function(mutations) {
//     mutations.forEach(function(mutation) {
//         for (var i = 0; i < mutation.addedNodes.length; i++)
//             insertedNodes.push(mutation.addedNodes[i])
//     })
// })

// var targetNode = document.querySelector("div.daybox")
// observer.observe(targetNode, { childList: true})
// console.log(insertedNodes)