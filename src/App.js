import React, { Component } from 'react';
import Video from "./Video"
import Home from "./Home"
import { useHistory } from "react-router-dom";

class App extends Component {
  render() {
    return (
      <div>
				{/* nav
				switch 
				route path="/:id"
				*/}
				<Home />
      </div>
    )
  }
}

export default App;