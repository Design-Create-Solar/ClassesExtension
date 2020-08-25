const bodyParser = require("body-parser");
const express = require("express")
const cors = require("cors") 
 
const app = express()
app.use(cors())
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//routes
const documents = require("./routes/documents");
app.use("/documents", documents);

app.listen(port);
console.log("Listening on port " + port);

module.exports = app;
