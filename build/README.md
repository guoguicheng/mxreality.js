###     安装步骤

        npm i mxreality.js

###     引用

        import {VR,AVR} from 'mxreality.js'

###     例如

        create-react-app hello-world
        cd hello-world

        # 修改src/App.js
        import React from 'react';
        import logo from './logo.svg';
        import './App.css';
        import * as THREE from 'mxreality.js/three.js';
        import {VR,AVR} from 'mxreality.js';
        import * as Hls from 'mxreality.js/hls.js';


        function App() {
        return (
        <div className="App" id="example">
        <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
                >
                Learn React
                </a>
        </header>
        </div>
        );
        }

        export default App;
        console.log(THREE,VR,Hls.isSupported())

