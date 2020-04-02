###     安装步骤

        npm i mxreality.js

###     引用

        import {VR,AVR} from 'mxreality.js'

###     例如

        import React from "react";
        import ReactDOM from "react-dom";
        import { Button, DatePicker, version } from "antd";
        import "antd/dist/antd.css";
        import "./index.css";
        import THREE from 'three';
        import {VR,AVR} from 'mxreality.js';

        ReactDOM.render(
        <div className="App">
        <h1>antd version: {version}</h1>
        <DatePicker />
        <Button type="primary" style={{ marginLeft: 8 }}>
        Primary Button
        </Button>
        </div>,
        document.getElementById("root")
        );
        console.log(VR,AVR,THREE)