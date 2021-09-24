### web引用

        #如果连带hls.js 和flv.js库，则添加  --recursive 参数 #  (速度慢则可自行单独clone)

        $ git clone https://github.com/guoguicheng/mxreality.js.git
        $ cd mxreality.js
        $ npm install
        $ gulp build

### 初始化例子

        <script src="./build/three.js"></script>
        <script src="./build/mxreality.js"></script>

        <!-- hls 直播（按需引入） -->
        <script src="./libs/hls.js"></script>
        <!-- flv 直播（按需引入） -->
        <script src="./libs/flv.js"></script>

        <div id='example'></div>
        <script>
        container=document.getElementById('example')
        renderer = new THREE.WebGLRenderer();
        container.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        var vr=new VR(scene,renderer,container);
        vr.init(function(){
                
        })
        vr.playPanorama('360.mp4',<vrType>);

        // <vrType>播放类别：
        // vr.resType.video 播放VR视频
        // vr.resType.box 天空盒子模式
        // vr.resType.slice 全景图片切片模式
        // vr.resType.sliceVideo 全景视频分片模式或者是HLS直播模式
        // vr.resType.flvVideo FLV直播模式
        </script>

### npm引用

[npm方式(react接入例子)](https://github.com/guoguicheng/mxreality.js/tree/master/build/README.md)

* 1、[全景图片播放](../examples/pano_image.html)
* 2、[全景图片小行星视角初始化](../examples/pano_image_asteroid.html)
* 3、[全景图片自动补天,带小行星视角初始化](../examples/auto_fix_top_and_bottom.html)
* 4、[全景图自动补天，转为天空盒子播放](/examples/pano_image_convert_to_skybox.html)
* 5、[全景图热点切换](../examples/hot_scene_switch.html)
* 6、[热点鼠标点击事件](../examples/mouse_event_example.html)
* 7、[全景场景（飞鸟）](../examples/pano_flybird.html)
* 8、[全景场景（模型）](../examples/pano_object_or_scence.html)
* 9、[全景场景（模型动画）](../examples/pano_object_scenne.html)
* 10、[全景场景（模型地球）](../examples/pano_scene_earth.html)
* 11、[全景视频](../examples/pano_video.html)
* 12、[热点图标设置](../examples/set_icon_button_in_pano_obj.html)
* 13、[天空盒子cubemap](../examples/skybox_pano.html)
* 14、[全景视频小行星视角初始化](../examples/video_asteroid.html)
* 15、[全景MKV格式视频](../examples/vr_video_mkv.html)
* 16、[全景视频](../examples/vr_video.html)
* 17、[全景视频直播(HLS流)](../examples/vr_hls_live_video.html)
* 18、[全景视频直播(FLV流)](../examples/vr_flv_live_video.html)
* 19、[全景视频直播(Dash流)](../examples/vr_dash_live_video.html)
* 20、[自定义流解码器](../examples/vr_dash_live_video.html)
* 21、[强制指定流解码器](../examples/vr_live_type_setting.html)

* 22、[混合现实(需摄像头支持)](../examples/web_mix_reality.html)
* 23、[混合现实（飞鸟）(需摄像头支持)](../examples/web_mix_reality_birds.html)
* 24、[cubemap video](../examples/box_video.html)

为了能结合强大的webGL引擎，制作出可结合自定义渲染场景，并且可与场景中的物体交互处理事件，而不仅限于全景视频图片的播放器，因此该播放器牺牲了部分加载性能而集成了threejs 强大的3D引擎，所以只要开发者具备一定的threejs开发能力，就很容易打造出各式各样的webVR产品。

#### 开发入门基础

要求开发人员具备良好的javascript基础；有自定义开发则需要具备threejs基础

[VR API](VRAPI.md)

[AR API](ARAPI.md)