//初始化着色器
function initShaders(gl,type){
	var shaderProgram;
	var fragmentShader = getShader(gl,type);
	var vertexShader = getShader(gl);
	//创建着色器
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram,vertexShader);
	gl.attachShader(shaderProgram,fragmentShader);
	//链接着色器程序
	gl.linkProgram(shaderProgram);
	//检查着色器是否成功链接
	if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){
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
function getShader(gl,id){
	var shaderScript;
	//var theSource;
	//var currentChild;
	var shader;


	/*//获取着色器的文本内容保存到theSource
	theSource = '';
	currentChild = shaderScript.firstChild;
	while(currentChild){
		if(currentChild.nodeType === currentChild.TEXT_NODE){
			theSource += currentChild.textContent;
		}
		currentChild = currentChild.nextSibling;
	}*/
	//创建顶点着色器或片段着色器
	if(id){
        shaderScript = getShaderFragment(id);
        if(!shaderScript){
            return null;
        }
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}else{
		shaderScript=getShaderVertex()
        shader = gl.createShader(gl.VERTEX_SHADER);
	}
	gl.shaderSource(shader,shaderScript);
	//编译着色器代码
	gl.compileShader(shader);
	//检查是否编译成功
	if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
		console.log(gl.getShaderInfoLog(shader));//打印编译失败信息
		return null;
	}
	//成功编译返回编译好的着色器
	return shader;
}
//<!-- 片段着色器程序 -->
function getShaderFragment(type){
	var code="";
	var variable="\n\
	 precision mediump float;\n\
    varying vec2 v_TexCoord;\n\
    uniform sampler2D u_Sampler;\n\
    uniform float PI;\n";

    //超出范围处理\
	var checkRange="\n\
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
	if(type=='z') {
        //z轴正平面-z\
        code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(0.5-v_TexCoord.x,v_TexCoord.y-0.5);\n\
				float theta = atan(orig.x,r);\n\
				float phi = atan(orig.y*cos(theta),r);" + checkRange + "\n\
			}\n";
    }else if(type=="nz"){
        //z轴负平面-nz\
        code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(0.5-v_TexCoord.x,v_TexCoord.y-0.5);\n\
				float theta = atan(orig.x,r);\n\
				float phi = atan(orig.y*cos(theta),r);\n\
        		theta = theta+PI;\n" + checkRange + "\n\
			}\n";
	}else if(type=="x"){
        //x轴正平面-x\
        code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(v_TexCoord.x-0.5,v_TexCoord.y-0.5);\n\
				float theta = atan(r,orig.x);\n\
				float phi = atan(orig.y*sin(theta),r);" + checkRange + "\n\
			}\n";
    }else if(type=="nx"){
        //x轴负平面-nx\
        code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(v_TexCoord.x-0.5,v_TexCoord.y-0.5);\n\
				float theta = atan(r,orig.x);\n\
				float phi = atan(orig.y*sin(theta),r);\n\
        		theta = theta+PI;" + checkRange + "\n\
			}\n";
    }else if(type=="y"){
        //y轴正平面-y\
        code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(0.5-v_TexCoord.x,0.5-v_TexCoord.y);\n\
        		float theta = atan(orig.x,orig.y);\n\
        		float phi = atan(r*sin(theta),orig.x);" + checkRange + "\n\
			}\n";
    }else if(type=="ny"){
        //y轴负平面-ny
        code = variable + "\n\
			void main() {\n\
				float r = 0.5;\n\
				vec2 orig = vec2(0.5-v_TexCoord.x,v_TexCoord.y-0.5);\n\
				float theta = atan(orig.x,orig.y);\n\
				float phi = atan(r*sin(theta),orig.x);\n\
				phi = -phi;" + checkRange + "\n\
			}\n";
    }else{
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
/**竖向像素反转
 @param sourceData 反转前的像素
 @param newData 通过目标边框创建的空像素块
 **/
function imageDataVRevert(sourceData,newData){
    var w=1024,h=1024;
    for(var i=0;i<h;i++){
        for(var j=0;j<w;j++){
            newData.data[i*w*4+j*4+0] = sourceData.data[(h-i)*w*4+j*4+0];
            newData.data[i*w*4+j*4+1] = sourceData.data[(h-i)*w*4+j*4+1];
            newData.data[i*w*4+j*4+2] = sourceData.data[(h-i)*w*4+j*4+2];
            newData.data[i*w*4+j*4+3] = sourceData.data[(h-i)*w*4+j*4+3];
        }
    }
    return newData;
}
/**横向像素反转
 @param sourceData 反转前的像素
 @param newData 通过目标边框创建的空像素块
 **/
function imageDataHRevert(sourceData,newData){
    var w=1024,h=1024;
    for(var i=0;i<h;i++){
        for(var j=0;j<w;j++){
            newData.data[i*w*4+j*4+0] = sourceData.data[i*w*4+(w-j)*4+0];
            newData.data[i*w*4+j*4+1] = sourceData.data[i*w*4+(w-j)*4+1];
            newData.data[i*w*4+j*4+2] = sourceData.data[i*w*4+(w-j)*4+2];
            newData.data[i*w*4+j*4+3] = sourceData.data[i*w*4+(w-j)*4+3];
        }
    }
    return newData;
}
function draw() {
    var c = document.createElement('canvas'), ctx = c.getContext('2d')
    c.width = w * 6;
    c.height = h;
	/**/
    var tmp = document.createElement('canvas'), tmpctx = tmp.getContext('2d');
    tmp.width = w;
    tmp.height = h;
    var degree = 180 * Math.PI / 180;
    tmpctx.rotate(degree);
    for (var idx in canvasArr) {

        tmpctx.drawImage(canvasArr[idx], 0, 0, -w, -h);

        ctx.drawImage(tmp, idx * w, 0, w, h);

    }
    document.getElementById("test").src = c.toDataURL();

}
