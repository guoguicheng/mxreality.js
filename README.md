# mxreality 读音 mix reality

## <font color="#dd0000">免费软件，但受软件版权保护，尊重作者的成果，严格遵守协议内容并且保留播放器版权信息</font>

* MXREALITY 混合现实网页版【QQ群：863363544】

* [在线文档](https://github.com/guoguicheng/mxreality.js/tree/master/docs/index.md) 

* 有问题可[进入社区](http://discuss.mxreality.cn)提问

* 查看官方[在线地址](https://www.mxreality.cn)，关注VR动态

* 🐡本站提供全面的VR全景视频、普通2D和3D视频是在线免费上传分享功能，支持免费在线直播。

* 🎈提供VR视频和普通视频直播技术支持

* 💓关注官方微信公众号“迷视VR资讯”，获取最新的VR咨询内容

* 🌼加入QQ群863363544与各路同行大佬交流行业技术心得

* [https://www.mxreality.cn](https://www.mxreality.cn)

* ![扫码或搜索微信号mxreality关注迷视资讯微信公众号](https://github.com/guoguicheng/mxreality.js/raw/master/qrcode.jpg)

## 如果你不太了解web服务器或是初学者，查看例子前先[搭建nginx服务器](https://www.nginx.cn/doc/)、windows用户找到 安装->nginx在windows安装，根据教程安装然后修改nginx.conf配置文件，指定当前项目目录为根目录，然后在浏览器地址栏输入localhost[打开](http://localhost)即可查看例子

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

* 1、[全景图片播放](examples/pano_image.html)
* 2、[全景图片小行星视角初始化](examples/pano_image_asteroid.html)
* 3、[全景图片自动补天,带小行星视角初始化](examples/auto_fix_top_and_bottom.html)
* 4、[全景图自动补天，转为天空盒子播放](examples/pano_image_convert_to_skybox.html)
* 5、[全景图热点切换](examples/hot_scene_switch.html)
* 6、[热点鼠标点击事件](examples/mouse_event_example.html)
* 7、[全景场景（飞鸟）](examples/pano_flybird.html)
* 8、[全景场景（模型）](examples/pano_object_or_scence.html)
* 9、[全景场景（模型动画）](examples/pano_object_scenne.html)
* 10、[全景场景（模型地球）](examples/pano_scene_earth.html)
* 11、[全景视频](examples/pano_video.html)
* 12、[热点图标设置](examples/set_icon_button_in_pano_obj.html)
* 13、[天空盒子](examples/skybox_pano.html)
* 14、[全景视频小行星视角初始化](examples/video_asteroid.html)
* 15、[全景MKV格式视频](examples/vr_video_mkv.html)
* 16、[全景视频](examples/vr_video.html)
* 17、[全景视频直播(HLS流)](examples/vr_hls_live_video.html)
* 18、[全景视频直播(FLV流)](examples/vr_flv_live_video.html)
* 19、[全景视频直播(Dash流)](examples/vr_dash_live_video.html)
* 20、[自定义流解码器](examples/vr_dash_live_video.html)
* 21、[强制指定流解码器](examples/vr_live_type_setting.html)

* 22、[混合现实(需摄像头支持)](examples/web_mix_reality.html)
* 23、[混合现实（飞鸟）(需摄像头支持)](examples/web_mix_reality_birds.html)