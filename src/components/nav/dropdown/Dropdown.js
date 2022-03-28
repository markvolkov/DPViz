import React from "react";
import "./Dropdown.css";

export default class Dropdown extends React.Component {

    render() {
        return (
            <div>
                <h3>Algorithms</h3>
                <select id="algorithms">
                    <option value="bubble">Bubble Sort</option>
                    <option value="selection">Selection Sort</option>
                    <option value="merge">Merge Sort</option>
                    <option value="quick">Quick Sort</option>
                    <option value="heap">Heap Sort</option>
                    <option value="radix">Radix Sort</option>
                    <option value="bucket">Bucket Sort</option>
                </select>
            </div>
        );
    }

}