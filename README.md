# mxreality 读音 mix reality

## <font color="#dd0000">免费软件，但受软件版权保护，尊重作者的成果，严格遵守协议内容并且保留播放器版权信息</font>

&nbsp;🐡&nbsp;本站提供全面的VR全景视频、普通2D和3D视频是在线免费上传分享功能，支持免费在线直播。

&nbsp;🎈&nbsp;提供VR视频和普通视频直播技术支持

&nbsp;💓&nbsp;关注官方微信公众号“迷视VR资讯”，获取最新的VR咨询内容

&nbsp;🌼&nbsp;加入QQ群863363544与各路同行大佬交流行业技术心得

### 查看官方[在线地址](https://www.mxreality.cn)，关注VR动态

[https://www.mxreality.cn](https://www.mxreality.cn)
![公众号](https://github.com/guoguicheng/mxreality.js/raw/master/qrcode.jpg)

#### 查看例子前先搭建站点、查看例子前先搭建站点、查看例子前先搭建站点

[在线文档](https://github.com/guoguicheng/mxreality.js/tree/master/docs/index.md)  

### web引用

        git clone https://github.com/guoguicheng/mxreality.js.git --recursive
        cd mxreality.js
        npm install
        gulp build

        <script src="./build/three.js"></script>
        <script src="./build/mxreality.js"></script>

        <!-- hls 直播 -->
        <script src="./libs/hls.js"></script>
        <!-- flv 直播 -->
        <script src="./libs/flv.js"></script>

### 可播放的资源类型

        VR播放类别：
        vr.resType.video 播放VR视频
        vr.resType.box 天空盒子模式
        vr.resType.slice 全景图片切片模式
        vr.resType.sliceVideo 全景视频分片模式或者是HLS直播模式
        vr.resType.flvVideo FLV直播模式

### 初始化例子

        <div id='example'></div>
        <script>
        container=document.getElementById('example')
        renderer = new THREE.WebGLRenderer();
        container.appendChild(renderer.domElement);
        scene = new THREE.Scene();
        var vr=new VR(scene,renderer,container);
        vr.init()
        vr.playPanorama('360.mp4',vr.resType.video);
        </script>

### npm引用

[npm方式(react接入例子)](https://github.com/guoguicheng/mxreality.js/tree/master/build/README.md)

#### MXREALITY 混合现实网页版【QQ群：863363544】

* [重要更新]
* 支持VR HLS和VR FLV直播，普通全景VR视频和普通全景图片

### 支持开源项目

![支持开源项目](https://github.com/guoguicheng/mxreality.js/raw/master/docs/149867278858969619.jpg)

#### 全景图小行星视角

![小行星视角](https://github.com/guoguicheng/mxreality.js/raw/master/docs/1.png)
![小行星视角](https://github.com/guoguicheng/mxreality.js/raw/master/docs/2.png)
![小行星视角](https://github.com/guoguicheng/mxreality.js/raw/master/docs/3.png)
![小行星视角](https://github.com/guoguicheng/mxreality.js/raw/master/docs/4.png)
![小行星视角](https://github.com/guoguicheng/mxreality.js/raw/master/docs/5.jpg)
![小行星视角](https://github.com/guoguicheng/mxreality.js/raw/master/docs/14.png)

#### 移动设备全景图

![移动设备全景图](https://github.com/guoguicheng/mxreality.js/raw/master/docs/6.jpg)

#### 移动设备VR视角

![VR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/7.jpg)
![VR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/8.jpg)

#### 全景视频播放器

![全景视频播放器](https://github.com/guoguicheng/mxreality.js/raw/master/docs/9.png)
![全景视频播放器](https://github.com/guoguicheng/mxreality.js/raw/master/docs/10.png)
![全景视频播放器](https://github.com/guoguicheng/mxreality.js/raw/master/docs/11.png)

#### 移动设备全景视频

![移动设备全景视频](https://github.com/guoguicheng/mxreality.js/raw/master/docs/12.jpg)
![全景视频播放器](https://github.com/guoguicheng/mxreality.js/raw/master/docs/23.jpg)
![全景视频播放器](https://github.com/guoguicheng/mxreality.js/raw/master/docs/24.jpg)

#### 移动设备全景视频VR

![移动设备全景视频VR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/13.jpg)
![移动设备全景视频VR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/25.jpg)
![移动设备全景视频VR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/26.jpg)

#### 

![全景场景](https://github.com/guoguicheng/mxreality.js/raw/master/docs/15.jpg)
![全景场景](https://github.com/guoguicheng/mxreality.js/raw/master/docs/18.png)

#### 全景场景VR

![全景场景VR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/16.jpg)
![全景场景VR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/17.jpg)

#### 全景图补天功能对比

![没有补天](https://github.com/guoguicheng/mxreality.js/raw/master/docs/19.png)
![已补天](https://github.com/guoguicheng/mxreality.js/raw/master/docs/20.png)

#### 热点功能实现

![热点功能实现](https://github.com/guoguicheng/mxreality.js/raw/master/docs/21.png)

#### 全景图切片技术实现

![全景图切片技术实现](https://github.com/guoguicheng/mxreality.js/raw/master/docs/22.png)

### AR 测试例子

![AR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/30.jpg)
![AR](https://github.com/guoguicheng/mxreality.js/raw/master/docs/31.png)
