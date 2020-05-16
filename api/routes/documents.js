var express = require("express");
var router = express.Router();
const scraping = require("../../src/classes");

var elastic = require("../elasticsearch");

//request body should have index field and query field
router.get("/search", function (req, res) {
  elastic.searchDoc(req.body).then(function (result) {
    res.json(result);
  });
});

router.delete("/:index", function (req, res) {
  elastic
    .deleteIndex(req.params.index)
    .then(res.send("Deleted index if it existed!"))
    .catch(res.send("Error deleting index"));
});

router.post("/createIndex/:index", function (req, res) {
  elastic
    .createIndex(req.params.index)
    .then(res.send("Created index!"))
    .catch(res.send("Error creating index :("));
});

router.post("/populateClassesDB/:index", async function (req, res) {
  await elastic.deleteIndex(req.params.index);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await elastic.createIndex(req.params.index);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await elastic.putMapping(req.params.index);

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
              subjectName: list[current].subjectName,
              subjectCode: list[current].subjectCode,
              title: list[current].title,
              spots: list[current].spots,
              waitlist: list[current].waitlist,
              days: list[current].days,
              times: [
                {
                  time: {
                    gte: 20,
                    lte: 30,
                  },
                },
              ],
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
              subjectName: list[current].subjectName,
              subjectCode: list[current].subjectCode,
              title: list[current].title,
              spots: list[current].spots,
              waitlist: list[current].waitlist,
              days: list[current].days,
              times: [
                {
                  time: {
                    gte: 20,
                    lte: 30,
                  },
                },
              ],
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
      elastic.indexall(response, req.params.index, "class", function (
        response
      ) {
        //console.log(response)
        console.log("Indexed");
      });
    });
  };
  await forLoop();
  res.send("Complete.");
});

/* POST document to be indexed */
router.post("/", function (req, res) {
  elastic.insertDoc(req.body).then(function (result) {
    res.json(result);
  });
});

module.exports = router;
