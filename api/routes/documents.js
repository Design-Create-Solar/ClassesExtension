var express = require("express");
var router = express.Router();

var elastic = require("../elasticsearch");

/* GET suggestions */
router.get("/search/:input", function (req, res) {
  elastic.searchDoc(req.params.input).then(function (result) {
    res.json(result);
  });
});

router.post("/createIndex/:indexName", function (req, res) {
  elastic
    .createIndex(req.params.indexName)
    .then(res.send("Created index!"))
    .catch(res.send("Error creating index :("));
});

router.post("/populateDB"),
  function (req, res) {
    const forLoop = async () => {
      var bigJson = [];
      var thingy = { arr: [] };
      for (let i = 0; i < TOTAL_SUBJECTS; i++) {
        await scraping
          .getClassDetailsIter(i)
          .then((results) => {
            bigJson = [...bigJson, ...results];
          })
          .catch(console.error);
      }
      thingy.arr = bigJson;

      elastic.indexall(bigJson);

      forLoop();
    };
  };

/* POST document to be indexed */
router.post("/", function (req, res) {
  elastic.insertDoc(req.body).then(function (result) {
    res.json(result);
  });
});

module.exports = router;
