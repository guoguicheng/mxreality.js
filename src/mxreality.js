/*
 *Copyright © 2019 mxreality.js authors
 *Website:www.mxreality.cn
 *免费软件，请保留版权注释
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory(global));
}(this, (function (exports) {
    var VR = function (scene, renderer, container, cameraPara, cameraPosition, onload) {
        console.log('version 1.2.26');
        var options = null;
        if (!AVR.Broswer.webglAvailable()) {
            console.log('Your browser does not support webgl');
            return;
        }
        if (1 === arguments.length && !(scene instanceof THREE.Scene)) {
            options = scene;
            if (!options.id) {
                console.error('player container id required!');
                return;
            }
            container = null;
            renderer = null;
            if (!AVR.Broswer.isIE()) {
                renderer = new THREE.WebGLRenderer();
            } else {
                renderer = new THREE.CanvasRenderer();
            }
            renderer.setPixelRatio(window.devicePixelRatio);
            if ('string' === typeof options.id) {
                container = document.getElementById(options.id);
            } else if (options.id instanceof HTMLElement) {
                container = options.id;
            }
            container.appendChild(renderer.domElement);
            scene = new THREE.Scene();
            cameraPara = options.camera_para ? options.camera_para : null;
            cameraPosition = options.camera_position ? options.camera_position : null;
        }

        this.scene = scene;
        this.renderer = renderer;
        this.container = container;
        AVR.initDomStyle(container);
        AVR.setCameraPara(this, cameraPara, cameraPosition);
        this.vrbox = {
            "radius": 2,
            "widthSegments": 180,
            "heightSegments": 180,
            "width": 2,
            "height": 2,
            "depth": 2
        };
        this.liveSettings = {
            "forceUseHls": false,
            "forceUseVndAppleMpegUrl": false,
            "forceUseXmpegUrl": false,
            "usePlugin": false,
            "loadPlugin": function (video) {
                console.log('load video', video);
            }
        };
        this.hlsConfig = {
            autoStartLoad: true,
        };
        this.flvConfig = {
            type: 'flv',
            isLive: true,
        };
        this.destoryed = false;
        this.video = null;
        this.audio = null;
        this.toolBar = null;
        this.clock = new THREE.Clock();
        this.VRObject = new THREE.Object3D();
        this.defaultAutoHideLeftTime = 3;
        this.defaultVoiceHideLeftTime = 2;
        this.defaultVolume = 0.3;
        this.sliceSegment = 0;
        this._controlTarget = new THREE.Vector3(0, 0, 0.0001);
        this._cubeCameraTimes = 0.96;
        this.playCfg = {
            muted: false,
            autoplay: false,
            shape: 'sphere'
        };
        this.shapeList = { 'sphere': 'sphere', 'box': 'box' };
        this.resType = {
            "video": "video",
            "box": "box",
            "slice": "slice",
            "sliceVideo": "sliceVideo",
            'flvVideo': 'flvVideo'
        };
        this.videoPlayHook = function () {
            console.log('video play');
        };
        this.videoPauseHook = function () {
            console.log('video pause');
        };
        this.asteroidConfig = {
            enable: false,
            asteroidFPS: 10,
            asteroidFov: 135,
            asteroidForwardTime: 2600,
            asteroidWaitTime: 2000,
            asteroidDepressionRate: 0.5,
            asteroidTop: 1,
            cubeResolution: 2048,
            rotationAngleOfZ: 0
        };
        this.VRhint = "请取消屏幕翻转锁定后装入VR盒子中";
        this.camera = new THREE.PerspectiveCamera(this.cameraPara.fov, this.cameraPara.aspect, this.cameraPara.near, this.cameraPara.far);
        this.camera.lookAt(this._controlTarget);
        this.cameraEvt = {
            'controlGroup': function () { },
            'updatePosition': function () { },
            'hover': function () { },
            'leave': function () { }
        };
        this._takeScreenShot = false;
        this.timerList = {};
        this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
        this.loadProgressManager = new THREE.LoadingManager(function (xhr) {
            console.log("loaded");
        }, function (item, loaded, total) {
            console.log("item=", item, "loaded", loaded, "total=", total);
        }, function (xhr, cl) {
            console.log(xhr, cl);
        });
        this.scene.add(this.camera);
        this.scene.add(this.VRObject);
        //this.renderer.setPixelRatio( window.devicePixelRatio );
        this.effect = AVR.stereoEffect(this.renderer);
        AVR.bindOrientationEvent(this, this._controlTarget);
        if (onload && 'function' === typeof onload) {
            onload();
        }
        if (options && options.onload && 'function' === typeof options.onload) {
            options.onload();
        }
    };
    VR.prototype.destroy = function () {
        var that = this;
        if (that.video) {
            that.video.pause();
            that.video = null;
        }
        if (that.audio) {
            that.audio.pause();
            that.audio = null;
        }
        if (that.hlsPlayer) {
            that.hlsPlayer.destroy();
        }
        if (that.flvPlayer) {
            that.flvPlayer.destroy();
        }
        for (var timer in that.timerList) {
            clearInterval(that.timerList[timer]);
        }
        if (that.boxRenderFrame) {
            cancelAnimationFrame(that.boxRenderFrame);
        }
        that.destoryed = true;
    };
    VR.prototype.init = function (extendsAnimationFrame) {
        var that = this;
        var startPos = new THREE.Vector2();
        var curPos = new THREE.Vector2();
        that.toolBar = AVR.toolBar(that.container);
        var toolBar = that.toolBar;
        var spots = {},
            touches, timer, _s = 0;

        toolBar.defaultHeight = toolBar.toolbar.clientHeight;
        toolBar.defaultMaxHeight = toolBar.defaultHeight * 5;
        toolBar.isMouseDown = false;
        that.container.addEventListener("click", function () {
            that.autoHideLeftTime = that.defaultAutoHideLeftTime;
            toolBar.toolbar.style.display = "block";
        });
        toolBar.gyroBtn.addEventListener("click", function () {
            that.gyroBtnClick();
        }, false);
        toolBar.vrBtn.addEventListener("click", function () {
            that.vrBtnClick();
        }, false);
        toolBar.moreBtn.addEventListener("click", function () {
            that.moreBtnClick();
        }, false)
        that.container.addEventListener('touchstart', function (e) {
            that.touchStart(e);
        }, false);
        that.container.addEventListener('touchmove', function (e) {
            that.touchMove(e);
        }, false);
        that.container.addEventListener('touchend', function (e) {
            that.touchEnd(e);
        }, false);
        toolBar.gyroResetBtn.addEventListener("click", ongyroreset, false);
        toolBar.toolbar.addEventListener("mousedown", onmousedown, false);
        toolBar.toolbar.addEventListener("touchstart", onmousedown, false);
        toolBar.toolbar.addEventListener("mousemove", onmousemove, false);
        toolBar.toolbar.addEventListener("touchmove", onmousemove, false);
        toolBar.toolbar.addEventListener("mouseup", onmouseup, false);
        toolBar.toolbar.addEventListener("touchend", onmouseup, false);
        toolBar.toolbar.addEventListener("mouseout", function (e) {
            that.autoHideLeftTime = that.defaultAutoHideLeftTime;
            toolBar.isActive = false;
        }, false);
        that.renderer.domElement.addEventListener('wheel', function (e) {
            var delta = e.deltaY > 0 ? 15 : -15;
            if (that.camera.fov + delta * 0.05 >= 10 && that.camera.fov + delta * 0.05 <= 120) {
                fovChange(delta);
            }
        }, false);

        toolBar.moreList.addEventListener("mousemove", slide, false);
        toolBar.moreList.addEventListener("touchmove", slide, false);

        that.moreBtnClick = function (e) {
            if (toolBar.toolbar.clientHeight > toolBar.defaultHeight) {
                slideBar(-10);
            } else {
                slideBar(6);
            }
        };
        that.vrBtnClick = function (e) {
            var vrBtn = that.toolBar.vrBtn;
            if (AVR.isMobileDevice()) {
                if (AVR.OS.isWeixin() && !AVR.OS.isiOS()) {
                    if (that.video.getAttribute('x5-video-orientation') == "landscape") {
                        that.video.setAttribute('x5-video-orientation', 'portraint');
                        btnInactive(vrBtn);
                    } else {
                        that.video.setAttribute('x5-video-orientation', 'landscape');
                        btnActive(vrBtn);
                    }
                } else {
                    if (!AVR.isCrossScreen()) {
                        btnInactive(vrBtn);
                        AVR.msgBox(that.VRhint, 5, that.container);
                    } else {
                        btnActive(vrBtn);
                        AVR.fullscreen(that.container);
                    }
                }
            } else {
                if (!vrBtn.getAttribute("fullscreen")) {
                    btnActive(vrBtn);
                    vrBtn.setAttribute("fullscreen", "true");
                } else {
                    btnInactive(vrBtn);
                    vrBtn.removeAttribute("fullscreen");
                }
                AVR.fullscreen(that.container);
            }
        };
        that.gyroBtnClick = function (e) {
            var gyroBtn = that.toolBar.gyroBtn;
            if (gyroBtn.getAttribute("active") == 'active') {
                that.controls.gyroFreeze();
                btnInactive(gyroBtn);
                gyroBtn.removeAttribute("active");
            } else {
                that.controls.gyroUnfreeze();
                gyroBtn.setAttribute("active", "active");
                btnActive(gyroBtn);
            }
        };

        function ongyroreset() {
            that.controls && (that.controls.reset());
        }
        that.touchStart = function (e) {
            if (e.targetTouches) {
                [].forEach.call(e.targetTouches, function (touch) {
                    if (spots[touch.identifier]) {
                        return;
                    }

                    spots[touch.identifier] = new THREE.Vector2(0, 0);

                });
                clearInterval(that.timerList.renderTouchersRimer);
                that.timerList.renderTouchersRimer = setInterval(function () {
                    renderTouches(touches);
                }, 1);
            }
        };

        function onmousedown(e) {
            toolBar.isMouseDown = true;
            var x = e.clientX || e.changedTouches[0].clientX;
            var y = e.clientY || e.changedTouches[0].clientY;
            startPos.set(x, y);
            curPos.set(x, y);
            that.autoHideLeftTime = that.defaultAutoHideLeftTime;
            toolBar.isActive = true;
        }

        that.touchEnd = function (e) {
            if (e.targetTouches) {
                [].forEach.call(e.changedTouches, function (touch) {
                    var spot = spots[touch.identifier];
                    if (spot) {
                        delete spots[touch.identifier];
                    }
                });
                if (e.targetTouches.length === 0) {
                    _s = 0;
                    that.controls.enable = true;
                    clearInterval(timer);
                }

            }
        };

        function onmouseup(e) {
            toolBar.isMouseDown = false;
        }
        that.touchMove = function (e) {
            touches = e.touches;
        };

        function onmousemove(e) {
            e.preventDefault();
            that.autoHideLeftTime = that.defaultAutoHideLeftTime;
            that.toolBar.isActive = true;
            if (toolBar.isMouseDown) {
                var x = e.clientX || e.changedTouches[0].clientX;
                var y = e.clientY || e.changedTouches[0].clientY;
                var offsetY = curPos.y - y;
                if (offsetY >= 5) {
                    slideBar(6);
                }
                if (offsetY <= -5) {
                    slideBar(-10);
                }
                curPos.set(x, y);
            }
        }

        function renderTouches(touches) {
            void 0 === that.controls.defaultDampingFactor && (that.controls.defaultDampingFactor = that.controls.dampingFactor);
            void 0 === that.controls.object.defaultFov && (that.controls.object.defaultFov = that.controls.object.fov);
            if (!touches) {
                return;
            };
            var num = 0,
                ids = [];
            [].forEach.call(touches, function (touch) {
                var spot = spots[touch.identifier];
                if (spot) {
                    spot.y = touch.pageY;
                    spot.x = touch.pageX;
                    ids.push(touch.identifier);
                }
                num++;
                if (num >= 2) {
                    var pos0 = spots[ids[0]];
                    var pos1 = spots[ids[1]];
                    var s = Math.sqrt(Math.pow(pos0.x - pos1.x, 2) + Math.pow(pos0.y - pos1.y, 2));
                    var s1 = (s - _s) / 4;
                    if (that.controls.object.fov - s1 < 140 && that.controls.object.fov - s1 > 10 && _s) {
                        that.controls.enable = false;
                        that.controls.object.fov -= s1;
                        that.controls.dampingFactor = that.controls.defaultDampingFactor * that.controls.object.defaultFov / that.controls.object.fov;
                    }
                    _s = s;
                    num = 0;
                    return;
                }
            });
        }

        function slideBar(h) {
            clearInterval(that.timerList.slideBarAniateTimer);
            that.timerList.slideBarAniateTimer = animateTimer = setInterval(function () {
                var step = (toolBar.toolbar.clientHeight + h);
                if (step >= toolBar.defaultHeight && step <= toolBar.defaultMaxHeight) {
                    toolBar.toolbar.style.height = step + "px";
                    toolBar.isActive = true;
                } else {
                    clearInterval(animateTimer);
                    if (h > 0) {
                        toolBar.isActive = true;
                        toolBar.moreBtn.style.transform = "rotate(-180deg)";
                        toolBar.moreBtn.style.webkitTransform = "rotate(-180deg)";
                        toolBar.toolbar.style.height = toolBar.defaultMaxHeight + "px";
                        toolBar.about.style.display = "block";
                    } else {
                        toolBar.isActive = false;
                        toolBar.moreBtn.style.transform = "rotate(0deg)";
                        toolBar.moreBtn.style.webkitTransform = "rotate(0deg)";
                        toolBar.toolbar.style.height = toolBar.defaultHeight + "px";
                        toolBar.about.style.display = "none";
                    }

                }
                that.autoHideLeftTime = that.defaultAutoHideLeftTime;
            }, 1);

        }

        function slide(e) {
            that.autoHideLeftTime = that.defaultAutoHideLeftTime;
            toolBar.isActive = true;
            var x = e.clientX || e.changedTouches[0].clientX;
            var y = e.clientY || e.changedTouches[0].clientY;
            if (toolBar.isMouseDown) {
                toolBar.moreList.scrollLeft += (curPos.x - x) * 2.5;
            }
            curPos.set(x, y);
        }

        function fovChange(delta) {
            that.camera.fov += delta * 0.05;
            that.camera.updateProjectionMatrix();
        }
        that.windowResize = function () {
            if (!AVR.isFullscreen()) {
                if (AVR.OS.isWeixin() && !AVR.OS.isiOS()) {
                    if (that.video.getAttribute('x5-video-orientation') == "landscape") {
                        btnActive(that.toolBar.vrBtn);
                    } else {
                        btnInactive(that.toolBar.vrBtn);
                    }
                    if (AVR.isCrossScreen()) {
                        btnActive(that.toolBar.vrBtn);
                    } else {
                        btnInactive(that.toolBar.vrBtn);
                    }
                } else {
                    if (AVR.isCrossScreen()) {
                        btnActive(that.toolBar.vrBtn);
                    } else {
                        btnInactive(that.toolBar.vrBtn);
                    }
                    btnInactive(that.toolBar.vrBtn);
                }
            } else {
                if (AVR.isMobileDevice()) {
                    if (AVR.isCrossScreen()) {
                        btnActive(that.toolBar.vrBtn);
                    } else {
                        btnInactive(that.toolBar.vrBtn);
                    }

                } else {
                    btnActive(that.toolBar.vrBtn);
                }
            }
        };
        window.addEventListener('resize', function () {
            bindVolumeEvent();
        }, false);

        function btnActive(obj) {
            obj.style.borderBottom = "1px solid #ccc";

            if (that.cameraEvt.controlGroup.length) {
                var pointObj = that.cameraEvt.controlGroup.getObjectByName("__focus");
                pointObj.visible = true;
            }
        }

        function btnInactive(obj) {
            obj.style.borderBottom = "none";

            if (that.cameraEvt.controlGroup.length) {
                var pointObj = that.cameraEvt.controlGroup.getObjectByName("__focus");
                pointObj.visible = false;
            }
        }

        that._play = function () {
            toolBar.btn.innerHTML = AVR.playerIcon.pauseSvg;
        };

        that._pause = function () {
            toolBar.btn.innerHTML = AVR.playerIcon.playSvg;
        };

        function bindVolumeEvent() {
            var Audio = that.video || that.audio;
            if (Audio) {
                var ract = AVR.getBoundingClientRect(that.container);
                toolBar.voice_bar.style.display = "block";
                var voice_bar = toolBar.voice_bar;
                var voice_slide_bar = voice_bar.firstChild;
                var voice_cur_slide_bar = voice_slide_bar.firstChild;
                var voice_btn = voice_cur_slide_bar.firstChild;
                var mouseDown = false,
                    touchStartY = 0,
                    touchCurrentY = 0,
                    tempY;
                Audio.volume = that.defaultVolume;
                var voice_bar_height = toolBar.voice_bar.clientHeight;
                var offset_h = (that.container.clientHeight - voice_bar_height) / 2;
                var h_top = voice_bar_height + offset_h;
                voice_cur_slide_bar.style.height = (Audio.volume * voice_bar_height) + "px";
                voice_bar.addEventListener("mousedown", function (e) {
                    voice_bar.style.opacity = 1;
                }, false);
                voice_slide_bar.addEventListener("click", function (e) {
                    var y = (e.clientY || e.changedTouches[0].clientY) - ract.top;
                    that.voiceHideLeftTime = that.defaultVoiceHideLeftTime;
                    var cur_h = h_top - y;
                    if (cur_h / voice_bar_height <= 1) {
                        voice_cur_slide_bar.style.height = cur_h + "px";
                        Audio.volume = cur_h / voice_bar_height;
                    }

                }, false);
                voice_bar.addEventListener("mouseout", function (e) {
                    mouseDown = false;
                }, false);
                voice_bar.addEventListener("mousedown", function (e) {
                    mouseDown = true;
                }, false);
                voice_bar.addEventListener("mouseup", function (e) {
                    mouseDown = false;
                }, false);
                voice_bar.addEventListener("mousemove", function (e) {
                    var y = (e.clientY || e.changedTouches[0].clientY) - ract.top;
                    that.voiceHideLeftTime = that.defaultVoiceHideLeftTime;
                    if (mouseDown) {
                        var cur_h = h_top - y;
                        voice_cur_slide_bar.style.height = cur_h + "px";
                        if (cur_h / voice_bar_height <= 1)
                            Audio.volume = cur_h / voice_bar_height;
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
                    var next_h = tempY + (touchStartY - touchCurrentY);
                    if (next_h / voice_bar_height <= 1) {
                        voice_cur_slide_bar.style.height = next_h + "px";
                        Audio.volume = next_h / voice_bar_height;
                    }
                }, false);
                voice_bar.addEventListener("touchend", function (e) {
                    tempY = 0;
                }, false);
                clearInterval(that.timerList.voiceBarActiveTimer);
                that.timerList.voiceBarActiveTimer = setInterval(function () {
                    if (that.voiceHideLeftTime <= 0) {
                        voice_bar.style.opacity = 0;
                    } else {
                        that.toolBar.isActive ? null : that.voiceHideLeftTime--;
                    }
                }, 1000);

            }
        }
        that.bindVolumeBar = bindVolumeEvent;

        function render() {

            if (that.destoryed) {
                return;
            }
            var width = that.container.offsetWidth;
            var height = that.container.offsetHeight;
            that.camera.aspect = width / height;
            if ((AVR.isMobileDevice() && AVR.isCrossScreen() && AVR.enableVrMode)) {
                that.cameraEvt.updatePosition();
                that.effect.setSize(width, height);
                that.effect.render(that.scene, that.camera);
            } else {
                that.renderer.setSize(width, height);
                that.renderer.setClearColor(new THREE.Color(0xffffff));
                that.renderer.render(that.scene, that.camera);
            }
            if (that._takeScreenShot) {
                that._takeScreenShot = false;
                var screenshot = that.renderer.domElement.toDataURL("image/jpeg");
                that._takeScreenShotCallback(screenshot);
            }
            that.camera.updateProjectionMatrix();
            if (that.controls) {
                that.controls.update();
            }
            extendsAnimationFrame();
        }

        function animate() {
            render();
            requestAnimationFrame(animate);
        }
        animate();
        //if you don't use an asteroid view,you need to initialize the controller after the asteroid view.
        clearInterval(that.timerList.toolBarAutoHideTimer);
        that.timerList.toolBarAutoHideTimer = setInterval(function () {
            if (!toolBar.isActive) {
                if (that.autoHideLeftTime < 0) {
                    toolBar.toolbar.style.display = "none";
                    that.autoHideLeftTime = that.defaultAutoHideLeftTime;
                    toolBar.isActive = false;
                } else {
                    that.autoHideLeftTime--;
                }
            }
            that.windowResize();
        }, 1000);

    };
    VR.prototype.takeScreenShot = function (callback) {
        this._takeScreenShot = true;
        this._takeScreenShotCallback = callback;
    };
    Object.defineProperty(VR.prototype, 'playPanorama', {
        get: function () {
            console.warn('playPanorama() no longer supports. Use play() instead.');
            return VR.prototype.play;

        }
    });
    VR.prototype.play = function (recUrl, resType, options) {
        var playCfg = Object.assign(this.playCfg, options);
        var ids = ['__mxrealitySkybox', "__mxrealitySlice", "__mxrealityDefault"];
        for (var i in ids) {
            var obj = this.VRObject.getObjectByName(ids[i]);
            obj && (obj.visible = false);
            this.cubeCameraSphere && (this.cubeCameraSphere.visible = false);
        }
        var that = this;
        var toolBar = that.toolBar;
        that._containerRadius = (that.resType.box == resType || that.resType.slice == resType) ? (that.vrbox.width / 2) : that.vrbox.radius;

        that.autoHideLeftTime = that.defaultAutoHideLeftTime;
        that.voiceHideLeftTime = that.defaultVoiceHideLeftTime;

        if (that.boxRenderFrame) {
            cancelAnimationFrame(that.boxRenderFrame);
        }

        if (that.resType.box == resType) {
            that.toolBar.timeInfo.style.display = "none";
            var textures = [];
            var materials = [];

            var imageObj = new Image();
            imageObj.crossOrigin = "Anonymous";
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
                    materials.push(new THREE.MeshBasicMaterial({
                        map: textures[i]
                    }));
                }
                var Box = that.VRObject.getObjectByName("__mxrealitySkybox");
                if (!Box) {
                    var Box = new THREE.Mesh(new THREE.CubeGeometry(that.vrbox.width, that.vrbox.height, that.vrbox.depth), new THREE.MultiMaterial(materials));
                    Box.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
                    Box.visible = true;
                    Box.name = "__mxrealitySkybox";
                    Box.matrixAutoUpdate = false;
                    Box.updateMatrix();
                    that.VRObject.add(Box);
                    toolBar.btn.addEventListener("click", function (e) {
                        that.controls.autoRotate ? that._pause() : that._play();
                        that.controls.autoRotate = !that.controls.autoRotate;
                    });
                } else {
                    Box.material = materials;
                }
                that.loadProgressManager.onLoad();
            };

        } else if (that.resType.slice == resType) {
            //cubeGeometry.scale(-1, 1, 1)
            that.toolBar.timeInfo.style.display = "none";
            var textureLoader = new THREE.TextureLoader(that.loadProgressManager);
            textureLoader.mapping = THREE.UVMapping;
            var materials = [];
            for (var i = 0; i < recUrl.length; i++) {
                var texture = textureLoader.load(recUrl[i]);
                materials.push(new THREE.MeshBasicMaterial({
                    map: texture
                }));
            }

            var cubeGeometry = new THREE.CubeGeometry(that.vrbox.width, that.vrbox.height, that.vrbox.depth, that.sliceSegment, that.sliceSegment, that.sliceSegment);
            var faceId = 0;
            var uv = [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)];

            for (var i = 0, l = cubeGeometry.faces.length; i < l; i += 2) {
                cubeGeometry.faces[i].materialIndex = faceId;
                cubeGeometry.faces[i + 1].materialIndex = faceId;
                cubeGeometry.faceVertexUvs[0][i] = [uv[3], uv[0], uv[2]];
                cubeGeometry.faceVertexUvs[0][i + 1] = [uv[0], uv[1], uv[2]];
                faceId++;
            }
            var obj = that.VRObject.getObjectByName("__mxrealitySlice");
            if (obj) {
                obj.material = materials;
                obj.geometry = cubeGeometry;
                obj.updateMatrix();
            } else {

                var cube = new THREE.Mesh(cubeGeometry, materials);
                cube.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
                cube.name = "__mxrealitySlice";
                cube.visible = true;
                cube.matrixAutoUpdate = false;
                cube.updateMatrix();
                that.VRObject.add(cube);
                that.cubeCamera = new THREE.CubeCamera(that._containerRadius, that.cameraPara.far, that.asteroidConfig.cubeResolution);
                var cubeCameraTexture = that.cubeCamera.renderTarget.texture;
                cubeCameraTexture.minFilter = THREE.LinearMipMapLinearFilter;

                that.VRObject.add(that.cubeCamera);
                material = new THREE.MeshBasicMaterial({
                    envMap: that.cubeCamera.renderTarget.texture,
                    side: THREE.BackSide
                });
                that.cubeCameraSphere = new THREE.Mesh(new THREE.SphereGeometry(that._containerRadius * that._cubeCameraTimes, 180, 180), material);
                that.cubeCameraSphere.position.set(0, 0, 0);
                that.cubeCameraSphere.name = "__mxrealitySlice";
                that.cubeCameraSphere.visible = true;
                that.cubeCameraSphere.matrixAutoUpdate = false;
                that.cubeCameraSphere.updateMatrix();
                that.VRObject.add(that.cubeCameraSphere);

                toolBar.btn.addEventListener("click", function (e) {
                    that.controls.autoRotate ? that._pause() : that._play();
                    that.controls.autoRotate = !that.controls.autoRotate;
                });
            }
            if (that.asteroidConfig.enable) {
                that.cubeCameraSphere.visible = true;
                that.asteroidForward = function (callback) {
                    that.cubeCamera.update(that.renderer, that.scene);
                    asteroidForward(callback);
                };
            } else {
                that.cubeCameraSphere.visible = false;
            }
        } else {
            var videoType = [that.resType.video, that.resType.sliceVideo, that.resType.flvVideo];
            if (videoType.indexOf(resType) >= 0) {
                var video = null;
                if (!that.video) {
                    video = that.video = AVR.createTag('video', {
                        'webkit-playsinline': true,
                        'playsinline': true,
                        'preload': 'auto',
                        'x-webkit-airplay': 'allow',
                        //'x5-playsinline': true,
                        'x5-video-player-type': 'h5',
                        'x5-video-player-fullscreen': true,
                        'x5-video-orientation': 'portrait',
                        'style': 'object-fit: fill',
                        'loop': "loop"
                    }, {
                        'allowsInlineMediaPlayback': true,
                        'crossOrigin': "Anonymous"
                    });

                } else {
                    video = that.video;
                    for (var node = 0; node < video.childNodes.length; node++) {
                        video.removeChild(video.childNodes[node]);
                    }
                }
                video.muted = playCfg.muted;
                if (playCfg.autoplay) {
                    video.setAttribute('autoplay', true);
                    video.play();
                } else {
                    video.removeAttribute('autoplay');
                }
                if (that.resType.sliceVideo == resType) {
                    function useHls() {
                        that.hlsPlayer = new Hls(that.hlsConfig);
                        that.hlsPlayer.loadSource(recUrl);
                        that.hlsPlayer.attachMedia(video);
                        that.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, function () {
                            video.play();
                        });
                    }

                    function useXMpegUrl() {
                        var source = AVR.createTag("source", {
                            src: recUrl,
                            type: 'application/x-mpegURL'
                        }, null);
                        video.appendChild(source);
                    }

                    function useVndAppleMpegUrl() {
                        video.src = recUrl;
                        video.addEventListener('loadedmetadata', function () {
                            //video.play();
                        });
                    }
                    if (that.liveSettings.usePlugin) {
                        that.liveSettings.loadPlugin(video);
                    } else if (that.liveSettings.forceUseHls) {
                        useHls();
                        console.info('force use hls')
                    } else if (that.liveSettings.forceUseVndAppleMpegUrl) {
                        useVndAppleMpegUrl();
                        console.info('force use application/vnd.apple.mpegurl')
                    } else if (that.liveSettings.forceUseXmpegUrl) {
                        useXMpegUrl();
                        console.info('force use application/x-mpegURL')
                    } else if (Hls.isSupported()) {
                        useHls();
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        useVndAppleMpegUrl();
                    } else if (video.canPlayType('application/x-mpegURL')) {
                        useXMpegUrl();
                    } else {
                        console.error('The browser does not support the current live stream,' + recUrl)
                    }
                } else if (that.resType.flvVideo == resType) {
                    if (!flvjs.isSupported()) {
                        console.error('Your browser does not support flvjs')
                        return;
                    }
                    if (that.flvPlayer) {
                        that.flvPlayer.destroy();
                    }
                    that.flvConfig.url = recUrl;
                    that.flvPlayer = flvjs.createPlayer(that.flvConfig);
                    that.flvPlayer.attachMediaElement(video);
                    that.flvPlayer.load();
                    that.flvPlayer.play();
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = recUrl;
                } else {
                    video.src = recUrl;
                }
                video.removeEventListener("canplaythrough", canplayThrough);
                toolBar.progressBar.removeEventListener("click", changeProgress);
                toolBar.btn.removeEventListener("click", btnPlay);
                video.addEventListener("canplaythrough", canplayThrough, false);
                toolBar.progressBar.addEventListener("click", changeProgress, false);
                toolBar.btn.addEventListener("click", btnPlay, false);
                video.load();

                function btnPlay(e) {
                    if (video.paused) {
                        that._play();
                        video.play();
                        that.videoPlayHook();
                    } else {
                        that._pause();
                        video.pause();
                        that.videoPauseHook();
                    }
                }

                function changeProgress(e) {
                    rect = AVR.getBoundingClientRect(that.container)
                    var x = (e.clientX || e.changedTouches[0].clientX) - rect.left;
                    video.currentTime = video.duration * (x / this.clientWidth);
                }
                that.video.buffTimer = null;

                function canplayThrough(e) {
                    if (!that.video.buffTimer) {
                        clearInterval(that.timerList.videoBuffTimer);
                        that.timerList.videoBuffTimer = that.video.buffTimer = setInterval(function (e) {
                            var allBuffered = 0;
                            if (video.buffered.length != 0) {
                                allBuffered += video.buffered.end(0);
                            }
                            if (allBuffered >= video.duration) {
                                clearInterval(that.video.buffTimer);
                            }
                            toolBar.loadedProgress.style.width = (allBuffered / video.duration) * 100 + "%";
                        }, 500);

                    }
                }
                if (playCfg.shape == that.shapeList.box) {
                    that.boxTexture(video);
                } else {
                    var texture = new THREE.VideoTexture(video);
                    texture.generateMipmaps = false;
                    texture.minFilter = THREE.NearestFilter;
                    texture.magFilter = THREE.NearestFilter;
                    //texture.format = THREE.RGBFormat;
                    texture.format = THREE.RGBAFormat;
                    buildTexture(texture);
                }

                clearInterval(that.timerList.videoProgressTimer);
                that.timerList.videoProgressTimer = that.video.progressTimer = setInterval(function (e) {
                    toolBar.playProgress.style.width = (video.currentTime / video.duration) * 100 + "%";
                    toolBar.curTime.innerText = AVR.formatSeconds(video.currentTime);
                    toolBar.totalTime.innerText = AVR.formatSeconds(video.duration);
                    if (that.autoHideLeftTime < 0 && !video.paused) {
                        toolBar.toolbar.style.display = "none";
                    } else {
                        that.autoHideLeftTime--;
                    }
                }, 1000);
                that.loadProgressManager.onLoad();
            } else {

                new THREE.TextureLoader(that.loadProgressManager).load(recUrl, function (texture) {
                    buildTexture(texture, true);
                });
            }

            function buildTexture(texture, isImg) {
                isImg = isImg || false;
                var material = new THREE.MeshBasicMaterial({
                    overdraw: true,
                    map: texture
                });
                var obj = that.VRObject.getObjectByName("__mxrealityDefault");
                if (obj) {
                    obj.material = material;
                    obj.visible = true;
                } else {

                    var phiStart = -Math.PI / 2;
                    var geometry = new THREE.SphereBufferGeometry(that.vrbox.radius, that.vrbox.widthSegments, that.vrbox.heightSegments, phiStart);
                    geometry.scale(-1, 1, 1); //x取反（面朝里）
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.visible = true;
                    mesh.name = "__mxrealityDefault";
                    if (isImg) {
                        mesh.matrixAutoUpdate = false;
                        mesh.updateMatrix();
                        that.toolBar.timeInfo.style.display = "none";
                    }
                    that.VRObject.add(mesh);
                }
                if (that.asteroidConfig.enable) {
                    that.asteroidForward = function (callback) {
                        asteroidForward(callback);
                    };
                }

            }
        }

        function asteroidForward(callback) {
            that.controls && (that.controls.reset(), that.controls.enable = false);
            var config = that.asteroidConfig;
            var defaultFov = that.camera.fov;
            var s = that._containerRadius * (that._cubeCameraTimes * 0.9);
            that.camera.position.y = s * config.asteroidTop;
            that.camera.rotation.x = THREE.Math.degToRad(-90);

            that.camera.fov = config.asteroidFov;

            var t = config.asteroidForwardTime * config.asteroidFPS / 300;
            var v = s / t;
            var sFov = that.camera.fov - defaultFov;
            var vFov = sFov / t;
            var vRo = Math.PI / 2 / t;
            var yDown = false,
                fovDone = false;
            var tmpTarget = new THREE.Vector3(that._controlTarget.x, that._controlTarget.y, that._controlTarget.z);

            setTimeout(function () {
                that.timerList.asteroidForwardTimer = asteroidForwardTimer = setInterval(function () {
                    if (config.asteroidTop * that.camera.position.y - v >= 0) {
                        that.camera.position.y -= (v * config.asteroidTop);
                        that.camera.lookAt(tmpTarget);
                        tmpTarget.z *= 1.25;
                    } else {
                        yDown = true;
                    }
                    if (that.camera.fov - vFov >= defaultFov) {
                        that.camera.fov -= vFov;
                    } else {
                        fovDone = true;
                    }
                    if (yDown && fovDone) {
                        clearInterval(asteroidForwardTimer);
                        that.controls.enable = true;
                        that.camera.position.y = 0;
                        that.camera.fov = defaultFov;

                        if (void 0 !== callback) {
                            callback();
                        }
                    }
                }, config.asteroidFPS);
            }, config.asteroidWaitTime);
        }

    };
    VR.prototype.boxTexture = function (video) {
        var that = this;
        that.toolBar.timeInfo.style.display = "block";
        var textures = [];
        var materials = [];

        var canvasArr = [], contextArr = [];
        for (var i = 0; i < 6; i++) {
            textures[i] = new THREE.Texture();
            canvasArr[i] = document.createElement('canvas');
            contextArr[i] = canvasArr[i].getContext('2d');
        }
        function render() {
            that.boxRenderFrame = requestAnimationFrame(render);
            if (!video.videoWidth) {
                return;
            }
            var vH = video.videoHeight;
            var vW = video.videoWidth;
            var faceW = vW / 3;
            var faceH = vH / 2;
            for (var i = 0; i < 6; i++) {
                canvasArr[i].height = faceH;
                canvasArr[i].width = faceW;
            }

            /** 渲染顺序
            -----------------------------
            | 左 | 右 | 上 | 下 | 后 | 前 |
            -----------------------------
            */
            /** 视频纹理布局
             -————-————-————--
             ｜ 右 ｜ 左 ｜ 上 ｜    
             —————-————-————--         
             ｜ 下 ｜ 前 ｜ 后 ｜
             —————-————-————--
             */

            // 左
            contextArr[0].drawImage(video, faceW * 1, 0 * faceH, faceW, faceH, 0, 0, faceW, faceH);
            textures[0].image = canvasArr[0];
            textures[0].needsUpdate = true;
            materials.push(new THREE.MeshBasicMaterial({
                map: textures[0]
            }));
            // 右
            contextArr[1].drawImage(video, faceW * 0, 0 * faceH, faceW, faceH, 0, 0, faceW, faceH);
            textures[1].image = canvasArr[1];
            textures[1].needsUpdate = true;
            materials.push(new THREE.MeshBasicMaterial({
                map: textures[1]
            }));
            // 上
            contextArr[2].drawImage(video, faceW * 2, 0 * faceH, faceW, faceH, 0, 0, faceW, faceH);
            textures[2].image = canvasArr[2];
            textures[2].needsUpdate = true;
            textures[2].rotation = -Math.PI;
            textures[2].center = new THREE.Vector2(0.5, 0.5);
            materials.push(new THREE.MeshBasicMaterial({
                map: textures[2]
            }));
            // 下
            contextArr[3].drawImage(video, faceW * 0, 1 * faceH, faceW, faceH, 0, 0, faceW, faceH);
            textures[3].image = canvasArr[3];
            textures[3].needsUpdate = true;
            textures[3].rotation = -Math.PI;
            textures[3].center = new THREE.Vector2(0.5, 0.5);

            materials.push(new THREE.MeshBasicMaterial({
                map: textures[3]
            }));
            // 后
            contextArr[4].drawImage(video, faceW * 2, 1 * faceH, faceW, faceH, 0, 0, faceW, faceH);
            textures[4].image = canvasArr[4];
            textures[4].needsUpdate = true;
            materials.push(new THREE.MeshBasicMaterial({
                map: textures[4]
            }));
            // 前
            contextArr[5].drawImage(video, faceW * 1, 1 * faceH, faceW, faceH, 0, 0, faceW, faceH);
            textures[5].image = canvasArr[5];
            textures[5].needsUpdate = true;
            materials.push(new THREE.MeshBasicMaterial({
                map: textures[5]
            }));


            var Box = that.VRObject.getObjectByName("__mxrealitySkybox");
            if (!Box) {
                Box = new THREE.Mesh(new THREE.CubeGeometry(that.vrbox.width, that.vrbox.height, that.vrbox.depth), new THREE.MultiMaterial(materials));
                Box.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
                Box.visible = true;
                Box.name = "__mxrealitySkybox";
                Box.matrixAutoUpdate = false;
                Box.updateMatrix();
                that.VRObject.add(Box);
            } else {
                Box.material = materials;
            }
            materials = [];
        }
        render();
    }
    VR.prototype.sphere2BoxPano = function (img, w, h, callback) {
        var that = this;
        var fases = {
            'x': 'x',
            'nx': 'nx',
            'ny': 'ny',
            'y': 'y',
            'z': 'z',
            'nz': 'nz'
        };
        var canvasArr = [],
            finishNum = 0;
        var i = 0;
        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.src = img;
        image.onload = function () {
            for (var id in fases) {
                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.id = "face_" + id;
                canvasArr[i] = canvas;
                var gl = canvas.getContext('webgl', {
                    preserveDrawingBuffer: true
                }); //获取canvas上下文
                var shaderPorgram = initShaders(gl, id); //初始化着色器程序

                var num = initVertexBuffers(gl, shaderPorgram);
                var PI = gl.getUniformLocation(shaderPorgram, 'PI');
                gl.uniform1f(PI, Math.PI);

                gl.clearColor(0.0, 0.0, 0.0, 1.0);

                // Set texture
                if (!initTextures(gl, shaderPorgram, num, image)) {
                    console.log('Failed to intialize the texture.');
                    //return;
                }
                i++;
            }
        }

        //初始化纹理
        function initTextures(gl, shaderPorgram, n, image) {
            var texture = gl.createTexture(); //创建纹理对象

            if (!texture) {
                console.log('Failed to create the texture object!');
                return false;
            }

            var u_Sampler = gl.getUniformLocation(shaderPorgram, 'u_Sampler');

            loadTextures(gl, n, texture, u_Sampler, image);
            return true;
        }

        //加载纹理图片
        function loadTextures(gl, n, texture, u_Sampler, image) {
            if (that.asteroidConfig.enable) {
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, -1); //对纹理图像进行y轴反转
            }
            gl.activeTexture(gl.TEXTURE0); //激活纹理单元
            gl.bindTexture(gl.TEXTURE_2D, texture); //绑定纹理对象

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //配置纹理对象的参数

            /**
             * RENDER WARNING: texture bound to texture unit 0 is not renderable. It maybe non-power-of-2 and have incompatible texture filtering.
             * 大致意思是纹理没有渲染成功，因为所使用的图片的分辨率不是2的幂数，2的幂数是指2*2、4*4、8*8、16*16...256*256...；
             * 需要设置图形纹理参数时设置水平垂直拉伸。
             */
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); //将纹理图像分配给纹理对象

            gl.uniform1i(u_Sampler, 0); //将0号纹理传给着色器中的取样器变量

            gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
            if (finishNum < 5) {
                finishNum++;
            } else {
                callback(getNewPano());
            }
            //gl.drawArrays(gl.TRIANGLE_STRIP, 1, n); // Draw the rectangle
        }

        //初始化顶点位置
        function initVertexBuffers(gl, shaderPorgram) {
            //顶点坐标和纹理坐标映射关系
            var datas = new Float32Array([
                //顶点坐标、纹理坐标
                -1.0, 1.0, 0.0, 1.0,
                -1.0, -1.0, 0.0, 0.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, -1.0, 1.0, 0.0,
            ]);

            var num = 4; //顶点数目
            var vertexBuffer = gl.createBuffer(); //创建缓冲区对象

            if (!vertexBuffer) {
                console.log('Failed to create the buffer object!');
                return -1;
            }

            //将缓冲区对象绑定到目标并写入数据
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, datas, gl.STATIC_DRAW);

            var size = datas.BYTES_PER_ELEMENT; //数组中的每个元素的大小（以字节为单位）

            //顶点着色器接受顶点坐标和纹理坐标映射关系
            var a_Position = gl.getAttribLocation(shaderPorgram, 'a_Position');
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, size * 4, 0);
            gl.enableVertexAttribArray(a_Position);

            var a_TexCoord = gl.getAttribLocation(shaderPorgram, 'a_TexCoord');
            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, size * 4, size * 2);
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
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
            shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
            //gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
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
                console.log(gl.getShaderInfoLog(shader)); //打印编译失败信息
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
            var c = document.createElement('canvas'),
                ctx = c.getContext('2d');
            c.width = w * 6;
            c.height = h;

            var tmp = document.createElement('canvas'),
                tmpctx = tmp.getContext('2d');
            tmp.width = w;
            tmp.height = h;
            var degree = 180 * Math.PI / 180;
            tmpctx.rotate(degree);
            if (that.sliceSegment) {
                var sliceArray = [];
                var canvasCell = document.createElement("canvas");
                canvasCell.width = h / that.sliceSegment;
                canvasCell.height = h / that.sliceSegment;
                var canvasCtx = canvasCell.getContext("2d");
                for (var idx in canvasArr) {
                    tmpctx.drawImage(canvasArr[idx], 0, 0, -w, -h);
                    for (var row = 0; row < that.sliceSegment; row++) {
                        for (var col = 0; col < that.sliceSegment; col++) {
                            canvasCtx.putImageData(tmpctx.getImageData(col * (h / that.sliceSegment), row * (h / that.sliceSegment), h * (col + 1) / that.sliceSegment, h * (row + 1) / that.sliceSegment), 0, 0);
                            sliceArray.push(canvasCell.toDataURL("image/jpeg"));
                        }
                    }
                }
                return sliceArray;
            } else {
                for (var idx in canvasArr) {
                    tmpctx.drawImage(canvasArr[idx], 0, 0, -w, -h);
                    ctx.drawImage(tmp, w * idx, 0, w, h);
                }
                return c.toDataURL("image/jpeg");
            }
        };

    }

    var AR = function (scene, renderer, container, cameraPara, cameraPosition) {
        var that = this;
        this.scene = scene;
        this.renderer = renderer;
        this.container = container;
        AVR.setCameraPara(that, cameraPara, cameraPosition);
        this.constraints = {};
        this.video = null;
        this.openAudio = false;

        this.cameraIndex = 1; //0为前置摄像头，否则为后置

        this._controlTarget = new THREE.Vector3(0.0001, 0, 0);
        this.camera = new THREE.PerspectiveCamera(this.cameraPara.fov, this.cameraPara.aspect, this.cameraPara.near, this.cameraPara.far);
        this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);

        this.cameraReady = false;
        this.scene.add(this.camera);
        this.clock = new THREE.Clock();
        this.tempCanvas = document.createElement('canvas');
        this.effect = AVR.stereoEffect(this.renderer);
        this._takeScreenShot = false;
    }
    AR.prototype.init = function () {
        var self = this;
        AVR.bindOrientationEvent(self, self._controlTarget);
        this.video = AVR.createTag('video', {
            'webkit-playsinline': true,
            'playsinline': true,
            'preload': 'auto',
            'x-webkit-airplay': 'allow',
            'x5-playsinline': true,
            'x5-video-player-type': 'h5',
            'x5-video-player-fullscreen': true,
            'x5-video-orientation': 'portrait',
            'style': 'object-fit: fill',
            'autoplay': "autoplay"
        }, {
            'allowsInlineMediaPlayback': true
        });

        //this.video.style.display = "none";
        this.video.style.zIndex = "-99999";
        this.video.style.position = "absolute";
        this.video.style.left = "0px";
        this.video.style.top = "0px";
        this.video.style.width = "2px";
        this.video.style.height = "2px";
        document.body.appendChild(this.video);
        this.video.oncanplaythrough = function () {
            self.cameraReady = true;
            if (self.video.readyState === self.video.HAVE_ENOUGH_DATA) {
                self.cameraTexture = new THREE.VideoTexture(self.video);
                self.cameraTexture.generateMipmaps = false;
                self.cameraTexture.format = THREE.RGBAFormat;
                self.cameraTexture.maxFilter = THREE.NearestFilter;
                self.cameraTexture.minFilter = THREE.NearestFilter;
                self.scene.background = self.cameraTexture; // 背景视频纹理
                self.cameraTexture.needsUpdate = true;
            }
        }

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

        if (navigator.getUserMedia) {
            var medias = {
                audio: self.openAudio,
                video: {
                    facingMode: {
                        exact: self.cameraIndex ? "environment" : "user"
                    }
                }
            }
            navigator.getUserMedia(medias, successCallback, errorCallback);
        } else {
            alert('Native device meadia streaming(getUserMdeia) not supported in this browser.')
        }

        function successCallback(stream) {
            self.video.srcObject = stream;
        };

        function errorCallback(err) {
            alert(err);
        };
    }
    AR.prototype.takeCameraPhoto = function () {
        var ctx = this.tempCanvas.getContext('2d');
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.drawImage(this.video, 0, 0, window.innerWidth, window.innerHeight); //将video对象内指定的区域捕捉绘制到画布上指定的区域，实现拍照。
        return ctx.toDataURL("image/jpeg");
    }
    AR.prototype.takeScreenShot = function (callback) {
        this._takeScreenShot = true;
        this._takeScreenShotCallback = callback;
    }
    AR.prototype.play = function () {
        var that = this;

        function render() {
            if (that._takeScreenShot) {
                that._takeScreenShot = false;
                var screenshot = that.renderer.domElement.toDataURL("image/jpeg");
                that._takeScreenShotCallback(screenshot);
            }
            if (that.cameraReady) {
                var width = window.innerWidth;
                var height = window.innerHeight;
                that.camera.aspect = width / height;
                that.cameraTexture.repeat.y = height / that.video.videoHeight;
                that.cameraTexture.offset.x = 0;
                that.cameraTexture.offset.y = 0;
                if ((AVR.isMobileDevice() && AVR.isCrossScreen())) {
                    that.cameraTexture.repeat.x = width / (2 * that.video.videoWidth);
                    that.effect.setSize(width, height);
                    that.effect.render(that.scene, that.camera);
                } else {
                    that.cameraTexture.repeat.x = width / that.video.videoWidth;
                    that.renderer.setSize(width, height);
                    that.renderer.setClearColor(new THREE.Color(0xffffff));
                    that.renderer.render(that.scene, that.camera);
                }
                that.camera.updateProjectionMatrix();
            }
            if (that.controls) {
                that.controls.update(that.clock.getDelta());
            }

        }

        function animate() {
            requestAnimationFrame(animate);
            render();
        }
        animate();

    }

    var AVR = {
        debug: false,
        enableVrMode: true,
        playerIcon: {
            playSvg: '<svg t="1596623860726" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="32635" width="32" height="32"><path fill="#ffffff" d="M744.727273 551.563636L325.818182 795.927273c-30.254545 18.618182-69.818182-4.654545-69.818182-39.563637v-488.727272c0-34.909091 39.563636-58.181818 69.818182-39.563637l418.909091 244.363637c30.254545 16.290909 30.254545 62.836364 0 79.127272z" p-id="32636"></path></svg>',
            pauseSvg: '<svg t="1596624663266" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="32779" width="32" height="32"><path fill="#ffffff" d="M442.181818 709.818182c0 37.236364-30.254545 69.818182-69.818182 69.818182s-69.818182-30.254545-69.818181-69.818182v-395.636364c0-37.236364 30.254545-69.818182 69.818181-69.818182s69.818182 30.254545 69.818182 69.818182v395.636364z m279.272727 0c0 37.236364-30.254545 69.818182-69.818181 69.818182s-69.818182-30.254545-69.818182-69.818182v-395.636364c0-37.236364 30.254545-69.818182 69.818182-69.818182s69.818182 30.254545 69.818181 69.818182v395.636364z" p-id="32780"></path></svg>',
            resetLookAtSvg: '<svg t="1596624710564" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="32923" width="22" height="22"><path fill="#ffffff" d="M512 512m-163.2 0a163.2 163.2 0 1 0 326.4 0 163.2 163.2 0 1 0-326.4 0Z" fill="#333333" p-id="32924"></path><path fill="#ffffff" d="M512 153.6A358.4 358.4 0 1 1 153.6 512 358.4 358.4 0 0 1 512 153.6M512 64a448 448 0 1 0 448 448A448 448 0 0 0 512 64z" fill="#333333" p-id="32925"></path></svg>',
            gyroSvg: '<svg t="1596624744888" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="33068" width="26" height="26"><path d="M506.148571 516.754286m-384.365714 0a384.365714 384.365714 0 1 0 768.731429 0 384.365714 384.365714 0 1 0-768.731429 0Z" fill="#FFFFFF" p-id="33069"></path><path d="M890.697143 597.942857c0 167.497143-172.068571 303.36-384 303.36s-384-135.862857-384-303.36z" fill="#EAEAEA" p-id="33070"></path><path d="M506.148571 928.731429a411.977143 411.977143 0 1 1 411.977143-411.977143 412.16 412.16 0 0 1-411.977143 411.977143z m0-768a357.12 357.12 0 1 0 357.12 356.022857A357.485714 357.485714 0 0 0 506.148571 159.817143z" fill="#808080" p-id="33071"></path><path d="M418.925714 697.782857A97.828571 97.828571 0 0 1 347.428571 671.085714c-52.48-52.662857-25.051429-162.56 62.537143-250.148571s197.485714-115.2 250.148572-62.537143c52.662857 52.662857 25.234286 162.56-62.354286 250.148571-57.417143 57.6-124.525714 89.234286-178.834286 89.234286z m170.24-310.857143c-36.571429 0-91.428571 24.502857-140.251428 73.142857-67.291429 67.291429-88.502857 146.285714-62.354286 172.617143s105.325714 4.754286 172.617143-62.537143 88.32-146.285714 62.354286-172.617142a44.982857 44.982857 0 0 0-32.365715-11.154286z" fill="#808080" p-id="33072"></path><path d="M682.788571 722.468571a27.245714 27.245714 0 0 1-19.382857-8.045714l-167.314285-167.314286a27.428571 27.428571 0 1 1 38.765714-38.765714L702.171429 676.571429a27.611429 27.611429 0 0 1 0 38.765714 27.977143 27.977143 0 0 1-19.382858 7.131428zM416.731429 457.142857a26.88 26.88 0 0 1-19.382858-8.045714L310.857143 361.325714a27.245714 27.245714 0 0 1 0-38.765714 27.611429 27.611429 0 0 1 38.765714 0l87.04 87.04a27.245714 27.245714 0 0 1 0 38.765714 26.514286 26.514286 0 0 1-19.931428 8.777143z" fill="#808080" p-id="33073"></path></svg>',
            vrSvg: '<svg t="1596624776691" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="33216" width="28" height="28"><path d="M932.224 283.392c-4.352-0.896-8.832-1.408-13.44-1.408H159.488c-38.912 0-70.4 35.072-70.4 78.208v369.92c0 2.688 0.128 5.376 0.384 7.936 3.584 39.424 33.536 70.272 70.016 70.272h759.296c38.912 0 70.4-35.072 70.4-78.208v-369.92c0.128-38.016-24.448-69.76-56.96-76.8z m-417.408 20.224h150.144c43.008 0 72.96 6.144 89.856 18.432 11.648 8.192 20.608 19.072 27.008 32.512 6.272 13.44 9.472 28.288 9.472 44.288 0 32.384-7.424 57.472-22.144 75.264-9.216 10.624-21.376 18.56-36.352 24.064 12.032 4.736 20.992 9.856 27.136 15.104 6.144 5.248 11.648 13.056 16.64 23.296 3.712 8.192 6.4 16 8.064 23.552 1.664 7.552 2.944 18.56 3.968 33.28 1.792 24.576 4.352 41.856 7.424 51.712h-73.216c-2.176-7.808-4.48-24.064-6.912-48.64-1.536-19.84-4.736-34.944-9.472-45.568s-11.904-18.944-21.376-25.088c-12.032-7.168-29.312-10.624-51.968-10.24h-52.48V645.12h-65.408V303.616z m-287.872 0l90.24 256.896 91.648-256.896H482.56L348.16 644.992h-65.408L153.344 303.616h73.6z m477.568 143.36c9.856-7.552 14.72-20.608 14.72-39.424 0-20.864-7.424-34.048-22.144-39.936-5.248-2.048-13.696-3.072-25.344-3.072h-91.648v90.112h91.648c15.488 0 26.368-2.56 32.768-7.68z" fill="#cccccc" p-id="33217"></path><path d="M932.224 283.392c-3.584-39.424-33.536-70.272-70.016-70.272H102.912c-38.912 0-70.4 35.072-70.4 78.208v369.92c0 38.144 24.576 69.888 56.96 76.8 4.352 0.896 8.832 1.408 13.44 1.408h759.296c38.912 0 70.4-35.072 70.4-78.208v-369.92c0-2.56-0.128-5.248-0.384-7.936zM348.16 644.992h-65.408L153.344 303.616h73.728l90.24 256.896 91.648-256.896H482.56L348.16 644.992z m374.4 0c-2.176-7.808-4.48-24.064-6.912-48.64-1.536-19.84-4.736-34.944-9.472-45.568s-11.904-18.944-21.376-25.088c-12.032-7.168-29.312-10.624-51.968-10.24h-52.48v129.536h-65.408V303.616h150.144c43.008 0 72.96 6.144 89.856 18.432 11.648 8.192 20.608 19.072 27.008 32.512 6.272 13.44 9.472 28.288 9.472 44.288 0 32.384-7.424 57.472-22.144 75.264-9.216 10.624-21.376 18.56-36.352 24.064 12.032 4.736 20.992 9.856 27.136 15.104 6.144 5.248 11.648 13.056 16.64 23.296 3.712 8.192 6.4 16 8.064 23.552 1.664 7.552 2.944 18.56 3.968 33.28 1.792 24.576 4.352 41.856 7.424 51.712h-73.6z" fill="#ffffff" p-id="33218"></path><path d="M719.36 407.552c0 18.816-4.864 31.872-14.72 39.424-6.4 5.12-17.408 7.68-32.64 7.68h-91.648v-90.112H672c11.648 0 20.096 1.024 25.344 3.072 14.592 5.888 22.016 19.072 22.016 39.936z" fill="#ffffff" p-id="33219"></path></svg>',
            audioPlaySvg: '<svg t="1596624803551" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="33362" width="24" height="24"><path d="M491.857752 129.427768L245.206166 319.922357v4.37361h-90.428545c-49.776683 0-90.49199 38.923498-90.491991 86.594217v216.422098c0 47.733141 40.715307 86.594217 90.491991 86.594217h90.428545v4.373611l246.651586 192.617949c6.980995 6.404873 15.566534 10.887978 24.888854 12.994966 24.824385 6.560416 45.182039-6.497994 45.182038-30.302144V146.734946c0-8.622378-2.233877-17.243733-6.764054-21.617344-13.529131-17.306154-42.949184-15.182794-63.306838 4.310166zM767.738034 200.902636c-16.20303-8.231475-36.153408-2.50096-45.246507 12.994965-9.0624 15.181771-2.297322 34.549887 13.592576 43.297109 92.725868 49.731658 153.798828 151.507646 153.798828 261.906012S828.809971 731.274052 736.084103 781.069155c-15.889899 8.622378-22.654976 28.115338-13.592576 43.234687 6.106068 10.345626 17.222243 16.885576 29.420053 17.306154v0.062422a43.382043 43.382043 0 0 0 15.826454-4.373611c117.614721-62.727647 189.982936-183.996594 189.982935-318.198085s-72.368214-255.470439-189.982935-318.198086z" p-id="33363"></path><path d="M822.351885 517.591345c0-101.966323-60.489676-189.33109-146.55075-213.646891-18.563798-4.825912-37.190017 7.30129-41.862433 26.728758-4.799306 18.922978 6.479575 38.189787 25.572421 43.681871 55.879682 16.953114 95.343485 75.237565 95.343486 145.649218 0 70.349231-39.46278 131.046638-95.343486 145.586796-19.092847 5.493108-30.371728 24.758893-25.572421 43.681872 2.336208 17.015535 16.290011 26.728758 32.581046 26.728758v0.061398c2.336208 0 6.945179 0 9.344832-4.825912 85.998653-21.839401 146.487306-111.678522 146.487305-213.645868z" p-id="33364"></path></svg>',
            audioPauseSvg: '<svg t="1596624838920" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="33507" width="24" height="24"><path d="M225.680461 326.598406c-0.419556-0.019443-0.818645-0.019443-1.237177-0.019443L101.812315 326.578963c-22.753213 0-40.876989 18.24248-40.876989 40.777729l0 286.336424c0 22.534226 18.302855 40.777729 40.876989 40.777729l122.629945 0c0.079818 0 0.119727 0 0.198521 0l0 0.157589 300.289204 194.444551c7.125281 6.108115 16.405645 9.781784 26.526143 9.781784 22.573111 0 40.874943-18.301831 40.874943-40.878013 0-1.87572-0.119727-3.711532-0.360204-5.509481L591.970868 168.58151c0.239454-1.795902 0.360204-3.632737 0.360204-5.509481 0-22.574135-18.302855-40.876989-40.874943-40.876989-9.301853 0-17.884322 3.113921-24.750707 8.343015L225.680461 326.598406zM859.567485 510.524392l91.952248-91.951225c11.495822-11.517311 11.576663-30.558993-0.13917-42.274826-11.795651-11.795651-30.636764-11.755742-42.273802-0.140193l-91.953272 91.953272-91.950202-91.953272c-11.639085-11.616572-30.479175-11.655458-42.275849 0.140193-11.715833 11.715833-11.633968 30.757514-0.13917 42.274826l91.952248 91.951225-91.952248 91.953272c-11.494799 11.515265-11.576663 30.556946 0.13917 42.272779 11.796674 11.796674 30.636764 11.756765 42.275849 0.140193l91.950202-91.951225 91.953272 91.951225c11.636015 11.617595 30.477129 11.657504 42.273802-0.140193 11.715833-11.714809 11.634991-30.757514 0.13917-42.272779L859.567485 510.524392z" p-id="33508"></path></svg>',
        },
        startGyro: function (callback) {
            window.addEventListener("deviceorientation", orientationHandler, false);

            function orientationHandler(event) {
                callback(event);
            }
        },
        stereoEffect: function (renderer) {

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
                _innerFactor = (_halfFocalWidth + this.separation / 2.0) / (_halfFocalWidth * 2.0);
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
        orbitControls: function (object, domElement) {
            var controls = function (object, domElement) {

                this.domElement = (void 0 !== domElement) ? domElement : document;
                this.object = object;
                this.object.rotation.reorder('YXZ');

                this.enable = !0;

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
                this.enableDamping = !1;
                this.dampingFactor = 0.05;

                this.rotateSpeed = 0.25;

                // Set to true to automatically rotate around the target
                // If auto-rotate is enabled, you must call controls.update() in your animation loop
                this.autoRotate = !1;
                this.autoRotateSpeed = 1.0; // 30 seconds per round when fps is 60

                this.deviceOrientation = {};
                this.screenOrientation = 0;

                var scope = this;

                scope.defaultDirectionOfRotation = !0;
                scope.gyroEnable = !1;
                scope.usingGyro = AVR.OS.isMobile() ? !0 : !1;
                scope._defaultTargetY = scope.target.y;
                scope._defaultCameraFov = scope.object.fov;
                scope._defaultCameraY = scope.object.position.y;
                var changeEvent = {
                    type: 'change'
                };
                var startEvent = {
                    type: 'start'
                };
                var endEvent = {
                    type: 'end'
                };

                var EPS = 0.000001;

                var isFirst = true;
                // current position in spherical coordinates
                var spherical = new THREE.Spherical();
                var sphericalDelta = new THREE.Spherical();

                var rotateStart = new THREE.Vector2();
                var rotateEnd = new THREE.Vector2();
                var rotateDelta = new THREE.Vector2();
                var rotateOffsetDelta = new THREE.Vector3(0, 0, 0);

                var lastGamma = 0,
                    lastBeta = 0;

                var tempAlpha = 0,
                    tempBeta = 0,
                    tempGamma = 0;

                this.target0 = this.target.clone();
                this.position0 = this.object.position.clone();
                this.rotation0 = this.object.rotation.clone();
                this.zoom0 = this.object.zoom;
                //
                // public methods
                //
                this.arrowLeft = 37;
                this.arrowUp = 38;
                this.arrowRight = 39;
                this.arrowDown = 40;
                this.arrowSpeed = 0.05;


                this.getPolarAngle = function () {

                    return spherical.phi;

                };

                this.getAzimuthalAngle = function () {

                    return spherical.theta;

                };

                this.saveState = function () {

                    scope.target0.copy(scope.target);
                    scope.position0.copy(scope.object.position);
                    scope.rotation0.copy(scope.object.rotation);
                    scope.zoom0 = scope.object.zoom;

                };

                this.reset = function (config) {

                    this.resetVar();
                    scope.dispatchEvent(changeEvent);
                    (config && config.target0) ? scope.target.copy(config.target0) : scope.target.copy(scope.target0);
                    (config && config.position0) ? scope.object.position.copy(config.position0) : scope.object.position.copy(scope.position0);
                    (config && config.rotation0) ? scope.object.rotation.copy(config.rotation0) : scope.object.rotation.copy(scope.rotation0);
                    (config && config.zoom0) ? (scope.zoom = zoom0) : scope.zoom0;

                };
                this.resetVar = function () {
                    tempAlpha = 0;
                    tempBeta = 0;
                    tempGamma = 0;
                    lastGamma = 0;
                    lastBeta = 0;
                }
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

                    return function update(param) {
                        if (!scope.enable) {
                            return;
                        }
                        param = param || {};

                        var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad(void 0 === scope.beginAlpha ? scope.deviceOrientation.alpha : scope.deviceOrientation.alpha - scope.beginAlpha) : 0; // Z
                        var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad(scope.deviceOrientation.beta) : 0; // X'
                        var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad(scope.deviceOrientation.gamma) : 0; // Y''
                        var orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0; // O
                        if (scope.gyroEnable) {
                            tempAlpha = alpha, tempBeta = beta, tempGamma = gamma;
                        } else {
                            alpha = tempAlpha, beta = tempBeta, gamma = tempGamma;
                        }

                        var currentQ = new THREE.Quaternion().copy(scope.object.quaternion);

                        setObjectQuaternion(currentQ, alpha, beta, gamma, orient);

                        var currentAngle = Quat2Angle(currentQ.x, currentQ.y, currentQ.z, currentQ.w);
                        if (!param.init) {
                            // currentAngle.z = Left-right
                            // currentAngle.y = Up-down
                            rotateLeft((lastGamma - currentAngle.z));
                            //rotateUp((lastBeta - currentAngle.y));
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
                        if (scope.deviceOrientation && scope.gyroEnable) {
                            setObjectQuaternion(scope.object.quaternion, alpha + Math.PI + rotateOffsetDelta.x, beta + rotateOffsetDelta.y, gamma + rotateOffsetDelta.z, orient);
                            //return true;
                        } else {
                            scope.object.lookAt(scope.target);
                        }
                        if (scope.enableDamping && !scope.gyroEnable) {
                            sphericalDelta.theta *= (1 - scope.dampingFactor);
                            sphericalDelta.phi *= (1 - scope.dampingFactor);
                        } else {
                            sphericalDelta.set(0, 0, 0);
                        }

                        // update condition is:
                        // min(camera displacement, camera rotation in radians)^2 > EPS
                        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                        if (lastPosition.distanceToSquared(scope.object.position) > EPS ||
                            8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

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
                    var euler = new THREE.Vector3(pitch, roll, yaw);
                    return euler;
                }

                function calcDeltaLeft(x, clientWidth) {
                    return 2 * Math.PI * x / clientWidth * scope.rotateSpeed
                }

                function calcDeltaUp(y, clientHeight) {
                    return 2 * Math.PI * y / clientHeight * scope.rotateSpeed
                }
                var mouseDown = false;

                function mousedown(e) {
                    mouseDown = true;
                    var x = e.clientX || e.changedTouches[0].clientX;
                    var y = e.clientY || e.changedTouches[0].clientY;
                    rotateStart.set(x, y);
                }

                function mousemove(e) {

                    var x = e.clientX || e.changedTouches[0].clientX;
                    var y = e.clientY || e.changedTouches[0].clientY;
                    rotateEnd.set(x, y);
                    rotateDelta.subVectors(rotateEnd, rotateStart);

                    // rotating across whole screen goes 360 degrees around
                    var clientWidth = (void 0 !== scope.domElement.clientWidth) ? scope.domElement.clientWidth : window.innerWidth;
                    rotateLeft(calcDeltaLeft(rotateDelta.x, clientWidth));

                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    var clientHeight = (void 0 !== scope.domElement.clientHeight) ? scope.domElement.clientHeight : window.innerHeight;
                    rotateUp(calcDeltaUp(rotateDelta.y, clientHeight));

                    rotateStart.copy(rotateEnd);
                }

                function mouseup(event) {
                    mouseDown = !1;
                }

                function touchstart(event) {
                    //console.log( 'handleTouchStartRotate' );
                    mouseDown = !0;
                    rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                    scope.usingGyro = !1;
                }

                function touchmove(event) {
                    //console.log( 'handleTouchMoveRotate' );

                    event.preventDefault();

                    rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                    rotateDelta.subVectors(rotateEnd, rotateStart);

                    // rotating across whole screen goes 360 degrees around
                    var clientWidth = (void 0 != scope.domElement.clientWidth) ? scope.domElement.clientWidth : window.innerWidth;
                    rotateLeft(calcDeltaLeft(rotateDelta.x, clientWidth));

                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    var clientHeight = (void 0 !== scope.domElement.clientHeight) ? scope.domElement.clientHeight : window.innerHeight;
                    rotateUp(calcDeltaUp(rotateDelta.y, clientHeight));

                    rotateStart.copy(rotateEnd);
                    rotateOffsetDelta.x += calcDeltaLeft(rotateDelta.x, clientWidth) + calcDeltaUp(rotateDelta.y, clientHeight);
                    scope.usingGyro = !1;
                }

                function touchend(event) {
                    //console.log( 'handleTouchEnd' );
                    scope.usingGyro = AVR.OS.isMobile() ? !0 : !1;
                    mouseDown = false;
                }

                function deviceorientation(event) {
                    scope.deviceOrientation = event;
                    void 0 === scope.beginAlpha && (scope.beginAlpha = scope.deviceOrientation.alpha);
                }

                function orientationchange(event) {
                    scope.screenOrientation = window.orientation || 0;
                }

                var devices = null;
                if (typeof DeviceMotionEvent !== 'undefined') {
                    devices = DeviceMotionEvent;
                }
                if (typeof DeviceOrientationEvent !== 'undefined') {
                    devices = DeviceOrientationEvent;
                }
                window.addEventListener('orientationchange', orientationchange, false);
                window.addEventListener('deviceorientation', deviceorientation, false);
                if (devices && typeof devices.requestPermission === 'function') {
                    window.addEventListener('click', function () {
                        devices.requestPermission()
                            .then(function (permissionState) {
                                if (permissionState === 'granted') {
                                    window.addEventListener('devicemotion', orientationchange, false);
                                    window.addEventListener('deviceorientation', deviceorientation, false);
                                }
                            })
                            .catch(function (err) {
                                AVR.msgBox(err, 3, document.body);
                            })
                    })

                } else {
                    // handle regular non iOS 13+ devices
                }
                this.gyroFreeze = function () {
                    scope.gyroEnable = false;
                };
                this.gyroUnfreeze = function () {
                    scope.gyroEnable = true;
                };
                this.rotationLeft = rotateLeft;
                this.rotationUp = rotateUp;

                var _up = 0;
                var _left = 0;
                document.addEventListener('keydown', function (event) {
                    var e = event || window.event || arguments.callee.caller.arguments[0];
                    if (!e) {
                        return;
                    }
                    if (e.keyCode == scope.arrowLeft) { // 按左箭头 
                        _left = 1
                    }
                    if (e.keyCode == scope.arrowRight) {
                        _left = -1;
                    }
                    if (e.keyCode == scope.arrowUp) {
                        _up = 1;
                    }
                    if (e.keyCode == scope.arrowDown) {
                        _up = -1;
                    }
                    rotateLeft(_left * scope.arrowSpeed);
                    rotateUp(_up * scope.arrowSpeed);
                })
                document.addEventListener('keyup', function (event) {
                    var e = event || window.event || arguments.callee.caller.arguments[0];
                    if (!e) {
                        return;
                    }
                    if (e.keyCode == scope.arrowLeft) { // 按左箭头 
                        _left = 0
                    }
                    if (e.keyCode == scope.arrowRight) {
                        _left = 0;
                    }
                    if (e.keyCode == scope.arrowUp) {
                        _up = 0;
                    }
                    if (e.keyCode == scope.arrowDown) {
                        _up = 0;
                    }
                })

                this.domElement.addEventListener("mousedown", mousedown, false);
                this.domElement.addEventListener('mousemove', function (e) {
                    if (scope.enable && mouseDown) {
                        mousemove(e);
                    }
                }, false);
                this.domElement.addEventListener("mouseup", mouseup, false);
                this.domElement.addEventListener("mouseleave", mouseup, false);
                this.domElement.addEventListener('touchstart', touchstart, false);
                this.domElement.addEventListener('touchend', touchend, false);
                this.domElement.addEventListener('touchmove', touchmove, false);

                // set mousemove base point is dom center
                var clientWidth = (void 0 !== this.domElement.clientWidth) ? this.domElement.clientWidth : window.innerWidth;
                var clientHeight = (void 0 !== this.domElement.clientHeight) ? this.domElement.clientHeight : window.innerHeight;
                rotateStart.set(clientWidth / 2, clientHeight / 2);

                // force an update at start
                //rotateLeft(THREE.Math.degToRad(-180));
                setTimeout(function () {
                    //scope.enable = true;
                    scope.update({
                        init: true
                    });
                    scope.saveState();
                }, 10);
                return this;
            }
            controls.prototype = Object.create(THREE.EventDispatcher.prototype);
            controls.prototype.constructor = controls;
            return new controls(object, domElement);
        },
        setCameraPara: function (that, cameraPara, cameraPosition) {
            that.cameraPara = {
                "fov": 90,
                "aspect": that.container.innerWidth / that.container.innerHeight,
                "near": 0.001,
                "far": 1000
            };
            that.cameraPosition = {
                "x": 0,
                "y": 0,
                "z": 0
            };
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
            var theTime = parseInt(value); // 秒
            if (!theTime) {
                return '00:00';
            }
            var theTime1 = 0; // 分
            var theTime2 = 0; // 小时
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
        cameraVector: function (camera, times) {
            var vector = new THREE.Vector3(0, 0, -1);
            var lookAt = vector.applyQuaternion(camera.quaternion);
            var lookAtVector = lookAt.clone();
            var timesVector = new THREE.Vector3();
            if (times) {
                timesVector.x = lookAt.x * times;
                timesVector.y = lookAt.y * times;
                timesVector.z = lookAt.z * times;
            }
            return {
                'vector': lookAtVector,
                'timesVector': timesVector
            };
        },
        bindRaycaster: function (event, vr, callback) {

            var vector = AVR.screenPosTo3DCoordinate(event, vr.container, vr.camera);
            //在视点坐标系中形成射线,射线的起点向量是照相机， 射线的方向向量是照相机到点击的点，这个向量应该归一标准化。
            var raycaster = new THREE.Raycaster(vr.camera.position, vector.sub(vr.camera.position).normalize());

            //射线和模型求交，选中一系列直线
            var intersects = raycaster.intersectObjects(vr.scene.children, true);

            if (intersects.length) {
                callback.success(intersects);
            } else {
                callback.empty();
            }
        },
        bindCameraEvent: function (vr, options) {
            options = options || {
                trigger: function (e) { },
                empty: function (e) { },
                move: function (e) { }
            };
            var that = this;
            var scale = options.scale || 0.022;
            var vectorRadius = options.vectorRadius;
            var radius = vectorRadius * scale;
            var tube = vectorRadius * (scale / 6);
            var pointSize = vectorRadius * (scale / 8);
            var radialSegments = 2;
            var tubularSegments = options.tubularSegments || 60;
            var speed = options.speed || 36;
            var ControlGroup = new THREE.Group();
            ControlGroup.name = "__controlHandle";

            var waitGeometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, 2 * Math.PI);
            var waitMaterial = [];
            for (var i = 0; i < waitGeometry.faces.length / 2; i++) {
                waitMaterial[i] = new THREE.MeshBasicMaterial({
                    color: 0xe7dada,
                    depthTest: false
                });
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
            //wait.lookAt(vr.camera.position)
            wait.name = "__wait";
            wait.visible = false;
            ControlGroup.add(wait);

            var cameraPointer = new THREE.Mesh(new THREE.CircleGeometry(tube, 4), new THREE.MeshBasicMaterial({
                color: 0xe7dada,
                wireframe: true,
                depthTest: false
            }));
            cameraPointer.lookAt(vr.camera.position);
            cameraPointer.name = "__focus";
            cameraPointer.material.depthTest = false;
            cameraPointer.visible = false;
            ControlGroup.add(cameraPointer);
            ControlGroup.position.set(0, 0, 0.1)
            var timer = null;
            var lastCameraVector = new THREE.Vector3();


            var updatePosition = function () {
                ControlGroup.lookAt(0, 0, 0);
                wait.lookAt(0, 0, 0);
                var v = that.cameraVector(vr.camera, vectorRadius);
                cameraPointer.visible = true;
                ControlGroup.position.set(v.timesVector.x, v.timesVector.y, v.timesVector.z);
                //在视点坐标系中形成射线,射线的起点向量是照相机， 射线的方向向量是照相机到点击的点，这个向量应该归一标准化。
                var raycaster = new THREE.Raycaster(vr.camera.position, v.vector);

                //射线和模型求交，选中一系列直线
                var intersects = raycaster.intersectObjects(vr.scene.children, true);
                if (intersects.length) {
                    options.move(intersects);
                } else {
                    options.empty(intersects);
                }
            }
            var Ctimer = null;
            var hover = function (e) {
                wait.visible = true;
                var offset = 0;
                var mIndex = 0;
                if (!Ctimer) {
                    Ctimer = setInterval(function () {
                        if (mIndex < waitGeometry.faces.length / 4) {
                            waitMaterial[mIndex].color = new THREE.Color(0xe07575)
                            waitGeometry.needsUpdate = true;
                            waitGeometry.faces[offset].materialIndex = mIndex;
                            waitGeometry.faces[offset + 1].materialIndex = mIndex;
                            waitGeometry.faceVertexUvs[0][offset] = [uv[3], uv[0], uv[2]];
                            waitGeometry.faceVertexUvs[0][offset + 1] = [uv[0], uv[1], uv[2]];
                            offset += 2;
                        } else {
                            clearInterval(Ctimer);
                            Ctimer = null;
                            options.trigger(e);
                        }
                        mIndex++;
                    }, speed);
                }
            }
            var leave = function (e) {
                clearInterval(Ctimer);
                Ctimer = null;
                faceId = 0;
                for (var i = 0, l = waitGeometry.faces.length; i < l; i += 2) {
                    waitMaterial[faceId].color = new THREE.Color(0xe7dada)
                    waitGeometry.needsUpdate = true;
                    waitGeometry.faces[i].materialIndex = faceId;
                    waitGeometry.faces[i + 1].materialIndex = faceId;
                    waitGeometry.faceVertexUvs[0][i] = [uv[3], uv[0], uv[2]];
                    waitGeometry.faceVertexUvs[0][i + 1] = [uv[0], uv[1], uv[2]];
                    faceId++;
                }
                wait.visible = false;
            }
            vr.VRObject.add(ControlGroup);
            vr.cameraEvt.controlGroup = ControlGroup;
            vr.cameraEvt.updatePosition = updatePosition;
            vr.cameraEvt.hover = hover;
            vr.cameraEvt.leave = leave;
            //vr.cameraEvt={'controlGroup':ControlGroup,'updatePosition':updatePosition,'hover':hover,'leave':leave};
        },
        screenPosTo3DCoordinate: function (e, container, camera) {
            var clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            var clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            rect = AVR.getBoundingClientRect(container);
            x = clientX - rect.left;
            y = clientY - rect.top;
            //console.log(x, y);
            var W = container.clientWidth;
            var H = container.clientHeight;
            var mouse = new THREE.Vector2();
            mouse.x = 2 * x / W - 1;
            mouse.y = 1 - 2 * y / H;
            var vector = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(camera);
            return vector.sub(camera.position).normalize();
            //return vector;
        },
        objectPosToScreenPos: function (object, container, camera) {
            var vector = new THREE.Vector3();
            vector.setFromMatrixPosition(object.matrixWorld).project(camera);
            var x2hat = vector.x,
                y2hat = vector.y;
            var W = container.clientWidth;
            var H = container.clientHeight;
            var pos = new THREE.Vector2();
            pos.x = (W / 2) * (x2hat + 1);
            pos.y = (H / 2) * (1 - y2hat);
            return pos;
        },
        fullscreen: function (el) {
            var isFullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || false;

            if (!isFullscreen) { //进入全屏,多重短路表达式
                (el.requestFullscreen && el.requestFullscreen()) ||
                    (el.mozRequestFullScreen && el.mozRequestFullScreen()) ||
                    (el.webkitRequestFullscreen && el.webkitRequestFullscreen()) || (el.msRequestFullscreen && el.msRequestFullscreen());

            } else { //退出全屏,三目运算符
                document.exitFullscreen ? document.exitFullscreen() :
                    document.mozCancelFullScreen ? document.mozCancelFullScreen() :
                        document.webkitExitFullscreen ? document.webkitExitFullscreen() : '';
            }
        },
        isFullscreen: function () {

            return document.fullscreenElement ||
                document.msFullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement || false;
        },
        toolBar: function (container) {
            var pre = "_toolBar";
            var toolbar = this.createTag('div', {
                'style': '-moz-user-select:none;-webkit-user-select:none;user-select:none;position:absolute;background:rgba(0,0,0,.2);width:100%;height:2.2rem;bottom:0rem',
                'class': pre + 'Area'
            });

            var btn = this.createTag('div', {
                'style': 'position:inherit;left:1rem;color:#fff;cursor:pointer;bottom:0rem;line-height:100%;',
                'class': pre + 'Btn'
            }, {
                'innerHTML': AVR.playerIcon.playSvg,
            });

            toolbar.appendChild(btn);
            var timeInfo = this.createTag('div', {
                'style': 'position:inherit;bottom:0.5rem;left:2.8rem;color:#fff;font-size:0.75rem'
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
            var css = "@keyframes moreTip{from {top:0.75rem;} to{top:1rem}}"; //写入样式
            if (!AVR.Broswer.isIE()) {
                css += "@-webkit-keyframes moreTip{from {top:0.75rem;} to{top:1rem}}"; //写入样式
            }
            this.addCSS(css);

            var moreBtn = this.createTag('span', {
                'style': 'width:2.2rem;height:2.2rem;position:inherit;left:50%;margin-left:-1.1rem;margin-top:-0.75rem;color:#fff;font-size:1.5rem;' +
                    'cursor:pointer;margin-top:1rem;border:0.0625rem dotted #ccc;height:0.0625rem;'
            }, {
                'innerHTML': ''
            });
            var moreList = this.createTag("div", {
                'style': "width:100%;height:auto;position:inherit;background:rgba(0,0,0,0);top:2.4rem;bottom:1.8rem;overflow: hidden;"
            }, null);
            var moreListUl = this.createTag("ul", {
                'style': 'display:flex;display: -webkit-flex;display: -webkit-box;display: -moz-box;display: -ms-flexbox;margin:0;padding:0;list-style:none;height:100%;'
            }, null);

            moreList.appendChild(moreListUl);
            toolbar.appendChild(moreBtn);
            toolbar.appendChild(moreList);

            var about = this.createTag('div', {
                'style': 'width:2.2rem;height:2.2rem;position:inherit;right:1rem;margin-left:-1.1rem;margin-top:0.6rem;color:#fff;font-size:1.2rem;cursor:pointer;display:none',
                "copy": "&#67;&#111;&#112;&#121;&#114;&#105;&#103;&#104;&#116;&#32;&#169;&#32;&#50;&#48;&#49;&#56;&#32;&#87;&#87;&#87;&#46;&#77;&#88;&#82;&#69;&#65;&#76;&#73;&#84;&#89;&#46;&#67;&#78;&#46;&#32;&#65;&#108;&#108;&#32;&#114;&#105;&#103;&#104;&#116;&#115;&#32;&#114;&#101;&#115;&#101;&#114;&#118;&#101;&#100;&#46;",

            }, {
                'innerText': '？',
            });

            function unicode2ascii(str) {
                var code = str.match(/&#(\d+);/g);
                var s = "";
                for (var i = 0; i < code.length; i++)
                    s += String.fromCharCode(code[i].replace(/[&#;]/g, ''));
                return s;
            }
            about.addEventListener("click", function () {
                var str = this.getAttribute('copy');
                alert(unicode2ascii(str));
            }, false);
            about.addEventListener("mouseover", function () {
                var str = this.getAttribute('copy');
                this.setAttribute('title', unicode2ascii(str));
            }, false);
            toolbar.appendChild(about);

            var gyroResetBtn = this.createTag('div', {
                'style': 'position:inherit;right:5.8rem;cursor:pointer;bottom:0.2rem;line-height:100%'
            }, {
                innerHTML: AVR.playerIcon.resetLookAtSvg,
            });
            toolbar.appendChild(gyroResetBtn);
            var gyroBtn = this.createTag('div', {
                'style': 'position:inherit;right:3.5rem;cursor:pointer;bottom:0.1rem;line-height:100%'
            }, {
                innerHTML: AVR.playerIcon.gyroSvg
            });
            toolbar.appendChild(gyroBtn);
            var vrBtn = this.createTag('div', {
                'style': "position:inherit;right:1rem;cursor:pointer;bottom:0.1rem;line-height:100%"
            }, {
                'innerHTML': AVR.playerIcon.vrSvg
            });

            toolbar.appendChild(vrBtn);

            var progressBar = this.createTag('div', {
                'style': 'position:inherit;top:0rem;width:100%;height:0.1rem;background:rgba(255,255,255,.3);cursor:pointer'
            });

            var loaded_progress = this.createTag('div', {
                'style': 'position:inherit;width:0%;height:0.1rem;background:rgba(255,255,255,.3)'
            });
            progressBar.appendChild(loaded_progress);
            var play_progress = this.createTag('div', {
                'style': 'position:inherit;width:0%;height:0.1rem;background:rgba(28, 175, 252,.6)'
            });
            progressBar.appendChild(play_progress);

            toolbar.appendChild(progressBar);

            container.appendChild(toolbar);

            var voice_bar = this.createTag('div', {
                'style': '-moz-user-select:none;-webkit-user-select:none;user-select:none;position:absolute;width:2rem;height:60%;background:rgba(0,0,0,0);left:0rem;top:20%;text-align:center;display:none;border-radius:1rem;'
            });
            var voice_slide_bar = this.createTag('div', {
                'style': 'position:inherit;width:0.25rem;background:rgba(255,255,255,.1);height:100%;left:0.875rem;cursor:pointer;border-radius:1rem;'
            });
            voice_bar.appendChild(voice_slide_bar);

            var voice_cur_slide = this.createTag('div', {
                'style': 'position:inherit;width:100%;background:rgba(255, 255, 255,.6);bottom:0rem;;border-radius:1rem;'
            });
            voice_slide_bar.appendChild(voice_cur_slide);


            container.appendChild(voice_bar);

            return {
                'toolbar': toolbar,
                'btn': btn,
                'timeInfo': timeInfo,
                'curTime': curTime,
                'splitTime': splitTime,
                'totalTime': totalTime,
                'moreBtn': moreBtn,
                'moreList': moreList,
                'moreListUl': moreListUl,
                'vrBtn': vrBtn,
                'progressBar': progressBar,
                'loadedProgress': loaded_progress,
                'playProgress': play_progress,
                'gyroResetBtn': gyroResetBtn,
                'gyroBtn': gyroBtn,
                "voice_bar": voice_bar,
                "about": about
            };
        },
        addCSS: function (cssText) {
            var style = document.createElement('style'),  //创建一个style元素
                head = document.head || document.getElementsByTagName('head')[0]; //获取head元素
            style.type = 'text/css'; //这里必须显示设置style元素的type属性为text/css，否则在ie中不起作用
            if (style.styleSheet) { //IE
                var func = function () {
                    try { //防止IE中stylesheet数量超过限制而发生错误
                        style.styleSheet.cssText = cssText;
                    } catch (e) {

                    }
                }
                //如果当前styleSheet还不能用，则放到异步中则行
                if (style.styleSheet.disabled) {
                    setTimeout(func, 10);
                } else {
                    func();
                }
            } else { //w3c
                //w3c浏览器中只要创建文本节点插入到style元素中就行了
                var textNode = document.createTextNode(cssText);
                style.appendChild(textNode);
            }
            head.appendChild(style); //把创建的style元素插入到head中    
        },
        msgBox: function (msg, timeout, container) {
            if (!msg) {
                return;
            }
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
        bindOrientationEvent: function (that) {
            if (void 0 === that.controls) {
                that.controls = AVR.orbitControls(that.camera, that.renderer.domElement);
                that.controls.target = that._controlTarget.clone();
            }
        },
        //横屏判断
        isCrossScreen: function (callback) {
            var that = this;
            if (window.orientation == 180 || window.orientation == 0) {
                /*Vertical screen*/
                return false;
            }
            if (window.orientation == 90 || window.orientation == -90) {
                /*is Cross Screen*/
                return true;
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

            document.body.addEventListener("touchmove", bodyPreventDefault);
            document.oncontextmenu = function () {
                return false;
            };

            function bodyPreventDefault(e) {
                e.preventDefault();
            }
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
            webview: !(navigator.userAgent.match(/Chrome\/([\d.]+)/) || navigator.userAgent.match(/CriOS\/([\d.]+)/))
                && navigator.userAgent.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
            safari: !(navigator.userAgent.match(/Chrome\/([\d.]+)/) || navigator.userAgent.match(/CriOS\/([\d.]+)/))
                && navigator.userAgent.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/)
                || navigator.userAgent.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/),
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
                    return !!(window.WebGLRenderingContext && (
                        canvas.getContext('webgl') ||
                        canvas.getContext('experimental-webgl')));
                } catch (e) {
                    return false;
                }
            }
        },
        getBoundingClientRect: function (obj) {
            var xy = obj.getBoundingClientRect();
            var top = xy.top - document.documentElement.clientTop + document.documentElement.scrollTop, //document.documentElement.clientTop 在IE67中始终为2，其他高级点的浏览器为0
                bottom = xy.bottom,
                left = xy.left - document.documentElement.clientLeft + document.documentElement.scrollLeft, //document.documentElement.clientLeft 在IE67中始终为2，其他高级点的浏览器为0
                right = xy.right,
                width = xy.width || right - left, //IE67不存在width 使用right - left获得
                height = xy.height || bottom - top;

            return {
                top: top,
                right: right,
                bottom: bottom,
                left: left,
                width: width,
                height: height
            }
        }
    };

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(AVR.createTag('meta', {
        'name': 'viewport',
        'content': "width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0,minimal-ui,user-scalable=no"
    }));
    head.appendChild(AVR.createTag('meta', {
        'name': 'google',
        'content': "notranslate"
    }));
    head.appendChild(AVR.createTag('meta', {
        'name': 'full-screen',
        'content': "yes"
    }));

    if (AVR.debug) {
        window.onerror = function (msg, url, l) {
            var txt = "There was an error on this page.\n\n";
            txt += "Error: " + msg + "\n";
            txt += "URL: " + url + "\n";
            txt += "Line: " + l + "\n\n";
            AVR.msgBox(txt, 36, document.body);
            return true;
        }
    }

    exports.VR = VR;
    exports.AR = AR;
    exports.AVR = AVR;
})));
