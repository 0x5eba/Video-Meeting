import React, { Component } from 'react';
import { Input, Button } from '@material-ui/core';
import "./Home.css"

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
		if(this.state.url !== ""){
			if(this.state.url.includes(window.location.href)){
				window.location.href = this.state.url
			}
			window.location.href = `/${this.state.url}`
		}
	}

	create = () => {
		if(this.state.url === ""){
			var url = Math.random().toString(36).substring(2, 7)
			window.location.href = `/${url}`
		} else {
			window.location.href = `/${this.state.url}`
		}
	}

	render() {
		return (
			<div className="container2">
				<Input placeholder="URL" onChange={e => this.handleChange(e)} />
				<div>
					<Button variant="contained" color="primary" onClick={this.join} style={{ margin: "20px" }}>
						Join call</Button>
					<Button variant="contained" style={{ backgroundColor: "#4caf50", margin: "20px" }}
						onClick={this.create}>
						Create call</Button>
				</div>
			</div>
		)
	}
}

export default Home;