import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import { Container, Row, Col} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';
import "./Test.css"

var elms = 0

class Test extends Component {
	constructor(props) {
        super(props)
    }

    click = () => {
        elms++
        var main = document.getElementById('main')

        main.innerHTML = ""

        for(let a = 0; a < elms; ++a){
            var video = document.createElement('video')

            var val = String(100/elms) + "%"

            video.style.backgroundColor = "blue"
            
            video.style.minWidth = "200px"
            video.style.minHeight = "200px"
            video.style.setProperty("width", val)
            video.style.setProperty("height", val)

            video.style.margin = "10px"

            main.appendChild(video)
        }
    }

	render() {
		return (
            <div>
                <Button onClick={() => this.click()} style={{ backgroundColor: "#4caf50"}}>CLICK</Button>
                <Row id="main" className="flex-container">

                </Row>
            </div>
		)
	}
}

export default Test;