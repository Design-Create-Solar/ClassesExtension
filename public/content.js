function getClassesFromDOM() {
    let classBoxes = document.querySelectorAll("div.planneritembox")

    var classes = []
    for (var box of classBoxes) {
        let content = box.innerText.split("\n")
        let name = content[0]
        let lecOrDis = content[1].split(" ")
        let type
        if (lecOrDis[0]=="Lec")
            type = "lec"
        else 
            type = "dis"
        let lecOrDisNum = lecOrDis[1]
        let obj = { name, type, lecOrDisNum }
        classes.push(obj)
    }
    
    return classes
}

chrome.runtime.sendMessage({
    from: "content",
    subject: "showBrowserAction"
})

// listen for msgs from popup
chrome.runtime.onMessage.addListener((msg, sender, res) => {
    // validate msg structure
    if ((msg.from === "popup") && (msg.subject === "DOMInfo")) {
        res(getClassesFromDOM())
    }
})

// chrome.runtime.sendMessage({greeting: "hello"}, function(res) {
//     console.log(response.farewell)
// })

// chrome.runtime.onMessage.addListener(
//     function(req, sender, sendRes) {
//       console.log(sender.tab ? "from a content script: " + sender.tab.url : "from the extension")
//       if (req.greeting == "hello")
//         sendRes({farewell: "goodbye"})
//     }
//   )

// chrome.runtime.onConnect.addListener(function(port) {
//     if(port.name == "uwu"){
//     port.onMessage.addListener(function(response) {
//         if(response.url == window.location.href){
//             chrome.runtime.sendMessage({
//                 type: "UWU",
//                 stuff: getClassesFromDOM()
//             })
//         }
//     }); 
// }
// });


// chrome.runtime.onMessage.addListener(req => {
//     if (req.type === "manidk") {
//         // const modal = document.createElement("dialog")
//         // modal.setAttribute("style", "height: 40%")
//         // modal.innerHTML = 
//         //     `
//         //         <iframe id="manidk2" style="height:100%"></iframe>
//         //         <div style="position:absolute; top:0px; left:5px;">
//         //             <button>x</button>
//         //         </div>
//         //     `
//         // document.body.appendChild(modal)
//         // const dialog = document.querySelector("dialog")
//         // dialog.showModal()

//         // const iframe = document.getElementById('manidk2')
//         // iframe.src = chrome.extension.getURL("index.html")
//         // iframe.frameBorder = 0

//         // dialog.querySelector("button").addEventListener("click", () => {
//         //     dialog.close()
//         // })
//     }
// })
