### Clone && build

        $ git clone https://github.com/guoguicheng/mxreality.js.git
        $ cd mxreality.js
        $ npm install
        $ gulp build

### Examples

        <script src="./build/three.js"></script>
        <script src="./build/mxreality.js"></script>

        <!-- If play mode is vr.resType.sliceVideo,you need add hls.js scripts -->
        <script src="./libs/hls.js"></script>
         <!-- If play mode is vr.resType.flvVideo,you need add flv.js scripts -->
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
        vr.playPanorama('360.mp4',vr.resType.video);

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
        </script>

### npm引用



### Examples
* 1、[panorama images](../examples/pano_image.html)
* 2、[the asteroid view of panorama images](../examples/pano_image_asteroid.html)
* 3、[auto fix panorama image top and bottom pixel](../examples/auto_fix_top_and_bottom.html)
* 4、[auto fix panorama image top and bottom pixel to skybox](../examples/pano_image_convert_to_skybox.html)
* 5、[switch panorama scene](../examples/hot_scene_switch.html)
* 6、[scene icon event handle](../examples/mouse_event_example.html)
* 7、[panorama scene](../examples/pano_flybird.html)
* 8、[panorama scene with model](../examples/pano_object_or_scence.html)
* 9、[panorama model scene(animation) ](../examples/pano_object_scenne.html)
* 10、[panorama model(earth)](../examples/pano_scene_earth.html)
* 11、[panorama video](../examples/pano_video.html)
* 12、[set icon in panorama](../examples/set_icon_button_in_pano_obj.html)
* 13、[skybox](../examples/skybox_pano.html)
* 14、[the asteroid view of panorama video](../examples/video_asteroid.html)
* 15、[play mkv panorama video](../examples/vr_video_mkv.html)
* 16、[vr video](../examples/vr_video.html)
* 17、[hls live panorama video](../examples/vr_hls_live_video.html)
* 18、[flv live panorama video](../examples/vr_flv_live_video.html)
* 19、[dash live panorama video](../examples/vr_dash_live_video.html)
* 20、[use other component](../examples/vr_dash_live_video.html)
* 21、[set force component](../examples/vr_live_type_setting.html)

* 22、[ar examples1](../examples/web_mix_reality.html)
* 23、[ar exampels2](../examples/web_mix_reality_birds.html)
* 24、[cubemap video](../examples/box_video.html)
#### Depend
three.js (required)
hls.js(non-required)
flv.js(non-required)

In order to combine the powerful WebGL engine to create a player that can combine custom rendered scenes and interact with objects in the scene to process events, rather than just panoramic video images, the player has sacrificed some load performance to integrate Threejs's powerful 3D engine. So as long as developers have the ThreeJS development skills, it is very easy to build a variety of WebVR products.

#### More api documents

[VR API](VRAPI_en.md)

[AR API](ARAPI_en.md)