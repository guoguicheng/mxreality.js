import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as Hls from 'mxreality.js/build/hls';
import * as THREE from 'mxreality.js/build/three';
import {
  VR,
  AVR
} from 'mxreality.js/build/mxreality';

import puydesancy from './resource/puydesancy.jpg';

window.THREE = THREE; // 重要，不设置则会报THREE未定义错误！！！！！！
window.Hls = Hls; // 重要，不设置则会报THREE未定义错误！！！！！！
window.AVR = AVR;
class MyPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      container: React.createRef()
    };

  }
  componentDidMount() {
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer();
    this.state.container.current.appendChild(renderer.domElement);
    var vr = new VR(scene, renderer, this.state.container.current);
    vr.loadProgressManager.onLoad = function () {
    };
    vr.loadProgressManager.onProgress = function () {
      console.log("onProgress");
    };
    vr.loadProgressManager.onError = function () {
      console.log("onError");
    };
    vr.init(function () {

    });
    vr.playPanorama(puydesancy);
  }
  onLoad() {

  }
  render() {
    //  当组件插入到 DOM 后，ref 属性添加一个组件的引用于到 this.refs
    return (< div ref={
      this.state.container
    } > < /div>);
      }
    }

      function App() {
      return ( <
        MyPlayer />
      );
    }

      export default App;