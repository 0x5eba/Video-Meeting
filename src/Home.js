import React, { Component } from 'react';
import './Home.css';
import { Input, Button, Icon } from '@material-ui/core';
import { useHistory } from "react-router-dom";

const api_url = "http://localhost:3001"

class Home extends Component {
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
	  fetch(api_url + '/api/call/' + this.state.url, {
			method: 'GET',
		})
		.then((data) => {
			console.log('Success:', data)
		})
		.catch((error) => {
			console.error('Error:', error)
		})
	}

	// create = async () => {
	// 	const data = { 
	// 		// inviteLink: 
	// 	}
	// 	await fetch(api_url + '/api/call/create', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 		body: JSON.stringify(data),
	// 	})
	// 	.then((data) => {
	// 		console.log('Success:', data.json())
	// 		let history = useHistory();
	// 		history.push('/')
	// 	})
	// 	.catch((error) => {
	// 		console.error('Error:', error)
	// 	})
	// }

	create = () => {
		const data = { 
			// inviteLink: 
		}
		fetch(api_url + '/api/call/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
		.then((data) => {
			console.log('Success:', data.json())
			let history = useHistory();
			history.push('/')
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
						<Input placeholder="URL" style={{ margin: "20px" }} 
							onChange={e => this.handleChange(e)}/>
						<Button variant="contained" color="primary" onClick={this.join}>
							Join call</Button>
					</div>
					<div className="flex-item">
					{/* <Link to='/somewhere'> */}
						<Button variant="contained" style={{backgroundColor: "#4caf50"}}
							onClick={this.create}>
							Create call</Button>
					</div>
				</div>
      </div>
    )
  }
}

export default Home;