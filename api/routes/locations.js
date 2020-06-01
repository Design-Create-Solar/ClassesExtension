var express = require("express");
var router = express.Router();
var axios = require("axios");
var Forecast = require("../models/Forecast");

//"./locations/"

router.get("/get", async function (req, res) {
  const forecast = await Forecast.find({ fullname: req.body.fullname });
  res.send(forecast);
});

router.post("/add", async function (req, res) {
  await axios({
    method: "post",
    url: "https://BestTime.app/api/v1/forecasts?",
    params: {
      api_key_private: "pri_833ae17eb7c745f4803be0ebe93bd467",
      venue_name: req.body.fullname,
      venue_address: req.body.address,
    },
  })
    .then((response) => {
      const forecast = new Forecast({
        fullname: req.body.fullname,
        data: response.data,
        headers: response.headers,
      });
      forecast.save();
      res.send(forecast);
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/update", async function (req, res) {
  await axios({
    method: "post",
    url: "https://BestTime.app/api/v1/forecasts?",
    params: {
      api_key_private: "pri_833ae17eb7c745f4803be0ebe93bd467",
      venue_name: req.body.fullname,
      venue_address: req.body.address,
    },
  })
    .then((response) => {
      Forecast.findOneAndUpdate(
        { fullname: req.body.fullname },
        { data: response.data, headers: response.headers },
        (err) => {
          if (err) return err;
          res.send("Updated!");
        }
      );
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
