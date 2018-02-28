/*
 *Copyright © 2017 AVR authors
 *Permission is hereby granted, free of charge, to any person obtaining a copy
 *of this software and associated documentation files (the "Software"), to deal
 *in the Software without restriction, including without limitation the rights
 *to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *copies of the Software, and to permit persons to whom the Software is
 *furnished to do so, subject to the following conditions:
 *
 *The above copyright notice and this permission notice shall be included in
 *all copies or substantial portions of the Software.
 *
 *THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *THE SOFTWARE.
 */


var VR=function (scene,renderer,container,cameraPara,cameraPosition) {
    AVR.initDomStyle(container);
    AVR.setCameraPara(this,cameraPara,cameraPosition);
    this.vrbox={"radius":2, "widthSegments":180, "heightSegments":180,"width":2,"height":2,"depth":2};
    this.scene=scene;
    this.renderer=renderer;
    this.container=container;
    this.video=null;
    this.audio=null;
    this.videoToolBar=null;
    this.autoplayPanoImg=false;
    this.clock = new THREE.Clock();
    this.VRObject=new THREE.Object3D();
    this.defaultAutoHideLeftTime=3;
    this.defaultVoiceHideLeftTime=2;
    this.defaultVolume=0.3;
    this.sliceSegment=0;
    this._controlTarget={x:0.0001,y:0,z:0};
    this.recType={"video":"video","box":"box","slice":"slice"};
    this.asteroidConfig={enable:false,assteroidFPS:36,assteroidFov:135,asteroidForwardTime:2000,asteroidWaitTime:1000,asteroidDepressionRate:0.5,asteroidTop:1,cubeResolution:2048};
    this.VRhint="请取消屏幕翻转锁定后装入VR盒子中";
    this.camera=new THREE.PerspectiveCamera(this.cameraPara.fov,this.cameraPara.aspect , this.cameraPara.near, this.cameraPara.far);
    //this.camera=new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);


    this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
    this.loadProgressManager=new THREE.LoadingManager(function (xhr){
        console.log("loaded");
    },function(item, loaded, total){
        console.log("item=",item,"loaded",loaded,"total=",total);
    },function (xhr,cl) {
        console.log(xhr,cl);
    });
    this.scene.add(this.camera);
    this.scene.add(this.VRObject);
    //this.renderer.setPixelRatio( window.devicePixelRatio );
    this.effect = AVR.stereoEffect(this.renderer);

}
VR.prototype.init=function () {
    var that=this;
    function render() {
        var width = that.container.offsetWidth;
        var height = that.container.offsetHeight;
        that.camera.aspect = width / height;
        if((AVR.isMobileDevice() && AVR.isCrossScreen())) {
            that.effect.setSize(width, height);
            that.effect.render(that.scene, that.camera);
        }else{
            that.renderer.setSize(width, height);
            that.renderer.setClearColor(new THREE.Color(0xffffff));
            that.renderer.render(that.scene, that.camera);
        }
        that.camera.updateProjectionMatrix();
        if(that.controls){
            that.controls.update(that.clock.getDelta());
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }
    animate();
    //if you don't use an asteroid view,you need to initialize the controller after the asteroid view.
    if(!that.asteroidConfig.enable){
        AVR.bindOrientationEnevt(that,that._controlTarget);
    }
    window.addEventListener('resize', function () {
        AVR.bindOrientationEnevt(that,that._controlTarget);
    }, false);
};
VR.prototype.playPanorama=function (recUrl,recType,objName) {
    objName=objName||"__panoContainer";
    var that = this;
    that._containerRadius=(that.recType.box == recType) ? (that.vrbox.width / 2) : that.vrbox.radius;

    that.autoHideLeftTime = that.defaultAutoHideLeftTime;
    that.voiceHideLeftTime = that.defaultVoiceHideLeftTime;

    that.videoToolBar = AVR.videoToolBar(that.container);

    that.container.addEventListener("click", function () {
        that.autoHideLeftTime = that.defaultAutoHideLeftTime;
        that.videoToolBar.toolbar.style.display = "block";
    });
    that.videoToolBar.gyroBtn.addEventListener("click", function () {
        if (!this.getAttribute("active")) {
            that.controls.gyroFreeze();
            btnActive(this);
            btnActive(that.videoToolBar.circle1);
            btnActive(that.videoToolBar.circle2);
            this.setAttribute("active", "active");

        } else {
            that.controls.gyroUnfreeze();
            this.removeAttribute("active");
            btnInactive(this);
            btnInactive(that.videoToolBar.circle1);
            btnInactive(that.videoToolBar.circle2);

        }
    }, false);
    that.videoToolBar.vrBtn.addEventListener("click", function (e) {

        if (AVR.isMobileDevice()) {
            if (AVR.OS.isWeixin() && !AVR.OS.isiOS()) {
                if (that.video.getAttribute('x5-video-orientation') == "landscape") {
                    that.video.setAttribute('x5-video-orientation', 'portraint');
                    btnInactive(this);
                } else {
                    that.video.setAttribute('x5-video-orientation', 'landscape');
                    btnActive(this);
                }
            } else {
                if (!AVR.isCrossScreen()) {
                    btnInactive(this);
                    AVR.msgBox(that.VRhint, 5, that.container);
                } else {
                    btnActive(this);
                    AVR.fullscreen(that.container);
                }
            }
        } else {
            if (!this.getAttribute("fullscreen")) {
                btnActive(this);
                this.setAttribute("fullscreen", "true");
            } else {
                btnInactive(this);
                this.removeAttribute("fullscreen");
            }
            AVR.fullscreen(that.container);
        }
    }, false);
    that.renderer.domElement.addEventListener( 'wheel', function(e) {
        var delta = e.deltaY > 0 ? 15 : -15;
        if (that.camera.fov + delta * 0.05 >= 10 && that.camera.fov + delta * 0.05 <= 120) {
            fovChange(delta);
        }
    }, false );
    function fovChange(delta){
        that.camera.fov += delta * 0.05;
        that.camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', function () {
        if (!AVR.isFullscreen()) {
            if (AVR.OS.isWeixin() && !AVR.OS.isiOS()) {
                if (that.video.getAttribute('x5-video-orientation') == "landscape") {
                    btnActive(that.videoToolBar.vrBtn);
                } else {
                    btnInactive(that.videoToolBar.vrBtn);
                }
                AVR.isCrossScreen(function (ret) {
                    if (ret) {
                        btnActive(that.videoToolBar.vrBtn);
                    } else {
                        btnInactive(that.videoToolBar.vrBtn);
                    }
                });
            } else {
                AVR.isCrossScreen(function (ret) {
                    if (ret) {
                        btnActive(that.videoToolBar.vrBtn);
                    } else {
                        btnInactive(that.videoToolBar.vrBtn);
                    }
                });
                btnInactive(that.videoToolBar.vrBtn);
            }
        } else {

            if (AVR.isMobileDevice()) {
                AVR.isCrossScreen(function (ret) {
                    if (ret) {
                        btnActive(that.videoToolBar.vrBtn);
                    } else {
                        btnInactive(that.videoToolBar.vrBtn);
                    }
                });

            } else {
                btnActive(that.videoToolBar.vrBtn);
            }
        }
        bindVolumeEvent();
    }, false);
    function btnActive(obj) {
        obj.style.borderColor = "green";
        obj.style.color = "green";
    }

    function btnInactive(obj) {
        obj.style.borderColor = "white";
        obj.style.color = "white";
    }

    that._play=function() {
        that.videoToolBar.btn.style.border = "none";
        that.videoToolBar.btn.style.fontWeight = 800;
        that.videoToolBar.btn.innerHTML = "<b>||</b>";
    }

    that._pause=function() {
        that.videoToolBar.btn.innerText = "";
        that.videoToolBar.btn.style.borderTop = "0.6rem solid transparent";
        that.videoToolBar.btn.style.borderLeft = "1rem solid white";
        that.videoToolBar.btn.style.borderBottom = "0.6rem solid transparent";
    }

    if (that.recType.box == recType) {
        var textures = [];
        var materials = [];

        var imageObj = new Image();
        imageObj.src = recUrl;
        imageObj.onload = function () {
            var canvas, context;
            var tileWidth = imageObj.height;

            for (var i = 0; i < 6; i++) {
                textures[i] = new THREE.Texture();
                canvas = document.createElement('canvas');
                context = canvas.getContext('2d');
                canvas.height = tileWidth;
                canvas.width = tileWidth;
                context.drawImage(imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth);
                textures[i].image = canvas;
                textures[i].needsUpdate = true;
                materials.push(new THREE.MeshBasicMaterial({map: textures[i]}));
            }
            var Box = new THREE.Mesh(new THREE.CubeGeometry(that.vrbox.width, that.vrbox.height, that.vrbox.depth), new THREE.MultiMaterial(materials));
            Box.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
            Box.visible=false;
            Box.name = objName;
            that.VRObject.add(Box);
            that.loadProgressManager.onLoad();
        }
        imgPanoToolBar();
    }else if(that.recType.slice==recType){
        var cubeGeometry = new THREE.CubeGeometry(that.vrbox.width, that.vrbox.height, that.vrbox.depth, that.sliceSegment, that.sliceSegment, that.sliceSegment);
        //cubeGeometry.scale(-1, 1, 1)
        var textureLoader = new THREE.TextureLoader(that.loadProgressManager);
        textureLoader.mapping = THREE.UVMapping;
        var materials=[];
        for(var i=0;i<recUrl.length;i++){
            materials.push(new THREE.MeshBasicMaterial({map:textureLoader.load(recUrl[i])}));
        }
        var faceId=0;
        var uv = [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)];
        for (var i = 0, l = cubeGeometry.faces.length; i < l; i+=2) {
            cubeGeometry.faces[i].materialIndex = faceId;
            cubeGeometry.faces[i + 1].materialIndex = faceId;
            cubeGeometry.faceVertexUvs[0][i] = [uv[3], uv[0], uv[2]];
            cubeGeometry.faceVertexUvs[0][i + 1] = [uv[0], uv[1], uv[2]];
            faceId++;
        }
        var cube=new THREE.Mesh(cubeGeometry,materials);
        cube.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
        cube.name = objName;
        cube.visible=false;
        that.VRObject.add(cube);
        if(that.asteroidConfig.enable){
            cubeCamera2 = new THREE.CubeCamera(that.cameraPara.near, that.cameraPara.far, that.asteroidConfig.cubeResolution);
            cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
            //cubeCamera2.rotation.z=Math.PI;
            that.VRObject.add(cubeCamera2);
            material = new THREE.MeshBasicMaterial({
                envMap: cubeCamera2.renderTarget.texture, side: THREE.BackSide
            });
            sphere = new THREE.Mesh(new THREE.SphereGeometry(that._containerRadius, 180, 180), material);
            sphere.position.set(0,0,0);
            that.VRObject.add(sphere);
            that.asteroidForward=function(callback){
                cubeCamera2.update(that.renderer, that.scene);
                asteroidForward(callback);
            }
        }else {
            that._controlTarget = {x: -0.001, y: 0, z: 0};
        }
        imgPanoToolBar();

    } else {
        var phiStart = 0;
        if(AVR.OS.isiOS()) {
            phiStart = Math.PI / 2;
        }else if(AVR.OS.isGooglePixel()){
            if (AVR.isCrossScreen()) {
                phiStart = Math.PI/2 ;
            }else{
                phiStart = Math.PI;
            }
        }else if(AVR.OS.isSamsung()){
            if (AVR.isCrossScreen()) {
                phiStart = Math.PI/2 ;
            }else{
                phiStart = Math.PI/2;
            }
        }else if(AVR.OS.isMiOS()){
            if (AVR.isCrossScreen()) {
                phiStart = -Math.PI/2 ;
            }
        }else if (!AVR.OS.isMobile()) {
            phiStart -= Math.PI / 2;

        } else {
            if (!AVR.isCrossScreen()) {
                phiStart = Math.PI / 2;
            }
        }

        var geometry = geometry = new THREE.SphereBufferGeometry(this.vrbox.radius, this.vrbox.widthSegments, this.vrbox.heightSegments, phiStart);
        geometry.scale(-1, 1, 1); //x取反（面朝里）
        if (that.recType.video == recType) {

            var video = AVR.createTag('video', {
                'webkit-playsinline': true,
                'playsinline': true,
                'preload': 'auto',
                'x-webkit-airplay': 'allow',
                'x5-playsinline': true,
                'x5-video-player-type': 'h5',
                'x5-video-player-fullscreen': true,
                'x5-video-orientation': 'portrait',
                'width': AVR.Broswer.isIE() ? 1920 : 2048,
                'height': AVR.Broswer.isIE() ? 960 : 1024,
                'src': recUrl,
                'style': 'object-fit: fill'
            }, {
                'allowsInlineMediaPlayback': true
            });

            var buffTimer = false;

            setInterval(function (e) {
                that.videoToolBar.playProgress.style.width = (video.currentTime / video.duration) * 100 + "%";
                that.videoToolBar.curTime.innerText = AVR.formatSeconds(video.currentTime);
                that.videoToolBar.totalTime.innerText = AVR.formatSeconds(video.duration);
                if (that.autoHideLeftTime < 0 && !video.paused) {
                    that.videoToolBar.toolbar.style.display = "none";
                } else {
                    that.autoHideLeftTime--;
                }
            }, 1000);

            video.addEventListener("canplaythrough", function (e) {
                if (!buffTimer) {
                    buffTimer = setInterval(function (e) {
                        var allBuffered = 0;
                        if (video.buffered.length != 0) {
                            allBuffered += video.buffered.end(0);
                        }
                        if (allBuffered >= video.duration) {
                            clearInterval(buffTimer);
                        }
                        that.videoToolBar.loadedProgress.style.width = (allBuffered / video.duration) * 100 + "%";
                    }, 500);

                }
            }, false);

            that.videoToolBar.progressBar.addEventListener("click", function (e) {
                video.currentTime = video.duration * (e.clientX / this.clientWidth);
            }, false);

            that.videoToolBar.btn.addEventListener("click", function (e) {
                video.paused ? (function () {
                    that._play();
                    video.play();
                })() : (function () {
                    that._pause();
                    video.pause();
                })();
            });

            that.video = video;
            var eventTester = function(e){
                that.video.addEventListener(e,function(){
                    that.loadProgressManager.onLoad();
                },false);
            }
            eventTester("canplay");
            var texture = new THREE.VideoTexture(video);
            texture.minFilter = THREE.LinearFilter;
            //texture.format = THREE.RGBFormat;
            texture.generateMipmaps = false;
            texture.format = THREE.RGBAFormat;

            that.VRObject.add(buildTexture(texture));


        }else {
            imgPanoToolBar();
            new THREE.TextureLoader(that.loadProgressManager).load(recUrl, function (texture) {
                that.VRObject.add(buildTexture(texture));
            });
        }
        function buildTexture(texture) {
            material = new THREE.MeshBasicMaterial({overdraw: true, map: texture});
            mesh = new THREE.Mesh(geometry, material);
            mesh.visible=false;
            mesh.name = objName;
            //mesh.material.map=;

            //that.VRObject.add(mesh);
            if(that.asteroidConfig.enable){
                that.asteroidForward=function(callback){
                    asteroidForward(callback);
                }
            }
            return mesh;
            //that.renderer.setPixelRatio(window.devicePixelRatio);
        }
    }
    function asteroidForward(callback) {
        var config = that.asteroidConfig;
        var defaultFov = that.camera.fov;
        var s = that._containerRadius;
        that.camera.position.y = s * config.asteroidTop;
        that.camera.fov = config.assteroidFov;
        //that.camera.lookAt(0,0,0);
        var v = s / config.asteroidForwardTime * config.assteroidFPS;
        var sFov = that.camera.fov - defaultFov;
        var vFov = sFov / config.asteroidForwardTime * config.assteroidFPS;
        var vRo = Math.PI / 2 / config.asteroidForwardTime * config.assteroidFPS;
        //console.log("s=",s,"speed v=",v,"sFov=",sFov,"speed sfov=",vFov,"vRo=",vRo)
        that.camera.lookAt(0, 0, AVR.isMobileDevice() ? -0.001 : 0.001);
        setTimeout(function () {
            var asteroidForwardTimer = setInterval(function () {
                //console.log("new y=",config.asteroidTop*that.camera.position.y -v);

                if (config.asteroidTop * that.camera.position.y - v <= 0) {
                    that.camera.position.y = 0;
                    that.camera.fov = defaultFov;
                    clearInterval(asteroidForwardTimer);
                    AVR.bindOrientationEnevt(that,that._controlTarget);
                    if(void 0 !== callback){
                        // Wait for the controller to initialize to complete the callback.
                        var controlTimer=setInterval(function () {
                            if(that.controls){
                                clearInterval(controlTimer);
                                callback();
                            }
                        })

                    }
                } else {
                    that.camera.position.y -= (v * config.asteroidTop);
                    that.camera.fov -= vFov;
                    that.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), vRo * config.asteroidTop);
                }
                that.camera.updateProjectionMatrix();
            }, config.assteroidFPS);
        }, config.asteroidWaitTime);
    }
    function imgPanoToolBar() {
        setInterval(function (e) {
            if (that.autoHideLeftTime < 0) {
                that.videoToolBar.toolbar.style.display = "none";
            } else {
                that.autoHideLeftTime--;
            }
        }, 1000);
        that.videoToolBar.btn.addEventListener("click", function (e) {
            that.controls.autoRotate ? that._pause() : that._play();
            that.controls.autoRotate = !that.controls.autoRotate;
        });
    }

    function bindVolumeEvent() {
        var Audio=that.video || that.audio
        if (Audio) {
            that.videoToolBar.voice_bar.style.display = "block";
            var voice_bar = that.videoToolBar.voice_bar;
            var voice_slide_bar = voice_bar.firstChild;
            var voice_cur_slide_bar = voice_slide_bar.firstChild;
            var voice_btn = voice_cur_slide_bar.firstChild;
            var mouseDown = false, touchStartY = 0, touchCurrentY = 0, tempY;
            Audio.volume = that.defaultVolume;
            voice_cur_slide_bar.style.height = (Audio.volume * that.container.clientHeight) + "px";
            voice_bar.addEventListener("mousedown", function (e) {
                voice_bar.style.opacity = 1;
            }, false);
            voice_slide_bar.addEventListener("click", function (e) {
                e.preventDefault();
                that.voiceHideLeftTime = that.defaultVoiceHideLeftTime;
                voice_cur_slide_bar.style.height = this.clientHeight - e.clientY + "px";
                Audio.volume = (this.clientHeight - e.clientY) / this.clientHeight;

            }, false);
            voice_btn.addEventListener("mousedown", function (e) {
                mouseDown = true;
            }, false);
            voice_btn.addEventListener("mouseup", function (e) {
                mouseDown = false;
            }, false);
            voice_bar.addEventListener("mousemove", function (e) {
                that.voiceHideLeftTime = that.defaultVoiceHideLeftTime;
                if (mouseDown) {
                    voice_cur_slide_bar.style.height = this.clientHeight - e.clientY + "px";
                    if ((this.clientHeight - e.clientY) / this.clientHeight <= 1)
                        Audio.volume = (this.clientHeight - e.clientY) / this.clientHeight;
                }
            }, false);
            voice_bar.addEventListener("touchstart", function (e) {
                e.preventDefault();
                that.voiceHideLeftTime = that.defaultVoiceHideLeftTime;
                tempY = voice_cur_slide_bar.clientHeight;
                touchStartY = e.touches[0].pageY;
                voice_bar.style.opacity = 1;
            }, false);
            voice_bar.addEventListener("touchmove", function (e) {
                e.preventDefault();
                that.voiceHideLeftTime = that.defaultVoiceHideLeftTime;
                touchCurrentY = e.touches[0].pageY;
                voice_cur_slide_bar.style.height = tempY + (touchStartY - touchCurrentY) + "px";
                if (voice_cur_slide_bar.clientHeight / this.clientHeight <= 1)
                    Audio.volume = voice_cur_slide_bar.clientHeight / this.clientHeight;
            }, false);
            voice_bar.addEventListener("touchend", function (e) {
                tempY = 0;
            }, false);
            setInterval(function () {
                if (that.voiceHideLeftTime <= 0) {
                    voice_bar.style.opacity = 0;
                } else {
                    that.voiceHideLeftTime--;
                }
            }, 1000);

        }
    }

    bindVolumeEvent();
};

VR.prototype.sphere2BoxPano=function(img,w,h,callback) {
    var that = this;
    var fases = { 'x': 'x','nx': 'nx', 'ny': 'ny','y': 'y', 'z': 'z', 'nz': 'nz'};
    var canvasArr=[],finishNum=0;
    var i=0;
    var image = new Image();
    image.crossOrigin="anonymous";
    image.src = img;
    image.onload = function() {
        for (var id in fases) {
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.id = "face_" + id;
            canvasArr[i] = canvas;
            var gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});//获取canvas上下文
            var shaderPorgram = initShaders(gl, id);//初始化着色器程序

            var num = initVertexBuffers(gl, shaderPorgram);
            var PI = gl.getUniformLocation(shaderPorgram, 'PI');
            gl.uniform1f(PI, Math.PI);

            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            // Set texture
            if (!initTextures(gl, shaderPorgram, num,image)) {
                console.log('Failed to intialize the texture.');
                //return;
            }
            i++;
        }
    }

    //初始化纹理
    function initTextures(gl,shaderPorgram,n,image){
        var texture = gl.createTexture();//创建纹理对象

        if(!texture){
            console.log('Failed to create the texture object!');
            return false;
        }

        var u_Sampler = gl.getUniformLocation(shaderPorgram,'u_Sampler');

        loadTextures(gl,n,texture,u_Sampler,image);
        return true;
    }

    //加载纹理图片
    function loadTextures(gl,n,texture,u_Sampler,image){
        if(that.asteroidConfig.enable) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, -1);//对纹理图像进行y轴反转
        }
        gl.activeTexture(gl.TEXTURE0);//激活纹理单元
        gl.bindTexture(gl.TEXTURE_2D, texture);//绑定纹理对象

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);//配置纹理对象的参数

        /**
         * RENDER WARNING: texture bound to texture unit 0 is not renderable. It maybe non-power-of-2 and have incompatible texture filtering.
         * 大致意思是纹理没有渲染成功，因为所使用的图片的分辨率不是2的幂数，2的幂数是指2*2、4*4、8*8、16*16...256*256...；
         * 需要设置图形纹理参数时设置水平垂直拉伸。
         */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);//将纹理图像分配给纹理对象

        gl.uniform1i(u_Sampler, 0);//将0号纹理传给着色器中的取样器变量

        //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
        if(finishNum<5){
            finishNum++;
        }else{
            callback(getNewPano());
        }
        //gl.drawArrays(gl.TRIANGLE_STRIP, 1, n); // Draw the rectangle
    }

    //初始化顶点位置
    function initVertexBuffers(gl,shaderPorgram){
        //顶点坐标和纹理坐标映射关系
        var datas = new Float32Array([
            //顶点坐标、纹理坐标
            -1.0,1.0,0.0,1.0,
            -1.0,-1.0,0.0,0.0,
            1.0,1.0,1.0,1.0,
            1.0,-1.0,1.0,0.0,
        ]);

        var num = 4;//顶点数目
        var vertexBuffer = gl.createBuffer();//创建缓冲区对象

        if(!vertexBuffer){
            console.log('Failed to create the buffer object!');
            return -1;
        }

        //将缓冲区对象绑定到目标并写入数据
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,datas,gl.STATIC_DRAW);

        var size = datas.BYTES_PER_ELEMENT;//数组中的每个元素的大小（以字节为单位）

        //顶点着色器接受顶点坐标和纹理坐标映射关系
        var a_Position = gl.getAttribLocation(shaderPorgram,'a_Position');
        gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,size*4,0);
        gl.enableVertexAttribArray(a_Position);

        var a_TexCoord = gl.getAttribLocation(shaderPorgram,'a_TexCoord');
        gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,size*4,size*2);
        gl.enableVertexAttribArray(a_TexCoord);

        return num;
    }
    //初始化着色器
    function initShaders(gl, type) {
        var shaderProgram;
        var fragmentShader = getShader(gl, type);
        var vertexShader = getShader(gl);
        //创建着色器
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        //链接着色器程序
        gl.linkProgram(shaderProgram);
        //检查着色器是否成功链接
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            return null;
        }
        //链接成功后激活渲染器程序
        gl.useProgram(shaderProgram);

        //启用顶点缓冲区数组
        //gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        //shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        //gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
        //shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        //shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        return shaderProgram;
    }

    //根据id获得编译好的着色器
    function getShader(gl, id) {
        var shaderScript;
        var shader;

        //创建顶点着色器或片段着色器
        if (id) {
            shaderScript = getShaderFragment(id);
            if (!shaderScript) {
                return null;
            }
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else {
            shaderScript = getShaderVertex()
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        gl.shaderSource(shader, shaderScript);
        //编译着色器代码
        gl.compileShader(shader);
        //检查是否编译成功
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));//打印编译失败信息
            return null;
        }
        //成功编译返回编译好的着色器
        return shader;
    }

    //<!-- 片段着色器程序 -->
    function getShaderFragment(type) {
        var code = "";
        var variable = "\n\
        precision mediump float;\n\
        varying vec2 v_TexCoord;\n\
        uniform sampler2D u_Sampler;\n\
        uniform float PI;\n";

        //超出范围处理\
        var checkRange = "\n\
        if(abs(theta)>PI){\n\
            if(theta>PI){\n\
                theta -= 2.0*PI;\n\
            }else{\n\
                theta += 2.0*PI;\n\
            }\n\
        }\n\
        if(abs(phi)>PI/2.0){\n\
            if(phi>PI/2.0){\n\
                phi -= PI;\n\
            }else{\
                phi += PI;\n\
            }\n\
        }\n\
        float x = theta/PI*0.5 + 0.5;\n\
        float y = phi/PI*2.0*0.5 + 0.5;\n\
        gl_FragColor = texture2D(u_Sampler, vec2(x,y));\n";
        if (type == 'z') {
            //z轴正平面-z\
            code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(0.5-v_TexCoord.x,v_TexCoord.y-0.5);\n\
				float theta = atan(orig.x,r);\n\
				float phi = atan(orig.y*cos(theta),r);" + checkRange + "\n\
			}\n";
        } else if (type == "nz") {
            //z轴负平面-nz\
            code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(0.5-v_TexCoord.x,v_TexCoord.y-0.5);\n\
				float theta = atan(orig.x,r);\n\
				float phi = atan(orig.y*cos(theta),r);\n\
        		theta = theta+PI;\n" + checkRange + "\n\
			}\n";
        } else if (type == "x") {
            //x轴正平面-x\
            code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(v_TexCoord.x-0.5,v_TexCoord.y-0.5);\n\
				float theta = atan(r,orig.x);\n\
				float phi = atan(orig.y*sin(theta),r);" + checkRange + "\n\
			}\n";
        } else if (type == "nx") {
            //x轴负平面-nx\
            code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(v_TexCoord.x-0.5,v_TexCoord.y-0.5);\n\
				float theta = atan(r,orig.x);\n\
				float phi = atan(orig.y*sin(theta),r);\n\
        		theta = theta+PI;" + checkRange + "\n\
			}\n";
        } else if (type == "y") {
            //y轴正平面-y\
            code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(0.5-v_TexCoord.x,0.5-v_TexCoord.y);\n\
        		float theta = atan(orig.x,orig.y);\n\
        		float phi = atan(r*sin(theta),orig.x);" + checkRange + "\n\
			}\n";
        } else if (type == "ny") {
            //y轴负平面-ny
            code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(0.5-v_TexCoord.x,v_TexCoord.y-0.5);\n\
				float theta = atan(orig.x,orig.y);\n\
				float phi = atan(r*sin(theta),orig.x);\n\
				phi = -phi;" + checkRange + "\n\
			}\n";
        } else {
            console.error("shader fragment type error!");
        }
        return code;
    }

    function getShaderVertex() {
        var code = "\n\
        attribute vec4 a_Position;\n\
        attribute vec2 a_TexCoord;\n\
        varying vec2 v_TexCoord;\n\
        void main() {\n\
            gl_Position= a_Position;\n\
            v_TexCoord = a_TexCoord;\n\
        }\n";
        return code;
    }

    function getNewPano() {
        var c = document.createElement('canvas'),ctx = c.getContext('2d');
        c.width = w * 6;
        c.height = h;

        var tmp=document.createElement('canvas'),tmpctx = tmp.getContext('2d');
        tmp.width = w;
        tmp.height=h;
        var degree = 180 * Math.PI / 180;
        tmpctx.rotate(degree);
        if(that.sliceSegment) {
            var sliceArray=[];
            var canvasCell=document.createElement("canvas");
            canvasCell.width=h/that.sliceSegment;
            canvasCell.height=h/that.sliceSegment;
            var canvasCtx=canvasCell.getContext("2d");
            for (var idx in canvasArr) {
                tmpctx.drawImage(canvasArr[idx], 0, 0, -w, -h);
                for(var row=0;row<that.sliceSegment;row++){
                    for(var col=0;col<that.sliceSegment;col++){
                        canvasCtx.putImageData(tmpctx.getImageData(col*(h/that.sliceSegment),row*(h/that.sliceSegment),h*(col+1)/that.sliceSegment,h*(row+1)/that.sliceSegment),0,0);
                        sliceArray.push(canvasCell.toDataURL());
                    }
                }
            }
            return sliceArray;
        }else{
            for (var idx in canvasArr) {
                tmpctx.drawImage(canvasArr[idx], 0, 0, -w, -h);
                ctx.drawImage(tmp, w * idx, 0, w, h);
            }
            return c.toDataURL();
        }
    };

}

var AR=function (scene,renderer,container,cameraPara,cameraPosition) {
    var that = this;
    AVR.setCameraPara(that,cameraPara,cameraPosition);
    this.scene = scene;
    this.renderer = renderer;
    this.container = container;

    this.constraints = {};
    this.video = null;
    this.openAudio = true;
    this.frameRate = 60;
    this.useCamera={'environment':0,'user':1};//前置摄像头，否则为后置
    this.cameraIndex = 1;//0为前置摄像头，否则为后置
    this._cameras=[];
    this._controlTarget={x:0.0001,y:0,z:0};
    this._windowWidth = window.innerWidth;
    this._windowHeight = window.innerHeight;
    this.camera=new THREE.PerspectiveCamera(this.cameraPara.fov,this.cameraPara.aspect , this.cameraPara.near, this.cameraPara.far);
    this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
    this.scene.add(this.camera);
    this.clock = new THREE.Clock();

    this.effect = AVR.stereoEffect(this.renderer);

}
AR.prototype.init=function () {
    var self=this;
    AVR.bindOrientationEnevt(self,self._controlTarget);
    this.video=document.createElement('video');
    this.video.setAttribute("autoplay","autoplay");
    //this.video.style.height=this._windowHeight+"px";
    //this.video.style.width=this._windowWidth+"px";
    //this.video.style.background="#ffffff";
    if(AVR.isCrossScreen()) {
        this.video.width = Math.max(this._windowWidth, this._windowHeight);
    }else {
        this.video.height = Math.max(this._windowWidth, this._windowHeight);
    }
    this.video.style.display="none";
    document.body.appendChild(this.video);


    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    void 0 === navigator.mediaDevices && (navigator.mediaDevices = {});

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (void 0 === navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia = function(constraints) {

            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;//navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
    function enumerateDevices() {
        return navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                devices.forEach(function (device) {
                    if (device.kind === "videoinput") {
                        self._cameras.push(device.deviceId);
                    }
                });
            });
    }
    enumerateDevices().then(function() {
        self.constraints = self.constraints.length > 0 ? self.constraints : {
            audio: self.openAudio,
            video: {
                width: {min: self._windowWidth, ideal: self._windowWidth, max: self._windowWidth},
                height: {min: self._windowHeight, ideal: self._windowHeight, max: self._windowHeight},
                //facingMode:self.frontCamera?"user":"environment",    /* 使用前置/后置摄像头*/
                //Lower frame-rates may be desirable in some cases, like WebRTC transmissions with bandwidth restrictions.
                frameRate: self.frameRate,//{ideal:10,max:15},
                //deviceId: {exact: self.frontCamera?'user':'environment'}
                deviceId: {exact: self._cameras[self.cameraIndex]}
            }
        };
        navigator.mediaDevices.getUserMedia(self.constraints).then(
            function (stream) {
                // Older browsers may not have srcObject
                if ("srcObject" in self.video) {
                    self.video.srcObject = stream;
                } else {
                    // Avoid using this in new browsers, as it is going away.
                    self.video.src = window.URL.createObjectURL(stream);
                }
                self.video.onloadedmetadata = function (e) {
                    self.video.play();
                    document.body.addEventListener("click", function (e) {
                        self.video.play();
                    }, false);

                }

            }
        ).catch(
            function (err) {
                alert(err.name + ": " + err.message)
            }
        );
    });

    function render(dt) {
        var width = self.container.offsetWidth;
        var height = self.container.offsetHeight;
        //self.camera.aspect = width / height;
        if ((AVR.isMobileDevice() && AVR.isCrossScreen())) {
            self.effect.setSize(width, height);
            self.effect.render(self.scene, self.camera);
        } else {
            self.renderer.setSize(width, height);
            self.renderer.setClearColor(new THREE.Color(0xffffff));
            self.renderer.render(self.scene, self.camera);
        }
        self.camera.updateProjectionMatrix();
        if (self.controls) {
            self.controls.update(dt);
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        render(self.clock.getDelta());
    }
    animate();
}
AR.prototype._createCanvas=function(id){
    var canvasobj=document.getElementById(id);
    if(canvasobj ===null) {
        canvasobj = document.createElement('canvas');
        canvasobj.style.width = this._windowWidth + "px";
        canvasobj.style.height = this._windowHeight + "px";
        canvasobj.id = id;
        canvasobj.style.background="#ffffff";
        document.body.appendChild(canvasobj);
    }
    return canvasobj;
}
//拍照
AR.prototype.showPhoto=function() {
    var canvas1=this._createCanvas('_content');
    var photoCanvas = canvas1.getContext('2d');
    photoCanvas.drawImage(this.video, 0, 0,this._windowWidth,this._windowHeight); //将video对象内指定的区域捕捉绘制到画布上指定的区域，实现拍照。
}
//视频
AR.prototype.showVedio=function() {
    var canvas2 =this._createCanvas('_content');
    var videoCanvas=canvas2.getContext('2d');
    // 将视频帧绘制到Canvas对象上,Canvas每60ms切换帧，形成肉眼视频效果
    setInterval(function () {
        videoCanvas.drawImage(this.video, 0, 0,this._windowWidth,this._windowHeight);
    }, 60);
}
AR.prototype.play=function () {
    var that=this;
    that.video.oncanplaythrough=function () {
        if (that.video.readyState === that.video.HAVE_ENOUGH_DATA) {
            var image = new THREE.VideoTexture(that.video);
            image.generateMipmaps = false;
            image.format = THREE.RGBAFormat;
            image.maxFilter = THREE.NearestFilter;
            image.minFilter = THREE.NearestFilter;
            that.scene.background = image;                   // 背景视频纹理
            image.needsUpdate = true;
        }
    }

}

var AVR= {
    debug: false,
    startGyro:function () {
        var self=this;
        window.addEventListener("deviceorientation", orientationHandler, false);
        function orientationHandler(event) {
            /*"左右旋转：rotate alpha{" + Math.round(event.alpha) + "deg)";
            "前后旋转：rotate beta{" + Math.round(event.beta) + "deg)";
            "扭转设备：rotate gamma{" + Math.round(event.gamma) + "deg);*/
            //AVR.msgBox(Math.sin(Math.round(event.beta-90)),36,document.body);
            self.gyroEvent=event;
        }
    },
    stereoEffect : function ( renderer ) {

        // API
        /*Angle of deviation*/
        this.separation = 1;

        /*
         * Distance to the non-parallax or projection plane
         */
        this.focalLength = 15;

        // internals

        var _width, _height;

        var _position = new THREE.Vector3();
        var _quaternion = new THREE.Quaternion();
        var _scale = new THREE.Vector3();

        var _cameraL = new THREE.PerspectiveCamera();
        var _cameraR = new THREE.PerspectiveCamera();

        var _fov;
        var _outer, _inner, _top, _bottom;
        var _ndfl, _halfFocalWidth, _halfFocalHeight;
        var _innerFactor, _outerFactor;

        // initialization

        renderer.autoClear = false;

        this.setSize = function (width, height) {

            _width = width / 2;
            _height = height;

            renderer.setSize(width, height);

        };

        this.render = function (scene, camera) {

            scene.updateMatrixWorld();

            void 0 === camera.parent && camera.updateMatrixWorld();

            camera.matrixWorld.decompose(_position, _quaternion, _scale);

            // Stereo frustum calculation

            // Effective fov of the camera
            _fov = THREE.Math.radToDeg(2 * Math.atan(Math.tan(THREE.Math.degToRad(camera.fov) * 0.5)));

            _ndfl = camera.near / this.focalLength;
            _halfFocalHeight = Math.tan(THREE.Math.degToRad(_fov) * 0.5) * this.focalLength;
            _halfFocalWidth = _halfFocalHeight * 0.5 * camera.aspect;

            _top = _halfFocalHeight * _ndfl;
            _bottom = -_top;
            _innerFactor = ( _halfFocalWidth + this.separation / 2.0 ) / ( _halfFocalWidth * 2.0 );
            _outerFactor = 1.0 - _innerFactor;

            _outer = _halfFocalWidth * 2.0 * _ndfl * _outerFactor;
            _inner = _halfFocalWidth * 2.0 * _ndfl * _innerFactor;

            // left

            _cameraL.projectionMatrix.makePerspective(
                -_outer,
                _inner,
                _top,
                _bottom,
                camera.near,
                camera.far
            );

            _cameraL.position.copy(_position);
            _cameraL.quaternion.copy(_quaternion);
            _cameraL.translateX(-this.separation / 2.0);

            // right

            _cameraR.projectionMatrix.makePerspective(
                -_inner,
                _outer,
                _top,
                _bottom,
                camera.near,
                camera.far
            );

            _cameraR.position.copy(_position);
            _cameraR.quaternion.copy(_quaternion);
            _cameraR.translateX(this.separation / 2.0);

            //

            renderer.setViewport(0, 0, _width * 2, _height);
            //renderer.clear();

            renderer.setViewport(0, 0, _width, _height);
            renderer.render(scene, _cameraL);

            renderer.setViewport(_width, 0, _width, _height);
            renderer.render(scene, _cameraR);

        };
        return this;
    },
    orbitControls : function(object,domElement){
        var controls=function ( object, domElement ) {

            this.domElement = ( void 0 !== domElement ) ? domElement : document;
            this.object = object;

            this.enable = false;

            this.target = new THREE.Vector3();

            // How far you can orbit vertically, upper and lower limits.
            // Range is 0 to Math.PI radians.
            this.minPolarAngle = 0; // radians
            this.maxPolarAngle = Math.PI; // radians

            // How far you can orbit horizontally, upper and lower limits.
            // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
            this.minAzimuthAngle = -Infinity; // radians
            this.maxAzimuthAngle = Infinity; // radians

            // Set to true to enable damping (inertia)
            // If damping is enabled, you must call controls.update() in your animation loop
            this.enableDamping = false;
            this.dampingFactor = 0.25;

            this.rotateSpeed = 0.3;

            // Set to true to automatically rotate around the target
            // If auto-rotate is enabled, you must call controls.update() in your animation loop
            this.autoRotate = false;
            this.autoRotateSpeed = 1.0; // 30 seconds per round when fps is 60

            this.deviceOrientation = {};
            this.screenOrientation = window.orientation ? window.orientation : 0;

            var scope = this;

            scope.defaultDirectionOfRotation = true;
            scope.gyroEnable = true;
            scope.usingGyro = AVR.OS.isMobile() ? true : false;
            scope._defaultTargetY = scope.target.y;
            scope._defaultCameraFov = scope.object.fov;
            scope._defaultCameraY = scope.object.position.y;
            var changeEvent = {type: 'change'};
            var startEvent = {type: 'start'};
            var endEvent = {type: 'end'};

            var EPS = 0.000001;

            // current position in spherical coordinates
            var spherical = new THREE.Spherical();
            var sphericalDelta = new THREE.Spherical();

            var rotateStart = new THREE.Vector2();
            var rotateEnd = new THREE.Vector2();
            var rotateDelta = new THREE.Vector2();

            var setObjectQuaternion = function () {
                var zee = new THREE.Vector3(0, 0, 1);
                var euler = new THREE.Euler();
                var q0 = new THREE.Quaternion();
                // - PI/2 around the x-axis
                var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

                //beta=beta-180;
                return function (quaternion, alpha, beta, gamma, orient) {
                    // 'ZXY' for the device, but 'YXZ' for us
                    euler.set(beta, alpha, -gamma, 'YXZ');
                    // orient the device
                    quaternion.setFromEuler(euler);
                    // camera looks out the back of the device, not the top
                    quaternion.multiply(q1);
                    // adjust for screen orientation
                    quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
                }
            }();

            // this method is exposed, but perhaps it would be better if we can make it private...
            this.update = function () {
                var offset = new THREE.Vector3();

                // so camera.up is the orbit axis

                var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
                var quatInverse = quat.clone().inverse();

                var lastPosition = new THREE.Vector3();
                var lastQuaternion = new THREE.Quaternion();
                var lastGamma = 0, lastBeta = 0;

                var tempAlpha = 0, tempBeta = 0, tempGamma = 0;
                return function update(param) {
                    if (!scope.enable) {
                        return;
                    }

                    param = param || {};

                    var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad(scope.deviceOrientation.alpha) : 0; // Z
                    var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad(scope.deviceOrientation.beta) : 0; // X'
                    var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad(scope.deviceOrientation.gamma) : 0; // Y''
                    var orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0; // O
                    if (scope.gyroEnable) {
                        tempAlpha = alpha,tempBeta = beta,tempGamma = gamma;
                    } else {
                        alpha = tempAlpha,beta = tempBeta,gamma = tempGamma;
                    }
                    //AVR.msgBox("alpha="+scope.deviceOrientation.alpha.toFixed(2)+",beta="+scope.deviceOrientation.beta.toFixed(2)+",gamma="+scope.deviceOrientation.gamma.toFixed(2)+",orient="+window.orientation,0.5,document.body)
                    //AVR.msgBox("x="+scope.object.position.x.toFixed(2)+",y="+scope.object.position.y.toFixed(2)+",z="+scope.object.position.z.toFixed(2) ,0.5,document.body);
                    var currentQ = new THREE.Quaternion().copy(scope.object.quaternion);

                    setObjectQuaternion(currentQ, alpha, beta, gamma, orient);
                    var currentAngle = Quat2Angle(currentQ.x, currentQ.y, currentQ.z, currentQ.w);
                    if (!param.init) {
                        // currentAngle.z = Left-right
                        // currentAngle.y = Up-down
                        rotateLeft((lastGamma - currentAngle.z));
                        rotateUp((lastBeta - currentAngle.y));
                    }


                    lastBeta = currentAngle.y;
                    lastGamma = currentAngle.z;
                    var position = scope.object.position;

                    offset.copy(position).sub(scope.target);

                    // rotate offset to "y-axis-is-up" space
                    offset.applyQuaternion(quat);

                    // angle from z-axis around y-axis
                    spherical.setFromVector3(offset);

                    if (scope.autoRotate) {
                        rotateLeft(getAutoRotationAngle());
                    }

                    spherical.theta += sphericalDelta.theta;
                    spherical.phi += sphericalDelta.phi;

                    // restrict theta to be between desired limits
                    spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));

                    // restrict phi to be between desired limits
                    spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

                    spherical.makeSafe();
                    offset.setFromSpherical(spherical);

                    // rotate offset back to "camera-up-vector-is-up" space
                    offset.applyQuaternion(quatInverse);
                    position.copy(scope.target).add(offset);

                    scope.object.lookAt(scope.target);

                    if (scope.enableDamping === true) {
                        sphericalDelta.theta *= ( 1 - scope.dampingFactor );
                        sphericalDelta.phi *= ( 1 - scope.dampingFactor );
                    } else {
                        sphericalDelta.set(0, 0, 0);
                    }

                    // update condition is:
                    // min(camera displacement, camera rotation in radians)^2 > EPS
                    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                    if (lastPosition.distanceToSquared(scope.object.position) > EPS ||
                        8 * ( 1 - lastQuaternion.dot(scope.object.quaternion) ) > EPS) {

                        scope.dispatchEvent(changeEvent);

                        lastPosition.copy(scope.object.position);
                        lastQuaternion.copy(scope.object.quaternion);

                        return true;
                    }

                    return false;
                };
            }();

            function getAutoRotationAngle() {

                return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

            }

            function rotateLeft(angle) {
                if (scope.defaultDirectionOfRotation) {
                    if (scope.usingGyro) {
                        sphericalDelta.theta -= angle;
                    } else {
                        sphericalDelta.theta += angle;
                    }
                } else {
                    sphericalDelta.theta -= angle;
                }
            }

            function rotateUp(angle) {
                if (scope.defaultDirectionOfRotation) {
                    if (scope.usingGyro) {
                        sphericalDelta.phi -= angle;
                    } else {
                        sphericalDelta.phi += angle;
                    }
                } else {
                    sphericalDelta.phi -= angle;
                }
            }

            function Quat2Angle(x, y, z, w) {
                var pitch, roll, yaw;

                var test = x * y + z * w;
                if (test > 0.499) { // singularity at north pole
                    yaw = 2 * Math.atan2(x, w);
                    pitch = Math.PI / 2;
                    roll = 0;

                    var euler = new THREE.Vector3(pitch, roll, yaw);
                    return euler;
                }

                if (test < -0.499) { // singularity at south pole
                    yaw = -2 * Math.atan2(x, w);
                    pitch = -Math.PI / 2;
                    roll = 0;
                    var euler = new THREE.Vector3(pitch, roll, yaw);
                    return euler;
                }

                var sqx = x * x;
                var sqy = y * y;
                var sqz = z * z;

                yaw = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
                pitch = Math.asin(2 * test);
                roll = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);
                //AVR.msgBox("yaw="+yaw.toFixed(2)+",pitch="+pitch.toFixed(2)+",roll="+roll.toFixed(2) ,0.5,document.body);
                var euler = new THREE.Vector3(pitch, roll, yaw);
                return euler;
            }

            var mouseDown = false;

            function mousedown(event) {
                mouseDown = true;
                rotateStart.set(event.clientX, event.clientY);
            }

            function mousemove(event) {
                rotateEnd.set(event.clientX, event.clientY);
                rotateDelta.subVectors(rotateEnd, rotateStart);

                // rotating across whole screen goes 360 degrees around
                var clientWidth = (void 0 !== scope.domElement.clientWidth) ? scope.domElement.clientWidth : window.innerWidth;
                rotateLeft(2 * Math.PI * rotateDelta.x / clientWidth * scope.rotateSpeed);

                // rotating up and down along whole screen attempts to go 360, but limited to 180
                var clientHeight = (void 0 !== scope.domElement.clientHeight) ? scope.domElement.clientHeight : window.innerHeight;
                rotateUp(2 * Math.PI * rotateDelta.y / clientHeight * scope.rotateSpeed);

                rotateStart.copy(rotateEnd);
                scope.update();
            }

            function mouseup(event) {
                mouseDown = false;
            }

            function touchstart(event) {
                //console.log( 'handleTouchStartRotate' );
                rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                scope.usingGyro = false;
            }

            function touchmove(event) {
                //console.log( 'handleTouchMoveRotate' );

                event.preventDefault();

                rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                rotateDelta.subVectors(rotateEnd, rotateStart);

                // rotating across whole screen goes 360 degrees around
                var clientWidth = (void 0 != scope.domElement.clientWidth) ? scope.domElement.clientWidth : window.innerWidth;
                rotateLeft(2 * Math.PI * rotateDelta.x / clientWidth * scope.rotateSpeed);

                // rotating up and down along whole screen attempts to go 360, but limited to 180
                var clientHeight = (void 0 !== scope.domElement.clientHeight) ? scope.domElement.clientHeight : window.innerHeight;
                rotateUp(2 * Math.PI * rotateDelta.y / clientHeight * scope.rotateSpeed);

                rotateStart.copy(rotateEnd);

                scope.update();
                scope.usingGyro = false;
            }

            function touchend(event) {
                //console.log( 'handleTouchEnd' );
                scope.usingGyro = AVR.OS.isMobile() ? true : false;
            }

            function deviceorientation(event) {
                scope.deviceOrientation = event;
            }

            function orientationchange(event) {
                scope.screenOrientation = window.orientation || 0;
            }

            window.addEventListener('orientationchange', orientationchange, false);
            window.addEventListener('deviceorientation', deviceorientation, false);
            this.gyroFreeze = function () {
                scope.gyroEnable = false;
            };
            this.gyroUnfreeze = function () {
                scope.gyroEnable = true;
            };

            this.domElement.addEventListener("mousedown", mousedown, false);
            this.domElement.addEventListener('mousemove', function (e) {
                if (scope.enable && mouseDown) {
                    mousemove(e);
                }
            }, false);
            this.domElement.addEventListener("mouseup", mouseup, false);
            this.domElement.addEventListener('touchstart', touchstart, false);
            this.domElement.addEventListener('touchend', touchend, false);
            this.domElement.addEventListener('touchmove', touchmove, false);

            // set mousemove base point is dom center
            var clientWidth = (void 0 !== this.domElement.clientWidth) ? this.domElement.clientWidth : window.innerWidth;
            var clientHeight = (void 0 !== this.domElement.clientHeight) ? this.domElement.clientHeight : window.innerHeight;
            rotateStart.set(clientWidth / 2, clientHeight / 2);

            // force an update at start
            rotateLeft(THREE.Math.degToRad(-90));
            setTimeout(function () {
                scope.enable = true;
                scope.update({init: true});
            }, 0);
            return this;
        }
        controls.prototype=Object.create(THREE.EventDispatcher.prototype);
        controls.prototype.constructor=controls;
        return new controls(object,domElement);
    },
    setCameraPara: function (that, cameraPara, cameraPosition) {
        that.cameraPara = {"fov": 90, "aspect": window.innerWidth / window.innerHeight, "near": 0.001, "far": 1000};
        that.cameraPosition = {"x": 0, "y": 0, "z": 0};
        if (cameraPara) {
            for (var property in cameraPara) {
                that.cameraPara[property] = cameraPara[property];
            }
        }
        if (cameraPosition) {
            for (var property in cameraPosition) {
                that.cameraPosition[property] = cameraPosition[property];
            }
        }
    },
    formatSeconds: function (value) {
        var theTime = parseInt(value);// 秒
        var theTime1 = 0;// 分
        var theTime2 = 0;// 小时
        if (theTime > 60) {
            theTime1 = parseInt(theTime / 60);
            theTime = parseInt(theTime % 60);
            if (theTime1 > 60) {
                theTime2 = parseInt(theTime1 / 60);
                theTime1 = parseInt(theTime1 % 60);
            }
        }
        var result = "" + ((parseInt(theTime) < 10) ? "0" + parseInt(theTime) : parseInt(theTime));
        if (theTime1 >= 0 && theTime2 > 0) {
            result = ((parseInt(theTime2) < 10) ? "0" + parseInt(theTime2) : parseInt(theTime2)) + ":" + ((parseInt(theTime1) < 10) ? "0" + parseInt(theTime1) : parseInt(theTime1)) + ":" + result;
        } else if (theTime1 > 0 && theTime2 == 0) {
            if (theTime1 == 60) {
                result = "01:00:" + result;
            } else {
                result = ((parseInt(theTime1) < 10) ? "0" + parseInt(theTime1) : parseInt(theTime1)) + ":" + result;
            }

        } else {
            if (theTime == 60) {
                result = "01:00";
            } else {
                result = "00:" + result;
            }
        }
        return result;
    },
    cameraVector:function (camera,times) {
        var vector=new THREE.Vector3(0,0,-1);
        var lookAt=vector.applyQuaternion(camera.quaternion);
        var lookAtVector=lookAt.clone();
        var timesVector=new THREE.Vector3();
        if(times) {
            timesVector.x = lookAt.x * times;
            timesVector.y = lookAt.y * times;
            timesVector.z = lookAt.z * times;
        }
        return {'vector':lookAtVector,'timesVector':timesVector};
    },
    bindCameraEvent:function (vr,options) {
        options=options||{hover:function (e) {},leave:function(e){},on:function(e){},empty:function(e){},move:function(e){}};
        var that = this;
        var scale=options.scale || 0.05;
        var vectorRadius = options.vectorRadius;
        var radius = vectorRadius*scale/2;
        var tube = vectorRadius*(scale/6);
        var pointSize=vectorRadius*(scale/8);
        var radialSegments = 2;
        var tubularSegments = options.tubularSegments || 60;
        var speed=options.speed || 36;
        var ControlGroup = new THREE.Group();
        ControlGroup.name = "__controlHandle";

        var waitGeometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, 2 * Math.PI);
        var waitMaterial = [];
        for (var i = 0; i < waitGeometry.faces.length / 2; i++) {
            waitMaterial[i] = new THREE.MeshBasicMaterial({color: 0xcccccc,depthTest:false});
        }
        var faceId = 0;
        var uv = [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)];
        for (var i = 0, l = waitGeometry.faces.length; i < l; i += 2) {
            waitGeometry.faces[i].materialIndex = faceId;
            waitGeometry.faces[i + 1].materialIndex = faceId;
            waitGeometry.faceVertexUvs[0][i] = [uv[3], uv[0], uv[2]];
            waitGeometry.faceVertexUvs[0][i + 1] = [uv[0], uv[1], uv[2]];
            faceId++;
        }
        var wait = new THREE.Mesh(waitGeometry, waitMaterial);
        wait.lookAt(vr.camera.position)
        wait.name = "__wait";
        wait.visible=false;
        ControlGroup.add(wait);

        var cameraPointer = new THREE.Mesh(new THREE.CircleGeometry(tube, 4), new THREE.MeshBasicMaterial({
            color: 0xffffff,wireframe: true,depthTest:false
        }));
        cameraPointer.lookAt(vr.camera.position);
        cameraPointer.name = "__focus";
        cameraPointer.material.depthTest=false;
        cameraPointer.visible=false;
        ControlGroup.add(cameraPointer);
        ControlGroup.position.set(0, 0, 0.1)
        var timer = null;
        var lastCameraVector=new THREE.Vector3();
        var updatePosition = function () {
            ControlGroup.lookAt(vr.camera.position);
            var v=that.cameraVector(vr.camera,vectorRadius);
            cameraPointer.visible = true;
            ControlGroup.position.set(v.timesVector.x,v.timesVector.y,v.timesVector.z);
            //在视点坐标系中形成射线,射线的起点向量是照相机， 射线的方向向量是照相机到点击的点，这个向量应该归一标准化。
            var raycaster = new THREE.Raycaster(vr.camera.position, v.vector);

            //射线和模型求交，选中一系列直线
            var intersects = raycaster.intersectObjects(vr.scene.children,true);
            if(intersects.length) {
                options.move(intersects);
            }else {
                options.empty(intersects);
            }
        }
        var Ctimer=null;
        var hover=function (e) {
            wait.visible=true;
            var offset = 0;
            var mIndex = 0;
            if(!Ctimer) {
                Ctimer = setInterval(function () {
                    if (mIndex < waitGeometry.faces.length / 4) {
                        waitMaterial[mIndex].color = new THREE.Color(0xff0000)
                        waitGeometry.needsUpdate = true;
                        waitGeometry.faces[offset].materialIndex = mIndex;
                        waitGeometry.faces[offset + 1].materialIndex = mIndex;
                        waitGeometry.faceVertexUvs[0][offset] = [uv[3], uv[0], uv[2]];
                        waitGeometry.faceVertexUvs[0][offset + 1] = [uv[0], uv[1], uv[2]];
                        offset += 2;
                    } else {
                        clearInterval(Ctimer);
                        options.on(e);
                    }
                    mIndex++;
                }, speed);
            }
        }
        var leave=function (e) {
            clearInterval(Ctimer);
            Ctimer=null;
            faceId = 0;
            for (var i = 0, l = waitGeometry.faces.length; i < l; i += 2) {
                waitMaterial[faceId].color = new THREE.Color(0xcccccc)
                waitGeometry.needsUpdate = true;
                waitGeometry.faces[i].materialIndex = faceId;
                waitGeometry.faces[i + 1].materialIndex = faceId;
                waitGeometry.faceVertexUvs[0][i] = [uv[3], uv[0], uv[2]];
                waitGeometry.faceVertexUvs[0][i + 1] = [uv[0], uv[1], uv[2]];
                faceId++;
            }
            wait.visible=false;
        }
        vr.VRObject.add(ControlGroup);
        return {controlGroup:ControlGroup,updatePosition:updatePosition,hover:hover,leave:leave};
    },
    screenPosTo3DCoordinate:function(event,container,camera) {
        var x = event.clientX - container.offsetLeft;
        var y = event.clientY - container.offsetTop;
        //console.log(x,y);
        var W = container.clientWidth;
        var H = container.clientHeight;
        var mouse = new THREE.Vector2();
        mouse.x = 2 * x / W - 1;
        mouse.y = 1 - 2 * y / H;
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(camera);
        return vector;
    },
    objectPosToScreenPos:function (object,container,camera) {
        var vector = new THREE.Vector3();
        vector.setFromMatrixPosition(object.matrixWorld).project(camera);
        var x2hat = vector.x, y2hat = vector.y;
        var W = container.clientWidth;
        var H = container.clientHeight;
        var pos = new THREE.Vector2();
        pos.x = (W / 2) * (x2hat + 1);
        pos.y = (H / 2) * (1 - y2hat);
        return pos;
    },
    fullscreen: function (el) {
        var isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || false;

        if (!isFullscreen) {//进入全屏,多重短路表达式
            (el.requestFullscreen && el.requestFullscreen()) ||
            (el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
            (el.webkitRequestFullscreen && el.webkitRequestFullscreen()) || (el.msRequestFullscreen && el.msRequestFullscreen());

        } else {	//退出全屏,三目运算符
            document.exitFullscreen ? document.exitFullscreen() :
                document.mozCancelFullScreen ? document.mozCancelFullScreen() :
                    document.webkitExitFullscreen ? document.webkitExitFullscreen() : '';
        }
    },
    isFullscreen: function (callback) {
        var that = this;

        function c_back(e) {
            callback(that.isFullscreen());
        }

        if (typeof callback === "function") {
            //监听状态变化
            window.removeEventListener('fullscreenchange', c_back, false);
            window.removeEventListener('webkitfullscreenchange', c_back, false);
            window.removeEventListener('mozfullscreenchange', c_back, false);
            window.removeEventListener('msFullscreenChange', c_back, false);

            window.addEventListener('fullscreenchange', c_back, false);
            window.addEventListener('webkitfullscreenchange', c_back, false);
            window.addEventListener('mozfullscreenchange', c_back, false);
            window.addEventListener('msFullscreenChange', c_back, false);

        } else {
            return document.fullscreenElement ||
                document.msFullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement || false;
        }
    },
    videoToolBar: function (container) {
        var pre = "_videoToolBar";
        var toolbar = this.createTag('div', {
            'style': '-moz-user-select:none;-webkit-user-select:none;user-select:none;position:absolute;background:rgba(0,0,0,.6);z-index:9999;width:100%;height:2.2rem;bottom:0rem',
            'class': pre + 'Area'
        });

        var btn = this.createTag('div', {
            'style': 'position:inherit;border-top:0.6rem solid transparent;border-left:1rem solid white;border-bottom:0.6rem solid transparent;bottom:0.25rem;left:1rem;color:#fff;font-weight:800;cursor:pointer',
            'class': pre + 'Btn'
        })
        toolbar.appendChild(btn);
        var timeInfo = this.createTag('div', {
            'style': 'position:inherit;bottom:0.25rem;left:2.8rem;color:#fff;font-size:0.75rem'
        });
        var curTime = this.createTag('span', null, {
            'innerText': "00:00"
        });
        timeInfo.appendChild(curTime);
        var splitTime = this.createTag('span', null, {
            'innerText': '/'
        });
        timeInfo.appendChild(splitTime);

        var totalTime = this.createTag('span', null, {
            'innerText': '00:00'
        });
        timeInfo.appendChild(totalTime);

        toolbar.appendChild(timeInfo);

        var gyroBtn = this.createTag('div', {
            'style': 'border:0.125rem solid white;border-radius:1rem;width:1.4rem;height:1rem;position:inherit;right:3.5rem;line-height:1rem;bottom:0.25rem;cursor:pointer'
        });
        var circle1 = this.createTag('div', {
            'style': 'position:inherit;width:1.235rem;height:0.4rem;line-height:0.4rem;border:0.0625rem solid white;border-radius:0.6rem/0.2rem;margin-top:0.25rem;margin-left:0.055rem;'
        });
        gyroBtn.appendChild(circle1);
        var circle2 = this.createTag('div', {
            'style': 'position:inherit;width:1rem;height:0.4rem;line-height:0.4rem;border:0.0625rem solid white;border-radius:0.6rem/0.2rem;margin-top:0.25rem;margin-left:0.175rem;transform:rotate(90deg)'
        })
        gyroBtn.appendChild(circle2);
        toolbar.appendChild(gyroBtn);
        var vrBtn = this.createTag('div', {
            'style': "position:inherit;right:1rem;width:1.4rem;height:1rem;line-height:1rem;border:0.125rem solid white;border-radius:0.125rem;bottom:0.25rem;text-align:center;font-weight:800;color:#fff;font-size:0.75rem;cursor:pointer"
        }, {
            'innerText': "VR"
        });

        toolbar.appendChild(vrBtn);

        var progressBar = this.createTag('div', {
            'style': 'position:inherit;top:0rem;width:100%;height:0.3125rem;background:rgba(255,255,255,.7);cursor:pointer'
        });

        var loaded_progress = this.createTag('div', {
            'style': 'position:inherit;width:0%;height:0.3125rem;background:rgba(255,255,255,.7)'
        });
        progressBar.appendChild(loaded_progress);
        var play_progress = this.createTag('div', {
            'style': 'position:inherit;width:0%;height:0.3125rem;background:rgba(28, 175, 252,.8)'
        });
        progressBar.appendChild(play_progress);

        toolbar.appendChild(progressBar);

        container.appendChild(toolbar);

        var voice_bar = this.createTag('div', {
            'style': '-moz-user-select:none;-webkit-user-select:none;user-select:none;position:absolute;width:2rem;height:100%;background:rgba(0,0,0,0);right:0rem;top:0rem;text-align:center;display:none'
        });
        var voice_slide_bar = this.createTag('div', {
            'style': 'position:inherit;width:0.25rem;background:rgba(255,255,255,.1);height:100%;left:0.875rem;cursor:pointer;'
        });
        voice_bar.appendChild(voice_slide_bar);

        var voice_cur_slide = this.createTag('div', {
            'style': 'position:inherit;width:100%;background:rgba(255, 255, 255,.6);bottom:0rem;'
        });
        voice_slide_bar.appendChild(voice_cur_slide);

        var voice_slide_btn = this.createTag('div', {
            'style': 'position:inherit;width:1rem;height:1rem;border-radius:1rem;background:rgba(255,255,255,0.6);top:0rem;margin-left:-0.375rem;cursor:pointer'
        });
        voice_cur_slide.appendChild(voice_slide_btn);

        container.appendChild(voice_bar);

        return {
            'toolbar': toolbar,
            'btn': btn,
            'timeInfo': timeInfo,
            'curTime': curTime,
            'splitTime': splitTime,
            'totalTime': totalTime,
            'vrBtn': vrBtn,
            'progressBar': progressBar,
            'loadedProgress': loaded_progress,
            'playProgress': play_progress,
            'gyroBtn': gyroBtn,
            "circle1": circle1,
            "circle2": circle2,
            "voice_bar": voice_bar
        };
    },
    msgBox: function (msg, timeout, container) {

        var msgbox = this.createTag('div', {
            'style': 'position:absolute;bottom:50%;width:100%;padding:0.25rem;background:rgba(0,0,0,.6);color:#fff;text-align:center;'
        }, {
            'innerHTML': msg
        });
        container.appendChild(msgbox);
        setTimeout(function () {
            msgbox.remove();
        }, timeout * 1000);
    },
    isMobileDevice: function (deviceType) {
        var sUserAgent = navigator.userAgent.toLowerCase();
        if (deviceType) {
            return (sUserAgent.match(/ipad/i) || sUserAgent.match(/iphone os/i) || sUserAgent.match(/midp/i) ||
                sUserAgent.match(/rv:1.2.3.4/i) || sUserAgent.match(/ucweb/i) || sUserAgent.match(/android/i) ||
                sUserAgent.match(/windows ce/i) || sUserAgent.match(/windows mobile/i))
        }

        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
            //dconsole.log("phone");
            return true;
        } else {
            //console.log("pc");
            return false;
        }
    },
    bindOrientationEnevt: function (that,target) {
        if (void 0 === that.controls) {
            if (AVR.isMobileDevice()) {
                target.y = -1;
            }
            that.controls = AVR.orbitControls(that.camera, that.renderer.domElement);
            var target = new THREE.Vector3(target.x, target.y, target.z);
            that.controls.target = target;
            that.controls.update(that.clock.getDelta());
        }
    },
    //横屏判断
    isCrossScreen: function (callback) {
        var that = this;

        if (typeof callback === "function") {
            function c_back(e) {
                callback(that.isCrossScreen());
            }

            window.removeEventListener('orientationchange', c_back, false);
            window.addEventListener('orientationchange', c_back, false);
        } else {
            if (window.orientation == 180 || window.orientation == 0) {
                /*Vertical screen*/
                return false;
            }
            if (window.orientation == 90 || window.orientation == -90) {
                /*is Cross Screen*/
                return true;
            }
        }
    },
    initDomStyle: function (container) {
        document.body.style.overflow = "hidden";
        document.body.style.margin = 0;
        document.body.style.padding = 0;
        container.style.position = "absolute";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.left = "0px";
        container.style.top = "0px";
        container.style.overflow = "hidden";
        document.oncontextmenu = function () {
            return false;
        };
        document.onkeydown = function () {
            if (!this.debug && window.event && window.event.keyCode == 123) {
                event.keyCode = 0;
                event.returnValue = false;
                return false;
            }
        };
    },
    createTag: function (tag, attr, objs) {
        var oMeta = document.createElement(tag);
        if (attr && typeof attr === "object") {
            for (var k in attr) {
                oMeta.setAttribute(k, attr[k]);
            }
        }
        if (objs && typeof objs === "object") {
            for (var k in objs) {
                oMeta[k] = objs[k];
            }
        }
        return oMeta;
    },
    OS: {
        weixin: navigator.userAgent.indexOf('MicroMessenger') > -1,
        android: /android/i.test(navigator.userAgent.toLowerCase()),
        ios: /(iphone|ipad|ipod|ios)/i.test(navigator.userAgent.toLowerCase()),
        googlePixel: navigator.userAgent.match(/;\sPixel\sBuild\//),
        MiOS: navigator.userAgent.match(/;\sMI\s\d\sBuild\//),
        samsungOS: navigator.userAgent.match(/;\sSM\-\w+\sBuild\//),
        isGooglePixel: function () {
            return this.googlePixel != null;
        },
        isMiOS: function () {
            return this.MiOS != null;
        },
        isSamsung: function () {
            return this.samsungOS != null;
        },
        isMobile: function () {
            return this.android || this.ios;
        },

        isAndroid: function () {
            return this.android;
        },

        isiOS: function () {
            return this.ios;
        },

        isWeixin: function () {
            return this.weixin;
        }
    },
    Broswer: {
        win: window,
        nav: window.navigator,
        REG_APPLE: /^Apple/,
        ie: navigator.userAgent.match(/MSIE\s([\d.]+)/) || navigator.userAgent.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
        edge: navigator.userAgent.match(/Edge\/([\d.]+)/),
        chrome: navigator.userAgent.match(/Chrome\/([\d.]+)/) || navigator.userAgent.match(/CriOS\/([\d.]+)/),
        webview: !this.chrome && navigator.userAgent.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
        safari: this.webview || navigator.userAgent.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/),
        chromiumType: null,

        _getChromiumType: function () {
            if (this.chromiumType != null) {
                return this.chromiumType;
            }

            var win = this.win;

            if (this.isIE() || void 0 === win.scrollMaxX || this.REG_APPLE.test(this.nav.vendor || '')) {
                return '';
            }

            // 搜狗浏览器
            if (this._testExternal(/^sogou/i, 0)) {
                return 'sogou';
            }

            // 猎豹浏览器
            if (this._testExternal(/^liebao/i, 0)) {
                return 'liebao';
            }


            // 360浏览器
            if (this.nav.mimeTypes[30] || !this.nav.mimeTypes.length) {
                return '360';
            }

            // chrome
            if (win.clientInformation && win.clientInformation.permissions) {
                return 'chrome';
            }

            return '';
        },

        _testExternal: function (reg, type) {
            var external = this.win.external || {};

            for (var i in external) {
                if (reg.test(type ? external[i] : i)) {
                    return true;
                }
            }

            return false;
        },

        isIE: function () {
            return this.ie != null;
        },

        ieVersion: function () {
            return this.ie != null ? parseInt(this.ie[1]) : false;
        },

        isEdge: function () {
            return this.edge != null;
        },

        isSafari: function () {
            return this.safari != null;
        },

        is360: function () {
            this.chromiumType = this._getChromiumType();
            return this.chromiumType === '360';
        },

        isSogou: function () {
            this.chromiumType = this._getChromiumType();
            return this.chromiumType === 'sogou';
        },
        isChromium: function () {
            return this._getChromiumType() === 'chrome'
        },
        webglAvailable: function () {
            try {
                var canvas = document.createElement('canvas');
                return !!( window.WebGLRenderingContext && (
                        canvas.getContext('webgl') ||
                        canvas.getContext('experimental-webgl') )
                );
            } catch (e) {
                return false;
            }
        }
    },
};

var head=document.getElementsByTagName('head')[0];
head.appendChild(AVR.createTag('meta',{'name':'viewport','content':"width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0,minimal-ui,user-scalable=no"}));
head.appendChild(AVR.createTag('meta',{'name':'google','content':"notranslate"}));
if(AVR.debug) {
    window.onerror = function (msg, url, l) {
        txt = "There was an error on this page.\n\n"
        txt += "Error: " + msg + "\n"
        txt += "URL: " + url + "\n"
        txt += "Line: " + l + "\n\n"
        AVR.msgBox(txt, 36, document.body)
        return true
    }
}