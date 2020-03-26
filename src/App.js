import React, { Component } from 'react';
import './App.css';
import Video from "./Video"
import { Input, Button, Icon } from '@material-ui/core';

class App extends Component {
  constructor(props) {
		super(props)
		this.state = {
			url: '',
		}
	}

	handleChange = (e) => {
		this.setState({
			url: e.target.value
		})
	}

	join = () => {
		// const data = { url: this.state.url };
		fetch('/api/call/' + this.state.url, {
			method: 'GET',
			// headers: {
			// 	'Content-Type': 'application/json',
			// },
			// body: JSON.stringify(data),
		})
		.then((data) => {
			console.log('Success:', data)
		})
		.catch((error) => {
			console.error('Error:', error)
		})
	}

	create = () => {
		fetch('/api/call/create', {
			method: 'POST',
		})
		.then((data) => {
			console.log('Success:', data)
		})
		.catch((error) => {
			console.error('Error:', error)
		})
	}

  render() {
    return (
      <div className="flex-container">
				<div className="row">
					<div className="flex-item" style={{marginTop: "-30%"}}>
						<Input placeholder="Url" style={{ margin: "20px" }} 
							onChange={e => this.handleChange(e)}/>
						<Button variant="contained" color="primary" onClick={this.join()}>
							Join call</Button>
					</div>
					<div className="flex-item">
						<Button variant="contained" style={{backgroundColor: "#4caf50"}}
							onClick={this.create()}>
							Create call</Button>
					</div>
				</div>
      </div>
    )
  }
}

export default App;