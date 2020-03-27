import React, { Component } from 'react';
import './Home.css';
import { Input, Button, Icon } from '@material-ui/core';

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
			url: this.state.url
		}
		fetch(api_url + '/api/call/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
		.then(data => data.json())
		.then(data => {
			let url = data.url
			window.location.href = `/${url}`
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
						<Input placeholder="URL" onChange={e => this.handleChange(e)}/>
					</div>
					<div className="flex-item">
						<Button variant="contained" color="primary" onClick={this.join} style={{margin: "20px"}}>
							Join call</Button>
						<Button variant="contained" style={{backgroundColor: "#4caf50", margin: "20px"}}
							onClick={this.create}>
							Create call</Button>
					</div>
				</div>
      </div>
    )
  }
}

export default Home;