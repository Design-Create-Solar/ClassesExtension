/* global chrome */
import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      site: '',
      existingClasses: [],
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
        {from: "popup", subject: "DOMInfo"}, 
        res => this.setState({existingClasses: res })
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
          ? <form>
              <input type="text" placeholder="Enter a Subject" required />
              <button type="submit">Go!</button>
            </form>
          : <h1>Go to your UCLA class planner.</h1>
        }
      </div>
    )
  }
}

export default App;