const bodyParser = require("body-parser");
const express = require("express"),
  app = express(),
  port = 5000;
const mongoose = require("mongoose");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//mongoose setup
let dev_db_url =
  "mongodb+srv://tedusername:tedpassword@testingblocksdb-grscr.mongodb.net/test?retryWrites=true&w=majority";
let mongoDB = dev_db_url;
mongoose.connect(
  mongoDB,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => console.log("connection to mongoDB successful")
);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
//end mongoose setup

//routes
const documents = require("./routes/documents");
app.use("/documents", documents);

const locations = require("./routes/locations");
app.use("/locations", locations);

app.listen(port);
console.log("Listening on port " + port);

module.exports = app;
