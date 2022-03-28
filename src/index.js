import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SortingVisualizer from './SortingVisualizer';
import DPVisualizer from './DPVisualizer';
import Footer from "./components/footer/Footer";
import Nav from "./components/nav/Nav";
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <Nav />
    {/* <SortingVisualizer /> */}
    <DPVisualizer />
    <Footer />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
