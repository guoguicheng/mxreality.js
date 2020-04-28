开发分为四个步骤，
1、创建DOM渲染容器提供给webGL渲染显示场景

    <div id='example'></div>

2、获取渲染容器，初始化渲染器，绑定到该容器

    container=document.getElementById('example')
    renderer = new THREE.WebGLRenderer();
    container.appendChild(renderer.domElement);

3、初始化3D场景

    scene = new THREE.Scene();

4、初始化AR模式

     ar=new AR(scene,renderer);
     使用后摄像头
     ar.cameraIndex=1;

     初始化AR
     ar.init();
     ar.play();

#### 场景对象

    获取当前场景
    ar.scene;
    
    获取当前渲染器
    ar.renderer;
    
    获取当前容器对象
    ar.container;
    
    获取摄像头视频对象
    ar.camera;
    
    获取音频对象
    ar.audio;
  
    当前设备摄像头参数
    ar.cameraVideo={
        width: {
            min: this._windowWidth, 
            ideal: this._windowWidth, 
            max: this._windowWidth
        },
        height: {
            min: this._windowHeight, 
            ideal: this._windowHeight,
            max: this._windowHeight
        },
        facingMode:self.frontCamera?"user":"environment",    /* 使用前置/后置摄像头*/
        //Lower frame-rates may be desirable in some cases, like WebRTC transmissions with bandwidth restrictions.
        frameRate: 15,//{ideal:10,max:15},
    } 
    

    获取当前设备相机的一张图片并显示
    ar.showPhoto()
    
    获取当前设备相机的视频并播放
    ar.showVideo()