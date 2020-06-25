const scraping = require("./classes3");
const forLoop = async () => {
    // var TOTAL_SUBJECTS = 6;
    var bigJson = [];
    // for (let i = 0; i < TOTAL_SUBJECTS; i++) {
    await scraping
    .getClassDetailsIter(30)
    .then((results) => {
        bigJson = [...bigJson, ...results];
    })
    .catch(console.error);
    // }
    for (var i=0; i<bigJson.length; i++) 
        console.log(bigJson[i].title)
    console.log(bigJson.length)
}

forLoop()