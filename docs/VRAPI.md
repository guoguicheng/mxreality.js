初始化VR  
    
    /**
    * scene 当前3d场景
    * renderer 3d渲染器
    * container 3d对象容器
    * cameraPara 相机初始化参数，默认为{"fov": 90, "aspect": window.innerWidth / window.innerHeight, "near": 0.001, "far": 1000};
    * cameraPosition 相机初始化位置，默认为{"x": 0, "y": 0, "z": 0};
    **/
    var vr=new VR(scene,renderer,container,cameraPara,cameraPosition)
  
    播放器类别指定  

    vr.recType={"video":"video","box":"box","slice":"slice"};  
    //全景视频则是vr.recType.video  正六面体为vr.recType.box 切片并补天播放器类别为vr.recType.slice
    
    初始化全景容器参数,如果全景图为正六面体则指定width、height、depth 3个参数，适用于box和slice类别；  
    如果为球体则设置radius、widthSegments、heightSegments ，适用于video和默认类别  

    vr.vrbox={"radius":2, "widthSegments":180, "heightSegments":180,"width":2,"height":2,"depth":2};  


    vr.scene; //存放当前场景
    vr.renderer; //存放当前渲染器
    vr.container; //存放当前容器对象
    vr.video; //在播放器类播放全景视频是存放该视频对象
    vr.audio; //如果赋值音频对象则在全景播放器右侧会显示音频音量控制条
    vr.videoToolBar; //存放播放器工具栏对象
    vr.autoplayPanoImg=false; //播放器镜头是否自动旋转
    vr.VRObject=new THREE.Object3D(); //存放当前vr播放器对象
    vr.defaultAutoHideLeftTime=3; //播放器工具栏自动隐藏时间
    vr.defaultVoiceHideLeftTime=2; //播放器音量控制条隐藏时间
    vr.defaultVolume=0.3; //默认音量大小
    vr.sliceSegment=0; //如果全景图切片的话需要指定，最终切片数量=sliceSegment*sliceSegment*6 片
    vr._controlTarget={x:0.0001,y:0,z:0}; //控制器默认初始镜头
    
    //小行星视角配置
    vr.asteroidConfig={
        enable:false, //是否使用小行星视角
        assteroidFPS:36, //视角移动速度，值越小，移动越快 ms
        assteroidFov:135, //俯视视角大小
        asteroidForwardTime:2000, //小行星视角到正常视角更新完成总耗时 ms
        asteroidWaitTime:1000, //小行星开始之前等待时间 ms
        asteroidDepressionRate:0.5, //
        asteroidTop:1, //小行星视角方向[1 俯视/-1 仰视]
        cubeResolution:2048 //立体相机宽度
    };
    vr.VRhint="请取消屏幕翻转锁定后装入VR盒子中"; //VR 模式提示文字
    vr.camera;//存放当前相机对象
    
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
    
开始渲染播放器
    
    vr.init()
    
播放全景图

    /**
    * resource 全景资源地址
    * resourceType 全景资源类别vr.recType.[box/video/slice]
    * objName 播放器对象name值 默认为 __panoContainer
    **/
    vr.playPanorama(resource,resourceType,objName);
    
切片器

    /**
    * img 全景图地址
    * w,h 转成6面时每个面的宽高
    * callback 切片完成回调切片的base64编码集 
    **/
    sphere2BoxPano(img,w,h,callback)