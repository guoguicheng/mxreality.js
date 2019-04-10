### VR API 接口文档 

#### 开发流程

开发分为五个步骤，
1、创建DOM渲染容器提供给webGL渲染显示场景

    <div id='example'></div>

2、获取渲染容器，初始化渲染器，绑定到该容器

    container=document.getElementById('example')
    renderer = new THREE.WebGLRenderer();
    container.appendChild(renderer.domElement);

3、初始化3D场景

    scene = new THREE.Scene();

4、将场景、容器和渲染器绑定到VR播放器，以及播放器设置视角FOV设置

    var vr=new VR(scene,renderer,container,{"fov":50});
    vr.init()

5、播放VR

    vr.playPanorama('360.mp4',vr.resType.video);


#### 可播放的资源类型

    VR播放类别：
    vr.resType.video 播放VR视频
    vr.resType.box 天空盒子模式
    vr.resType.slice 全景图片切片模式
    vr.resType.sliceVideo 全景视频分片模式或者是HLS直播模式

#### 资源加载精度回调

    在全景播放前面定义资源加载状态回调方法：
    //全景资源加载完成回调
    vr.loadProgressManager.onLoad(xhr){
        console.log("loaded");
    }
    //全景资源加载中回调
    vr.loadProgressManager.onProgress(item, loaded, total){
        console.log("item=",item,"loaded",loaded,"total=",total);
    }
    //全景资源加载错误回调
    vr.loadProgressManager.onError(xhr,cl) {
        console.log(xhr,cl);
    }

#### 场景对象

    获取当前场景
    vr.scene;
    
    获取当前渲染器
    vr.renderer;
    
    获取当前容器对象
    vr.container;
    
    获取摄像头视频对象
    vr.video;
    
    获取音频对象
    vr.audio;
    
#### 自动旋转

    设置播放器镜头自动旋转
    vr.controls.autoRotate=true

    设置自动旋转速度为1.2
    vr.controls.autoRotateSpeed=1.2

#### 陀螺仪

    关闭陀螺仪
    vr.controls.gyroFreeze()

    开启陀螺仪
    vr.controls.gyroUnfreeze()

#### 截屏

    vr.takeScreenShot(function(screenshotImg){})

#### 全景图切片

    全景图切片大小设置
    vr.sliceSegment=0; 
    如果全景图切片的话需要指定，最终切片数量=sliceSegment*sliceSegment*6 片

    全景图切片,width,height 越大，切出来的图片空间占用越大，清晰度也越好，（注意，不建议设置的太大，切片需要占用大量的内存，部分浏览器会崩溃）
    vr.sphere2BoxPano(img, width, height,function (imgArray) {})
    
#### 小行星视角初始化参数

    不启用小行星视角
    vr.asteroidConfig.enable=false

    视角移动速度，值越小，移动越快 ms
    vr.asteroidConfig.assteroidFPS=36

    俯视视角大小
    vr.asteroidConfig.assteroidFov=135

    小行星视角到正常视角更新完成总耗时 ms
    vr.asteroidConfig.asteroidForwardTime=2000

    小行星开始之前等待时间 ms
    vr.asteroidConfig.asteroidWaitTime=1000

    vr.asteroidConfig.asteroidDepressionRate=0.5
    
    小行星视角方向[1 俯视/-1 仰视]
    vr.asteroidConfig.asteroidTop=1
    
    立体相机宽度
    vr.asteroidConfig.cubeResolution=2048