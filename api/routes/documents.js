var express = require("express");
var router = express.Router();
const scraping = require("../../src/classes");

var elastic = require("../elasticsearch");

//request body should have index field and query field
/**
 * @param body format:
 * {
 * 		index: "indexName"
 * 		busySlots:[
 * 			{
 * 				day: "M"|"T"|"W"|"R"|"F",
 * 				gte: 4 digit int time
 * 				lte: 4 digit int time
 * 			}
 * 		]
 * }
 */
router.post("/search", function (req, res) {
  console.log("req.body.searchString is: ", req.body.searchString);
  let arrayOfShouldJsons = [];
  for (var json of req.body.busySlots) {
    let day = json.day;
    pushList = [
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: ['M', 'T', 'W', 'R', 'F'],
                fields: [day],
              },
            },
            {
              nested: {
                path: "times",
                query: {
                  range: {
                    "times.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionA[0].M',
                // 	'discussionA[0].T',
                // 	'discussionA[0].W',
                // 	'discussionA[0].R',
                // 	'discussionA[0].F',
                // ],
                fields: [`discussionA[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionA",
                query: {
                  range: {
                    "discussionA.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionB[0].M',
                // 	'discussionB[0].T',
                // 	'discussionB[0].W',
                // 	'discussionB[0].R',
                // 	'discussionB[0].F',
                // ],
                fields: [`discussionB[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionB",
                query: {
                  range: {
                    "discussionB.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionC[0].M',
                // 	'discussionC[0].T',
                // 	'discussionC[0].W',
                // 	'discussionC[0].R',
                // 	'discussionC[0].F',
                // ],
                fields: [`discussionC[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionC",
                query: {
                  range: {
                    "discussionC.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionD[0].M',
                // 	'discussionD[0].T',
                // 	'discussionD[0].W',
                // 	'discussionD[0].R',
                // 	'discussionD[0].F',
                // ],
                fields: [`discussionD[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionD",
                query: {
                  range: {
                    "discussionD.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionE[0].M',
                // 	'discussionE[0].T',
                // 	'discussionE[0].W',
                // 	'discussionE[0].R',
                // 	'discussionE[0].F',
                // ],
                fields: [`discussionE[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionE",
                query: {
                  range: {
                    "discussionE.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionF[0].M',
                // 	'discussionF[0].T',
                // 	'discussionF[0].W',
                // 	'discussionF[0].R',
                // 	'discussionF[0].F',
                // ],
                fields: [`discussionF[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionF",
                query: {
                  range: {
                    "discussionF.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionG[0].M',
                // 	'discussionG[0].T',
                // 	'discussionG[0].W',
                // 	'discussionG[0].R',
                // 	'discussionG[0].F',
                // ],
                fields: [`discussionG[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionG",
                query: {
                  range: {
                    "discussionG.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionH[0].M',
                // 	'discussionH[0].T',
                // 	'discussionH[0].W',
                // 	'discussionH[0].R',
                // 	'discussionH[0].F',
                // ],
                fields: [`discussionH[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionH",
                query: {
                  range: {
                    "discussionH.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionI[0].M',
                // 	'discussionI[0].T',
                // 	'discussionI[0].W',
                // 	'discussionI[0].R',
                // 	'discussionI[0].F',
                // ],
                fields: [`discussionI[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionI",
                query: {
                  range: {
                    "discussionI.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      {
        bool: {
          must: [
            {
              multi_match: {
                query: true,
                // fields: [
                // 	'discussionJ[0].M',
                // 	'discussionJ[0].T',
                // 	'discussionJ[0].W',
                // 	'discussionJ[0].R',
                // 	'discussionJ[0].F',
                // ],
                fields: [`discussionJ[0].${day}`],
              },
            },
            {
              nested: {
                path: "discussionJ",
                query: {
                  range: {
                    "discussionJ.time": {
                      gte: json.gte,
                      lte: json.lte,
                    },
                  },
                },
              },
            },
          ],
        },
      },
    ];
    arrayOfShouldJsons = [...arrayOfShouldJsons, ...pushList];
  }
  elastic
    .searchDoc({
      index: req.body.index,
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  subjectName: req.body.searchString,
                },
              },
            ],
            must_not: [
              {
                bool: {
                  should: arrayOfShouldJsons,
                },
              },
            ],
          },
        },
      },
    })
    .then(function (result) {
      res.json(result);
    })
    .catch((err) => console.log(err));
});

// router.get("/searchOpen", function (req, res) {
//   elastic.searchOpen(req.body).then(function (result) {
//     res.json(result);
//   });
// });

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
    .catch(res.send("Error creating index"));
});

router.post("/putMapping/:index", function (req, res) {
  elastic
    .putMapping(req.params.index)
    .then(res.send("Mapped!"))
    .catch(res.send("Error mapping"));
});

router.post("/populateClassesDB/:index", async function (req, res) {
  await elastic.deleteIndex(req.params.index);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await elastic.createIndex(req.params.index);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await elastic.putMapping(req.params.index);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const forLoop = async () => {
    var TOTAL_SUBJECTS = 169;
    var bigJson = [];
    for (let i = 0; i < TOTAL_SUBJECTS; i++) {
      await scraping
        .getClassDetailsIter(i)
        .then((results) => {
          bigJson = [...bigJson, ...results];
          console.log("done");
        })
        .catch(console.error);
      // if (bigJson.length!=0)
      //   console.log(bigJson[i].subjectName)
    }
    var bulk = [];
    var makebulk = function (list, index, callback) {
      for (var current in list) {
        let discussionsCounter = 0;
        let discussionsArray = [];
        while (discussionsCounter < 10) {
          try {
            if (list[current].discussions[discussionsCounter] != null) {
              discussionsArray[discussionsCounter] = [
                list[current].discussions[discussionsCounter],
              ];
            } else {
              discussionsArray[discussionsCounter] = [
                {
                  time: {
                    gte: 0,
                    lte: 0,
                  },
                  status: "Closed",
                  M: false,
                  T: false,
                  W: false,
                  R: false,
                  F: false,
                },
              ];
            }
          } catch {
            discussionsArray[discussionsCounter] = [
              {
                time: {
                  gte: 0,
                  lte: 0,
                },
                status: "Closed",
                M: false,
                T: false,
                W: false,
                R: false,
                F: false,
              },
            ];
          }
          discussionsCounter += 1;
        }
        bulk.push(
          {
            index: {
              _index: index,
            },
          },
          {
            subjectName: list[current].subjectName,
            subjectCode: list[current].subjectCode,
            title: list[current].title,
            status: list[current].status,
            spots: list[current].spots,
            waitlist: list[current].waitlist,
            M: list[current].M,
            T: list[current].T,
            W: list[current].W,
            R: list[current].R,
            F: list[current].F,
            times: [
              {
                time: {
                  gte: list[current].startTime,
                  lte: list[current].endTime,
                },
              },
            ],
            location: list[current].location,
            units: list[current].units,
            instructor: list[current].instructor,
            detail: list[current].detail,
            discussionA: discussionsArray[0],
            discussionB: discussionsArray[1],
            discussionC: discussionsArray[2],
            discussionD: discussionsArray[3],
            discussionE: discussionsArray[4],
            discussionF: discussionsArray[5],
            discussionG: discussionsArray[6],
            discussionH: discussionsArray[7],
            discussionI: discussionsArray[8],
            discussionJ: discussionsArray[9],
          }
        );
      }
      callback(bulk);
    };

    makebulk(bigJson, req.params.index, function (response) {
      elastic.indexall(response, req.params.index, function (response) {
        //console.log(response)
        console.log("Indexed");
      });
    });
  };
  await forLoop();
  res.send("If no errors, then bulk insert was completed successfully");
});

/* POST document to be indexed */
router.post("/", function (req, res) {
  elastic.insertDoc(req.body).then(function (result) {
    res.json(result);
  });
});

module.exports = router;
