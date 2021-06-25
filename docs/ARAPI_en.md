1、Initialize container dom element

    <div id='example'></div>

2、Initialize threejs and render

    container=document.getElementById('example')
    renderer = new THREE.WebGLRenderer();
    container.appendChild(renderer.domElement);

3、Initialize scene

    scene = new THREE.Scene();

4、initialize ar object

     ar=new AR(scene,renderer);
     // set user camera 
     ar.cameraIndex=1;

     // init ar
     ar.init();

     // display ar
     ar.play();

#### Some of ar object

    // current ar scene
    ar.scene;
    
    // current ar renderer
    ar.renderer;
    
    // ar display dom container
    ar.container;
    
    // ar camera 
    ar.camera;
    
    // ar audio
    ar.audio;
  
    // set user camera params
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
        facingMode:self.frontCamera?"user":"environment",
        //Lower frame-rates may be desirable in some cases, like WebRTC transmissions with bandwidth restrictions.
        frameRate: 15,//{ideal:10,max:15},
    } 
    

    // picker camera frame
    ar.showPhoto()
    
    // display camera
    ar.showVideo()