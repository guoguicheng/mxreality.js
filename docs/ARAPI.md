    /**
    * scene 当前3d场景
    * renderer 3d渲染器
    * container 3d对象容器
    * cameraPara 相机初始化参数，默认为{"fov": 90, "aspect": window.innerWidth / window.innerHeight, "near": 0.001, "far": 1000};
    * cameraPosition 相机初始化位置，默认为{"x": 0, "y": 0, "z": 0};
    **/
    var ar=new AR(scene,renderer,container,cameraPara,cameraPosition) {
    
    ar.scene; //存放当前场景
    ar.renderer; //存放当前渲染器
    ar.container; //存放当前容器对象
    
    ar.video; //存放当前设备摄像头视频对象
    ar.openAudio = true; //是否启用录音
    
    ar.cameraIndex = 1;//0为前置摄像头，否则为后置
    
    ar._windowWidth = window.innerWidth;  //窗口宽
    ar._windowHeight = window.innerHeight; //窗口高
    ar.camera; //存放当前场景摄像头对象
    
    //当前设备摄像头参数
    ar.cameraVideo={
        width: {min: this._windowWidth, ideal: this._windowWidth, max: this._windowWidth},
        height: {min: this._windowHeight, ideal: this._windowHeight, max: this._windowHeight},
        //facingMode:self.frontCamera?"user":"environment",    /* 使用前置/后置摄像头*/
        //Lower frame-rates may be desirable in some cases, like WebRTC transmissions with bandwidth restrictions.
        frameRate: 15,//{ideal:10,max:15},
    }
    
开始渲染

    ar.init();//初始化AR
    ar.play();
    
    //获取当前设备相机的一张图片并显示
    ar.showPhoto()
    //获取当前设备相机的视频并播放
    ar.showVideo()