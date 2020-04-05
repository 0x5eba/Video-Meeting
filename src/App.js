import React, { Component } from 'react';
import Video from "./Video"
import Home from "./Home"
import Test from "./Test"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

class App extends Component {
	render() {
		return (
			<div>
				<Test />
				{/* <Router>
					<Switch>
						<Route path="/" exact component={Home} />
						<Route path="/:url" component={Video} />
					</Switch>
				</Router> */}
			</div>
		)
	}
}

export default App;