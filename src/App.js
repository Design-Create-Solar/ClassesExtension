/* global chrome */
import React, { Component } from 'react';
import './App.css'; 

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      site: '',
      existingClasses: [], // unprocessed -- for UI
        /*  [{ days: "", times: "", type, subNum: ""}, { ... }] */
      processedExistingClasses: [],
        /* of the form
          [ { daysarr[], gte: , lte: }, { daysarr[], gte: , lte: }, ... ]
          ["M", "W"]
          gte: 5
          lte: 6
        */
      visible: true
    }
  }

  componentDidMount() {
    chrome.tabs.query({ active: true, currentWindow: true },
    tabs => {
      const url = new URL(tabs[0].url)
      const site = url.href
      this.setState({
        site: site
      })
      chrome.tabs.sendMessage( 
        tabs[0].id, 
        {from: "popup", subject: "processed"}, 
        res => this.setState({processedExistingClasses: res })
      )
      chrome.tabs.sendMessage( 
        tabs[0].id, 
        {from: "popup", subject: "UI"}, 
        res => this.setState({existingClasses: res })
      )
      // chrome.runtime.onMessage.addListener((msg, sender, res) => {
      //   if ((msg.from === "content") && (msg.subject === "newProcessedClasses")) {
      //     // TODO
      //   }
      // })
      chrome.runtime.onMessage.addListener((msg, sender, res) => {
        if ((msg.from === "content") && (msg.subject === "newClasses")) {
          this.setState({existingClasses: msg.stuff})
          res("message received")
        }
      })
    })  
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
    let correctSite;

    if (this.state.site=="https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx") 
      correctSite = true
    else 
      correctSite = false

    console.log(this.state)
    return (
      <div className="App">
        {
          correctSite
          ? <div>
              <button type="button">X</button>
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
          : <h1>Go to your UCLA class planner.</h1>
        }

      </div>
    )
  }
}

export default App;