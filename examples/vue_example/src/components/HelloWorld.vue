<template>
  <div class="hello">
    <div ref="player" class="container"></div>
  </div>
</template>

<script>
import * as Hls from "mxreality.js/build/hls";
import * as THREE from "mxreality.js/build/three";
import { VR, AVR } from "mxreality.js/build/mxreality";

window.Hls = Hls;
window.THREE = THREE;
window.VR = VR;
window.AVR = AVR;

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  mounted() {
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer();
    this.$refs.player.appendChild(renderer.domElement);
    var vr = new VR(scene, renderer, this.$refs.player);
    vr.init(function () {});
    vr.loadProgressManager.onLoad = function () {
      console.log("loaded.........");
    };
    vr.loadProgressManager.onProgress = function () {
      console.log("onProgress");
    };
    vr.loadProgressManager.onError = function () {
      console.log("onError");
    };
    vr.playPanorama(require("../assets/puydesancy.jpg"));
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
