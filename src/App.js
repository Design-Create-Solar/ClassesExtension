/* global chrome */
import React, { Component } from 'react';
import './App.css'; 
import jquery from 'jquery';
window.$ = window.jQuery=jquery;

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      existingClasses: [], // unprocessed -- for UI
        /*  [{ days: "", times: "", type, subNum: ""}, { ... }] */
      processedExistingClasses: [],
        /* of the form
          [ { daysarr[], gte: , lte: }, { daysarr[], gte: , lte: }, ... ]
          ["M", "W"]
          gte: 5
          lte: 6
        */
    }
  }

  componentDidMount() {
    this.setState({
      existingClasses: this.getClassesFromDOM(),
      processedExistingClasses: this.getTimesFromDOM()
    })
  }
  splitEasyTimes(stringBoi) {
    var reg = stringBoi.match(/[a-z]+|[^a-z]+/gi)
    // will split into arr of two elems: number time and am/pm
    // goal: get rid of the : in the 1st elem 
    // in addition to taking care of 24 hr conversion
    
    let splitColonTime = reg[0].split(":")
    if (reg[1] == "pm")
       splitColonTime[0] = (Number(splitColonTime[0])+12).toString()

    // splitColonTime is array of either one or two elems
    var finalTimeForm = splitColonTime[0]
    if (splitColonTime.length == 2) 
        finalTimeForm = splitColonTime[0] + splitColonTime[1]
    
    return finalTimeForm
  }

  getDays() {
    let days = window.jQuery.makeArray(window.$("a.uit-clickover-bottom").filter(function () {
        return this.innerText.match("M|T|W|R|F")
    }))
    return days
  }

  getTimes() {
    let times = window.jQuery.makeArray(window.$("td").filter(function () {
        return this.innerText.match("^[0-9].*m$")
    }))
    return times
  }

  getTimesFromDOM() {
    // wanna put jsons formatted as: 
    //  ["M", "W"]
    //  gte: 5
    //  lte: 6
    // for each class/dis
    // into one big array

    let days = this.getDays()
    let times = this.getTimes()
    var finalArr = []
    var i, j
    for (i = 0; i < days.length; i++) {
        let thingy = times[i].innerText.split("-")
        let start = thingy[0]
        let end = thingy[1]
        let processedStart = this.splitEasyTimes(start)
        let processedEnd = this.splitEasyTimes(end)

        var daysArr = []
        var daysStr = days[i].innerText
        for (j=0; j<daysStr.length; j++)
            daysArr.push(daysStr[j])
        
        var timeSlot = {}
        timeSlot.days = daysArr
        timeSlot.gte = processedStart
        timeSlot.lte = processedEnd
        finalArr.push(timeSlot)
    }
    return finalArr
  }

  getClassesFromDOM() {
    // want class names, days, and times
    let classTitles = document.querySelectorAll("td.SubjectAreaName_ClassName > p")
    // every even index, including 0, will look like "Class #: Subject"
    // every odd index will look like "180 - Introduction to Algorithms and Complexity"

    // for now want UI table to look like
    /* Existing Schedule
        ___________________________________________________________
       | days | time | type (dis/lec/sem) | class subject and num |
       | ...                                                      |
       |__________________________________________________________|
    */
    let types = document.querySelectorAll("td.section-header > a")
    let days = this.getDays()
    let times = this.getTimes()
    var i, sub, num, subNum, type, j=-1;
    var res = []; // [ { sub: , classNum: , days, time, type }, { ... }]
    var subNumArr = []

    for (i = 0; i < classTitles.length; i++) {
        if (i % 2 == 0)  // even -- sub name
            sub = classTitles[i].innerText.split(": ")[1]
        else { // odd -- class num 
            num = classTitles[i].innerText.split(" - ")[0]
            subNum = sub + " " + num
            subNumArr.push(subNum)
        }
    }
    for (i = 0; i < days.length; i++) {
        var slotJson = {}
        slotJson.days = days[i].innerText
        slotJson.times = times[i].innerText
        type = types[i].innerText.split(" ")[0]
        slotJson.type = type
        if (type != "Dis")
            j++
        slotJson.subNum = subNumArr[j]
        res.push(slotJson)
    }
    return res
  }

  renderExistingClassesData() {
    return this.state.existingClasses.map((slot, index) => {
      const { days, times, type, subNum } = slot
      return (
        <tr key={subNum}>
          <td>{days}</td>
          <td>{times}</td>
          <td>{type}</td>
          <td>{subNum}</td>
        </tr>
      )
    })
  }

  render() {
    console.log(this.state)
    return (
      <div className="App">
        <form >
          <input type="text" placeholder="Enter a Subject (ex: COM SCI)" required />
          <button type="submit">Go!</button>
        </form>
        <table id="existing-classes">
          <tbody>
            {this.renderExistingClassesData()}
          </tbody>
        </table>
      </div>
    )
  }
}

export default App;