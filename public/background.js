chrome.runtime.onMessage.addListener((msg, sender) => {
    // validate msg structure
    if ((msg.from === "content") && (msg.subject === "showBrowserAction")) {
        // enable browser action for requesting tab
        chrome.browserAction.show(sender.tab.id)
    }
})