/* global chrome */
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import axios from "axios"

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      site: ''
    }
  }

  componentDidMount() {
    chrome.tabs.query({ active: true, currentWindow: true },
    tabs => {
      const url = new URL(tabs[0].url)
      console.log(url)
      const site = url.href
      this.setState({
        site: site
      })
    })
  }

  render() {
    let correctSite;

    if (this.state.site=="https://be.my.ucla.edu/ClassPlanner/ClassPlan.aspx") 
      correctSite = true
    else 
      correctSite=false

    return (
      <div className="App">
        {
          correctSite ? <h1>Whoo</h1> : <h1>Go to your UCLA class planner.</h1>
        }
      </div>
    )
  }
}

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//         </a>
//       </header>
//     </div>
//   );
// }


export default App;