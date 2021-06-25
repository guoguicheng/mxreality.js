### VR API Document 

#### Sample examples

1、Create container

    <div id='example'></div>

2、Initialize threejs render

    container=document.getElementById('example')
    renderer = new THREE.WebGLRenderer();
    container.appendChild(renderer.domElement);

3、Initialize threejs scene

    scene = new THREE.Scene();

4、Initialize vr object

    var vr=new VR(scene,renderer,container,{"fov":50});
    vr.init()

5、Play panorama video or panorama image

    vr.playPanorama('360.mp4',vr.resType.video);


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
