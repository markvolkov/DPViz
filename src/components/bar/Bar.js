import React from "react";
import "./Bar.css";

export default class Bar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: false,
            selected: false,
            swap: false,
            bounce: false
        }
    }

    render() {
        let bgColor = this.props.backgroundColor;
        if (this.state.active) {
            bgColor = "#161bb0";
        } else if (this.state.selected) {
            bgColor = "#c20000";
        } else if (this.state.swap) {
            bgColor = "#ffffffff";
        } else {
            bgColor = this.props.backgroundColor;
        }
        return (
            <div className={ this.state.bounce ? 'bar bounce-2' : 'bar'}style={{width: this.props.width, height: this.props.height, backgroundColor: bgColor}}></div>
        );
    }

    toggleSelected() {
        this.setState({selected: !this.state.selected})
    }

    toggleBounce() {
        this.setState({bounce: !this.state.bounce})
    }

    toggleSwap() {
        this.setState({swap: !this.state.swap})
    }

    toggleActive() {
        this.setState({active: !this.state.active})
    }

    reset() {
        this.setState({selected: false, active: false, swap: false, bounce: false})
    }

}