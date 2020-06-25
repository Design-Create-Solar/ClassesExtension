/* global chrome */
import React, { Component } from "react";
import "./App.css";
import jquery from "jquery";
import axios from "axios";
window.$ = window.jQuery = jquery;

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
    };
    this.getClassesFromDB = this.getClassesFromDB.bind(this);
  }

  componentDidMount() {
    this.setState({
      existingClasses: this.getClassesFromDOM(),
      processedExistingClasses: this.getTimesFromDOM(),
    });
  }
  splitEasyTimes(stringBoi) {
    var reg = stringBoi.match(/[a-z]+|[^a-z]+/gi);
    // will split into arr of two elems: number time and am/pm
    // goal: get rid of the : in the 1st elem
    // in addition to taking care of 24 hr conversion

    let splitColonTime = reg[0].split(":");
    if (reg[1] == "pm")
      splitColonTime[0] = (Number(splitColonTime[0]) + 12).toString();

    // splitColonTime is array of either one or two elems
    var finalTimeForm = splitColonTime[0];
    if (splitColonTime.length == 2)
      finalTimeForm = splitColonTime[0] + splitColonTime[1];

    return finalTimeForm;
  }

  getDays() {
    let days = window.jQuery.makeArray(
      window.$("a.uit-clickover-bottom").filter(function () {
        return this.innerText.match("M|T|W|R|F");
      })
    );
    return days;
  }

  getTimes() {
    let times = window.jQuery.makeArray(
      window.$("td").filter(function () {
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
      if (i % 2 == 0)
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
      if (type != "Dis") j++;
      slotJson.subNum = subNumArr[j];
      res.push(slotJson);
    }
    return res;
  }

  renderExistingClassesData() {
    return this.state.newClassBois.map((slot, index) => {
      const { status, location, instructor, title } = slot;
      return (
        <tr key={title}>
          <td>{status}</td>
          <td>{location}</td>
          <td>{instructor}</td>
          <td>{title}</td>
        </tr>
      );
    });
  }

  getClassesFromDB(e) {
    let arr = [];
    this.state.processedExistingClasses.forEach((el) => {
      el.days.forEach((day) =>
        arr.push({ day: day, gte: el.gte, lte: el.lte })
      );
    });
    axios({
      method: "post",
      // url: 'https://designcreatesolar.com/api/documents/search/',
      url: "http://localhost:5000/documents/search/",
      data: {
        index: "firsttest",
        busySlots: arr,
        searchString: e.target.value,
      },
    })
      .then((res) =>
        this.setState({
          newClassBois: res.data.hits.hits.map((el) => el._source),
        })
      )
      .catch(console.trace);
  }

  render() {
    console.log(this.state);
    return (
      <div className="App" width="100%" style={{ border: 0, margin: 0 }}>
        <div
          // id="classNewSearchTitle"
          // class="classPlanner_SectionTitle"
          style={{ alignItems: "left" }}
        >
          <a
          // onclick="shrink('panelNewSearch');"
          // id="ctl00_MainContent_toggleSearch"
          // class="planSectionToggle"
          // href="javascript:__doPostBack('ctl00$MainContent$toggleSearch','')"
          >
            {/* <i class="icon-minus-sign"></i>  */}
            Search for Class and Add to Cool Search
          </a>
        </div>

        <div
        // id="panelNewSearch"
        >
          <form>
            <input
              type="text"
              placeholder="Enter a Subject (ex: COM SCI)"
              // class="ClassSearchBox tier0 CSAutoComplete csac1 csac2 ui-autocomplete-input"
              style={{ width: "96%" }}
              required
            />
            <button
              type="button"
              // type='submit'
              onClick={this.getClassesFromDB}
            >
              Go!
            </button>
          </form>
          <table id="existing-classes">
            <tbody>{this.renderExistingClassesData()}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
