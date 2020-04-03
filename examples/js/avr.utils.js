var VRUtils=function (vr) {
    this.vr=vr;
    this.markIconGroup=new THREE.Group();
    this.markIconGroup.name="markIconGroup";
    vr.VRObject.add(this.markIconGroup);
}
VRUtils.prototype.markIcon=function(img,position,name,title,w,h){
    var w=w || 0.08;
    var h=h||0.08;
    var textureLoader = new THREE.TextureLoader();

    var material = new THREE.MeshBasicMaterial({map:textureLoader.load(img),side:THREE.DoubleSide,transparent:true});
    var geometry = new THREE.PlaneGeometry(w, h);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x,position.y,position.z);
    mesh.name=name;
    mesh.meshType='markIcon';
    this.markIconGroup.add(mesh);
    var div=document.createElement("div");
    div.id=name;
    div.style="padding:4px 4px;background:rgba(0,0,0,.5);color:#fff;display:none;position:absolute;border-radius:6px; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none;font-size:0.75rem;";
    div.innerHTML=title;
    this.vr.container.appendChild(div);
}
VRUtils.prototype.markIconInViews=function () {
    var camera=this.vr.camera;
    for(var i=0;i<this.markIconGroup.children.length;i++){
        var pos=this.markIconGroup.children[i].getWorldPosition().applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
        var name=this.markIconGroup.children[i].name;
        if((pos.x>=-1 &&pos.x<=1) && (pos.y>=-1 && pos.y<=1) && (pos.z>=-1 && pos.z<=1)){
            var screenPos=AVR.objectPosToScreenPos(this.markIconGroup.children[i],this.vr.container,this.vr.camera);
            /*console.log(name);
            console.log(screenPos);*/
            var tip=document.getElementById(name);
            if(tip) {
                tip.style.display = "block";
                tip.style.left = screenPos.x - tip.clientWidth/2 + "px";
                tip.style.top = screenPos.y - tip.clientHeight*2 + "px";
            }
        }else{
            var tip=document.getElementById(name);
            if(tip) {
                tip.style.display = "none";
            }
        }
    }
}
VRUtils.prototype.bindRaycaster=function (event,callback) {

    var vector = AVR.screenPosTo3DCoordinate(event,this.vr.container,this.vr.camera);

    //在视点坐标系中形成射线,射线的起点向量是照相机， 射线的方向向量是照相机到点击的点，这个向量应该归一标准化。
    var raycaster = new THREE.Raycaster(this.vr.camera.position, vector.sub(this.vr.camera.position).normalize());

    //射线和模型求交，选中一系列直线
    var intersects = raycaster.intersectObjects(this.vr.scene.children,true);
    if(intersects.length) {
        callback.success(intersects);
    }else {
        callback.empty();
    }
}

