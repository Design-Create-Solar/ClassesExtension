var express = require("express");
var router = express.Router();
const scraping = require("../../src/classes");

var elastic = require("../elasticsearch");

/* GET suggestions */
router.get("/search/:input", function (req, res) {
  elastic.searchDoc(req.params.input).then(function (result) {
    res.json(result);
  });
});

router.delete("/:index", function (req, res) {
  elastic
    .deleteIndex(req.params.index)
    .then(res.send("Deleted index if it existed!"))
    .catch(res.send("Error deleting index"));
});

router.post("/createIndex/:indexName", function (req, res) {
  elastic
    .createIndex(req.params.indexName)
    .then(res.send("Created index!"))
    .catch(res.send("Error creating index :("));
});

router.post("/populateDB/:index", function (req, res) {
  const forLoop = async () => {
    var TOTAL_SUBJECTS = 2;
    var bigJson = [];
    for (let i = 0; i < TOTAL_SUBJECTS; i++) {
      await scraping
        .getClassDetailsIter(i)
        .then((results) => {
          bigJson = [...bigJson, ...results];
        })
        .catch(console.error);
    }
    var bulk = [];
    var makebulk = function (list, index, callback) {
      for (var current in list) {
        if (list[current].discussions == null) {
          bulk.push(
            {
              index: {
                _index: index,
                _type: "class",
              },
            },
            {
              subject: list[current].subject,
              title: list[current].title,
              spots: list[current].spots,
              waitlist: list[current].waitlist,
              days: list[current].days,
              time: list[current].time,
              location: list[current].location,
              units: list[current].units,
              instructor: list[current].instructor,
              detail: list[current].detail,
            }
          );
        } else {
          bulk.push(
            {
              index: {
                _index: index,
                _type: "class",
              },
            },
            {
              subject: list[current].subject,
              title: list[current].title,
              spots: list[current].spots,
              waitlist: list[current].waitlist,
              days: list[current].days,
              time: list[current].time,
              location: list[current].location,
              units: list[current].units,
              instructor: list[current].instructor,
              detail: list[current].detail,
              discussions: list[current].discussions,
            }
          );
        }
      }
      callback(bulk);
    };

    makebulk(bigJson, req.params.index, function (response) {
      console.log("Bulk content prepared");
      elastic.indexall(response, req.params.index, "class", function (
        response
      ) {
        console.log(response);
      });
    });
  };
  forLoop();
});

/* POST document to be indexed */
router.post("/", function (req, res) {
  elastic.insertDoc(req.body).then(function (result) {
    res.json(result);
  });
});

module.exports = router;
