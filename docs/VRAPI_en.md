### VR API Document 

#### Sample examples

1、Create container

    <div id='example'></div>

2、Initialize player

    var vr=new VR({
        'id':<container id or HTMLElement of container >,
        'camera_para':{
            "fov": 90,
            "aspect": container.innerWidth / container.innerHeight,
            "near": 0.001,
            "far": 1000
        },
        'camera_position':{
            'x':0,'y':'','z':''
        }
    });

    /**
    * extendsAnimationFrameCallback - Method synchronizes the callback with Three's Render renderer, and some custom scene code that needs to be rendered repeatedly can be placed in this callback method.（nullable）
    * /
    vr.init(extendsAnimationFrameCallback)

3、Play panorama video or panorama image

    vr.play('360.mp4',vr.resType.video);


#### Check enable resType items

    // play panorama video
    vr.resType.video

    // play skybox mode
    vr.resType.box

    // auto fix panorama images sky top and bottom
    vr.resType.slice

    // play panorama video of the hls stream (depend hls.js)
    vr.resType.sliceVideo

    // play panorama flv video (depend flv.js)
    vr.resType.flvVideo

#### Load progress manager

    //resource loaded
    vr.loadProgressManager.onLoad(xhr){
        console.log("loaded");
    }
    //resource loading
    vr.loadProgressManager.onProgress(item, loaded, total){
        console.log("item=",item,"loaded",loaded,"total=",total);
    }
    //resource load error
    vr.loadProgressManager.onError(xhr,cl) {
        console.log(xhr,cl);
    }

#### Some vr object

    // get the scene of threejs
    vr.scene;
    
    // get renderer of threejs
    vr.renderer;
    
    // get player container
    vr.container;
    
    // get initialized video
    vr.video;

    // pause video
    vr.video.pause()

    // play/resume video
    vr.video.play()
    
    // get initialized audio
    vr.audio;

    // pause audio 
    vr.audio.pause()

    // play audio
    vr.audio.play()
    
#### Vr controls

    // set auto rotate 
    vr.controls.autoRotate=true

    // set auto rotate speed is 1.2
    vr.controls.autoRotateSpeed=1.2

#### Gyroscope

    // disable gyroscope
    vr.controls.gyroFreeze()

    // enable gyroscope
    vr.controls.gyroUnfreeze()

#### Take screenshot

    vr.takeScreenShot(function(screenshotImg){})

#### Slice panorama images

    // number of slice segment = sliceSegment*sliceSegment*6
    vr.sliceSegment=0; 

    全景图切片,width,height 越大，切出来的图片空间占用越大，清晰度也越好，（注意，不建议设置的太大，切片需要占用大量的内存，部分浏览器会崩溃）
    /**
    * @param img  target image
    * @param width  slice unit width
    * @param height slice unit height
    * @param callbackFunc finished callback funciton,callback argument is the array contains slice images
    */
    vr.sphere2BoxPano(img, width, height,function (imgArray) {})
    
#### Asteroid view configure

    // disable asteroid
    vr.asteroidConfig.enable=false

    // ========== Some non-required parameters are as follows   ==============

    // Asteroid view regression velocity
    vr.asteroidConfig.assteroidFPS=36

    // set asteroid view fov 
    vr.asteroidConfig.assteroidFov=135

    // Asteroid view regression velocity time(ms)
    vr.asteroidConfig.asteroidForwardTime=2000

    // Asteroid view regression velocity waiting time(ms)
    vr.asteroidConfig.asteroidWaitTime=1000

    vr.asteroidConfig.asteroidDepressionRate=0.5
    
    // Asteroid view look at[1 down/-1 up]
    vr.asteroidConfig.asteroidTop=1

    vr.asteroidConfig.cubeResolution=2048
    // ====================non-required parameters end ===========================

### Video callback
    vr.video.onloadstart = function () {

    };
    vr.video.onabort = function () {
    };
    vr.video.oncanplay = function () {

    };
    vr.video.oncanplaythrough = function () {

    };
    vr.video.ondurationchange = function () {

    };
    vr.video.onended = function () {

    };
    vr.video.onerror = function () {
    };
    vr.video.onloadeddata = function () {

    };
    vr.video.onloadedmetadata = function () {

    };
    vr.video.onpause = function () {

    };
    vr.video.onplay = function () {

    };
    vr.video.onplaying = function () {

    };
    vr.video.onprogress = function () {

    };
    vr.video.onratechange = function () {

    };
    vr.video.onseeked = function () {

    };
    vr.video.onseeking = function () {

    };
    vr.video.onstalled = function () {

    };
    vr.video.onsuspend = function () {

    };
    vr.video.ontimeupdate = function () {

    };
    vr.video.onvolumechange = function () {

    };
    vr.video.onwaiting = function () {

    };

### AVR common object

    // Disable vr mode，need setting before player initialize
    AVR.enableVrMode=false;

    // Get player icon
    AVR.playerIcon
    // Play icon：AVR.playerIcon.playSvg
    // Pause icon：AVR.playerIcon.pauseSvg
    // Reset lookat icon：AVR.playerIcon.resetLookAtSvg
    // Gyro icon：AVR.playerIcon.gyroSvg
    // VR icon：AVR.playerIcon.vrSvg
    // Playing audio icon：AVR.playerIcon.audioPlaySvg
    // Paused audio icon：AVR.playerIcon.audioPauseSvg

    /**
    * Get three camera vector
    * @param camera 
    * @param times 
    */
    AVR.cameraVector: function (camera, times)

    /**
    * 捕获涉嫌穿过的模型集合
    * @param event 鼠标事件对象e
    * @param vr 当前vr对象
    * @param callback 回调方法对象{success:funciton(){},empty:funciton(){}}
    */
    AVR.bindRaycaster: function (event, vr, callback)

    /**
    * Bind THREE camera event
    * @param vr 
    * @param options {
                vectorRadius: vr.vrbox.width / 2.2,
                trigger: function (e) {
                    console.log("on", e.jsonInfo)
                },
                move: function (e) {
                    intersectObj = e[0].object;
                    console.log('intersectObj', intersectObj)
                },
                empty: function () {
                    vr.cameraEvt.leave();
                }
            }
    */
    AVR.bindCameraEvent:function (vr, options)

    /**
    * Screen cordinate to 3D cordinate
    * @param e event
    * @param container
    * @param camera 
    */
    AVR.screenPosTo3DCoordinate: function (e, container, camera)

    /**
    * 3D cordinate to screen cordinate
    * @param object
    * @param container 
    * @param camera 
    */
    AVR.objectPosToScreenPos: function (object, container, camera)

    /**
    * Get devices info
    */
    AVR.isMobileDevice()
    AVR.isCrossScreen()
    AVR.OS.isGooglePixel();
    AVR.OS.isMiOS();
    AVR.OS.isSamsung();
    AVR.OS.isMobile();
    AVR.OS.isAndroid();
    AVR.OS.isiOS();
    AVR.OS.isWeixin()
    
    AVR.Broswer.isIE();
    AVR.Broswer.ieVersion();
    AVR.Broswer.isEdge();
    AVR.Broswer.isSafari();
    AVR.Broswer.is360();
    AVR.Broswer.isSogou();
    AVR.Broswer.isChromium();
    AVR.Broswer.webglAvailable();
