import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as Hls from 'mxreality.js/build/hls';
import * as THREE from 'mxreality.js/build/three';
import {
  VR,
  AVR
} from 'mxreality.js/build/mxreality';

window.THREE = THREE; // 重要，不设置则会报THREE未定义错误！！！！！！
window.Hls = Hls; // 重要，不设置则会报THREE未定义错误！！！！！！
class MyPlayer extends React.Component {
    constructor(props) {
      super(props);
      let url = window.location.search; //获取url中"?"符后的字串
      this.request = new Object();
      if (url.indexOf("?") != -1) {
        let str = url.substr(1);
        let strs = str.split("&");
        for (let i = 0; i < strs.length; i++) {
          this.request[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
      }
      this.state = {
        container: React.createRef()
      }

    }
    componentDidMount() {
      console.info('url:【必填】url编码后的完整播放地址（如:encodeURIComponent("https://www.xxx.com/123.meu8?ab=1")后得'+encodeURIComponent("https://www.xxx.com/123.meu8?ab=1"))
      console.info('type:【可选】参数[video/sliceVideo/不填]');
      let scene = new THREE.Scene()
      let renderer = new THREE.WebGLRenderer()
      this.state.container.current.appendChild(renderer.domElement);
      let vr = new VR(scene, renderer, this.state.container.current);
      vr.loadProgressManager.onLoad = function () {
        vr.VRObject.getObjectByName("__mxrealityDefault").visible = true;
        //vr.controls.enable=false;
      }
      vr.loadProgressManager.onProgress = function () {
        console.log("onProgress")
      }
      vr.loadProgressManager.onError = function () {
        console.log("onError")
      }
      vr.init(function () {

      })
      vr.playPanorama(decodeURIComponent(this.request.url),this.request.type);
    }
    onLoad() {

    }
    render() {
      //  当组件插入到 DOM 后，ref 属性添加一个组件的引用于到 this.refs
      return ( < div ref = {
          this.state.container
        } > < /div>);
      }
    }

    function App() {
      return ( <
        MyPlayer / >
      );
    }

    export default App;