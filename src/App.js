/* global chrome */
import React, { Component } from "react";
import "./App.css";
import $ from "jquery";
import axios from "axios";
import { trackPromise } from "react-promise-tracker";
import Button from "@material-ui/core/Button";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      existingClasses: [], // unprocessed -- for UI
      /*  [{ days: "", times: "", type, subNum: ""}, { ... }] */
      processedExistingClasses: [],
      /* of the form
          [ { days[], gte: , lte: }, { days[], gte: , lte: }, ... ]
          ["M", "W"]
          gte: 5
          lte: 6
        */
      newClassBois: [],
      searchString: "",
      resultsSize: null,
      xml: false,
    };
    this.getClassesFromDB = this.getClassesFromDB.bind(this);
    this.renderResults = this.renderResults.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.getRows = this.getRows.bind(this);
  }

  componentDidMount() {
    this.setState({
      existingClasses: this.getClassesFromDOM(),
      processedExistingClasses: this.getTimesFromDOM(),
    });

    chrome.storage.local.get("newClassBois", (data) =>
      this.setState({ newClassBois: data.newClassBois })
    );
    chrome.storage.local.get("searchString", (data) =>
      this.setState({ searchString: data.searchString })
    );
    chrome.storage.local.get("resultsSize", (data) =>
      this.setState({ resultsSize: data.resultsSize })
    );
  }

  splitEasyTimes(stringBoi) {
    var reg = stringBoi.match(/[a-z]+|[^a-z]+/gi);
    // will split into arr of two elems: number time and am/pm
    // goal: get rid of the : in the 1st elem
    // in addition to taking care of 24 hr conversion

    let splitColonTime = reg[0].split(":");
    if (reg[1] === "pm")
      splitColonTime[0] = (Number(splitColonTime[0]) + 12).toString();

    // splitColonTime is array of either one or two elems
    var finalTimeForm = splitColonTime[0];
    if (splitColonTime.length === 2)
      finalTimeForm = splitColonTime[0] + splitColonTime[1];

    return finalTimeForm;
  }

  getDays() {
    let days = $.makeArray(
      $("a.uit-clickover-bottom").filter(function () {
        return this.innerText.match("M|T|W|R|F");
      })
    );
    return days;
  }

  getTimes() {
    let times = $.makeArray(
      $("td").filter(function () {
        return this.innerText.match("^[0-9].*m$");
      })
    );
    return times;
  }

  getTimesFromDOM() {
    // wanna put jsons formatted as:
    //  ["M", "W"]
    //  gte: 5
    //  lte: 6
    // for each class/dis
    // into one big array

    let days = this.getDays();
    let times = this.getTimes();
    var finalArr = [];
    var i, j;
    for (i = 0; i < days.length; i++) {
      let thingy = times[i].innerText.split("-");
      let start = thingy[0];
      let end = thingy[1];
      let processedStart = this.splitEasyTimes(start);
      let processedEnd = this.splitEasyTimes(end);

      var daysArr = [];
      var daysStr = days[i].innerText;
      for (j = 0; j < daysStr.length; j++) daysArr.push(daysStr[j]);

      var timeSlot = {};
      timeSlot.days = daysArr;
      timeSlot.gte = processedStart;
      timeSlot.lte = processedEnd;
      finalArr.push(timeSlot);
    }
    return finalArr;
  }

  getClassesFromDOM() {
    // want class names, days, and times
    let classTitles = document.querySelectorAll(
      "td.SubjectAreaName_ClassName > p"
    );
    // every even index, including 0, will look like "Class #: Subject"
    // every odd index will look like "180 - Introduction to Algorithms and Complexity"

    // for now want UI table to look like
    /* Existing Schedule
        ___________________________________________________________
       | days | time | type (dis/lec/sem) | class subject and num |
       | ...                                                      |
       |__________________________________________________________|
    */
    let types = document.querySelectorAll("td.section-header > a");
    let days = this.getDays();
    let times = this.getTimes();
    var i,
      sub,
      num,
      subNum,
      type,
      j = -1;
    var res = []; // [ { sub: , classNum: , days, time, type }, { ... }]
    var subNumArr = [];

    for (i = 0; i < classTitles.length; i++) {
      if (i % 2 === 0)
        // even -- sub name
        sub = classTitles[i].innerText.split(": ")[1];
      else {
        // odd -- class num
        num = classTitles[i].innerText.split(" - ")[0];
        subNum = sub + " " + num;
        subNumArr.push(subNum);
      }
    }
    for (i = 0; i < days.length; i++) {
      var slotJson = {};
      slotJson.days = days[i].innerText;
      slotJson.times = times[i].innerText;
      type = types[i].innerText.split(" ")[0];
      slotJson.type = type;
      if (type !== "Dis") j++;
      slotJson.subNum = subNumArr[j];
      res.push(slotJson);
    }
    return res;
  }

  getRows() {
    return this.state.newClassBois.map((slot, index) => {
      const { status, location, instructor, title, subjectCode } = slot;
      return (
        <tr className="myRows" key={index}>
          <td
            style={{ paddingTop: 10, paddingBottom: 10, textAlign: "center" }}
            key="status"
          >
            {status}
          </td>
          <td
            style={{ paddingTop: 10, paddingBottom: 10, textAlign: "center" }}
            key="location"
          >
            {location}
          </td>
          <td
            style={{ paddingTop: 10, paddingBottom: 10, textAlign: "center" }}
            key="instructor"
          >
            {instructor}
          </td>
          <td
            style={{ paddingTop: 10, paddingBottom: 10, textAlign: "center" }}
            key="subjectCode"
          >
            {subjectCode}
          </td>
          <td style={{ paddingTop: 10, paddingBottom: 10 }} key="title">
            {title}
          </td>
        </tr>
      );
    });
  }

  renderResults() {
    let { resultsSize } = this.state;
    if (resultsSize != null) {
      return (
        <div>
          <h3>results: {resultsSize}</h3>
          <table style={{ fontFamily: "ProximaNova" }}>
            <thead style={{ height: 40 }}>{this.getHeader()}</thead>
            <tbody>{this.getRows()}</tbody>
          </table>
        </div>
      );
    }
  }

  getHeader() {
    return (
      <tr
        className="myHeader"
        style={{
          fontSize: 25,
        }}
      >
        <th
          style={{
            backgroundColor: "#4560ab",
            color: "white",
            paddingTop: 20,
            paddingBottom: 20,
            textAlign: "center",
            paddingLeft: 10,
            paddingRight: 10,
          }}
          key={"status"}
        >
          Status
        </th>
        <th
          style={{
            backgroundColor: "#4560ab",
            color: "white",
            paddingTop: 20,
            paddingBottom: 20,
            textAlign: "center",
            paddingLeft: 10,
            paddingRight: 10,
          }}
          key={"location"}
        >
          Location
        </th>
        <th
          style={{
            backgroundColor: "#4560ab",
            color: "white",
            paddingTop: 20,
            paddingBottom: 20,
            textAlign: "center",
            paddingLeft: 10,
            paddingRight: 10,
          }}
          key={"instructor"}
        >
          Instructor
        </th>
        <th
          style={{
            backgroundColor: "#4560ab",
            color: "white",
            paddingTop: 20,
            paddingBottom: 20,
            textAlign: "center",
            paddingLeft: 10,
            paddingRight: 10,
          }}
          key={"subjectCode"}
        >
          Subject
        </th>
        <th
          style={{
            backgroundColor: "#4560ab",
            color: "white",
            paddingTop: 20,
            paddingBottom: 20,
            textAlign: "center",
            maxWidth: "10em",
          }}
          key={"title"}
        >
          Title
        </th>
      </tr>
    );
  }

  handleChange(event) {
    this.setState({ searchString: event.target.value });
  }

  getClassesFromDB(e) {
    e.preventDefault(); // to prevent that automatic hard refresh after submit
    let arr = [];
    this.state.processedExistingClasses.forEach((el) => {
      el.days.forEach((day) =>
        arr.push({ day: day, gte: el.gte, lte: el.lte })
      );
    });
    trackPromise(
      axios({
        method: "post",
        url: "https://designcreatesolar.com/api/documents/search/",
        // url: "http://localhost:5000/documents/search/",
        data: {
          index: "firsttest",
          busySlots: arr,
          searchString: this.state.searchString,
        },
      })
    )
      .then(
        function (res) {
          this.setState({
            newClassBois: res.data.hits.hits.map((el) => el._source),
            resultsSize: res.data.hits.total.value,
          });
          let { newClassBois, resultsSize, searchString } = this.state;
          chrome.storage.local.set({ "newClassBois": newClassBois });
          chrome.storage.local.set({ "resultsSize": resultsSize });
          chrome.storage.local.set({ "searchString": searchString });
        }.bind(this)
      )
      .catch(console.trace);
  }

  render() {
    return (
      <div className="App" width="100%" style={{ border: 0, margin: 0 }}>
        <div style={{ alignItems: "left" }}>
          <h2>ClassHelper</h2>
        </div>
        <form onSubmit={this.getClassesFromDB} style={{ display: "flex" }}>
          <input
            style={{ width: "70%", padding: 10 }}
            placeholder="Enter a Subject Name (ex: computer science)"
            onChange={(evt) => this.handleChange(evt)}
          />

          <Button
            style={{
              backgroundColor: "#4560ab",
              color: "white",
              fontWeight: 20,
            }}
            onClick={this.getClassesFromDB}
          >
            Go!
          </Button>
        </form>
        {this.renderResults()}
      </div>
    );
  }
}

export default App;
