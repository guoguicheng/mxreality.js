# covideo.cn(酷视频) 专注研究web VR视频和普通视频低延迟解决方案｜focus on web VR video and general video low latency solutions

## 当前github版本为社区版免费版，开放源码，社区共同维护

    // 安装依赖
    npm install
##
    // 编译源码
    gulp build
##
    // 启动服务查看测试例子
    http-server -p 8080

播放器sdk分为免费版和收费版，收费版有mxreality.js进取版(Plus)和mxplayer.js旗舰版（Pro），
如果对直播和VR交互要求不高，只用于普通hls直播，mp4视频播放，全景图，当前免费版完全可以满足您的需要；
如果觉得mxreality.js库基本可以满足，但是需要对播放器功能需要扩充，如支持普通平面视频播放器功能，VR功能增强等需求或需要技术支援服务则可以选
用mxplayer.js进取版（Plus）。
如果对直播要求低延迟，支持flv直播，支持h264、h265解码、支持webrtc，支持ts，立体电影等功能，有更好的清晰度，更好的兼容性，
则推荐购买mxplayer.js授权版本（Pro）；
授权版本对这些功能都支持的很友好，直接购买授权版本可免除大量开发时间和开发成本

The player SDK is divided into free version (Basic) and paid version. The paid version has MxRealite.js Enterprise (Plus) and MxPlayer.js Ultimate (Pro).
If the live broadcast and VR interaction requirements are not high, only used for general HLS live broadcast, MP4 video playback, panorama, the current free version can fully meet your needs;
If you think that the MxReality. Js library can basically meet, but the player functions need to be expanded, such as support for ordinary flat video player functions, VR function enhancement and other requirements or need technical support services, you can choose
Use mxplayer.js for jq-version.
If low delay is required for live broadcasting, support FLV live broadcasting, support H264, H265 decoding, support WEBRTC, support websocket, stereo film and other functions, with better clarity, better compatibility,
It is recommended to purchase the authorized version of mxplayer.js (Pro);
The licensed versions support these functions very friendly, Buying the licensed version directly eliminates a lot of development time and development costs

<hr/>

## check support (Chinese)
<table>
<thead>
<tr style="background:#FFFFE0;">
<th></th>
<th>探索版（当前版本）</th><th>进取版A</th><th>进取版B</th><th>旗舰版A</th><th>旗舰版B</th><th>旗舰版C</th><th>旗舰版D</th><th>旗舰版E</th>
</tr>
</thead>
<tr>
<td style="background:#FFFFE0;">hls直播</td><td>支持</td><td>支持</td><td>支持</td><td>不支持</td><td>不支持</td><td>支持</td><td>支持</td><td>支持</td>
</tr>
<tr>
<td style="background:#FFFFE0;">flv直播</td><td>部分支持</td><td>部分支持</td><td>部分支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td>
</tr>
<td style="background:#FFFFE0;">webrtc直播</td><td>否</td><td>否</td><td>否</td><td>否</td><td>否</td><td>否</td><td>否</td><td>支持</td>
</tr>
<td style="background:#FFFFE0;">websocket直播</td><td>否</td><td>否</td><td>否</td><td>否</td><td>否</td><td>否</td><td>否</td><td>支持</td>
</tr>
<tr>
<td style="background:#FFFFE0;">延迟</td><td>高</td><td>中</td><td>中</td><td>低</td><td>低</td><td>低</td><td>低</td><td>低</td>
</tr>
<tr>
<td style="background:#FFFFE0;">全景图</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td>
</tr>
<tr>
<td style="background:#FFFFE0;">VR视频</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td>
</tr>
<tr>
<td style="background:#FFFFE0;">普通视频</td><td>不支持</td><td>不支持</td><td>支持</td><td>不支持</td><td>不支持</td><td>不支持</td><td>支持</td><td>支持</td>
</tr>
<tr>
<td style="background:#FFFFE0;">CubeMap</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td>
</tr>
<tr>
<td style="background:#FFFFE0;">CubeMap自定义面的位置</td><td>不支持</td><td>不支持</td><td>不支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td><td>支持</td>
</tr>
<tr>
<td style="background:#FFFFE0;">渲染加速</td><td>CPU</td><td>CPU</td><td>CPU</td><td>GPU</td><td>GPU</td><td>GPU</td><td>GPU</td><td>GPU</td>
</tr>
<tr>
<td style="background:#FFFFE0;">立体视频</td><td>不支持</td><td>不支持</td><td>支持</td><td>不支持</td><td>不支持</td><td>不支持</td><td>不支持</td><td>支持</td>
</tr>
<tr>
<td style="background:#FFFFE0;">影院模式</td><td>不支持</td><td>不支持</td><td>支持</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
</tr>
<tr>
<td style="background:#FFFFE0;">技术支持</td><td>无</td><td>1年</td><td>1年</td><td>1年</td><td>1年</td><td>1年</td><td>1年</td><td>1年</td>
</tr>
<tr>
<td style="background:#FFFFE0;">视频编码</td><td>h264</td><td>h264</td><td>h264</td><td>h264</td><td>h264,h265</td><td>h264,h265</td><td>h264,h265</td><td>h264,h265</td>
</tr>
<tr>
<td style="background:#FFFFE0;">清晰度</td><td>2k</td><td>4k</td><td>4k</td><td>4k</td><td>4k</td><td>4k</td><td>4k</td><td>4k</td>
</tr>
<tr>
<td style="background:#FFFFE0;">价格</td><td>免费</td><td>询价</td><td>询价</td><td>询价</td><td>询价</td><td>询价</td><td>询价</td><td>询价</td>
</tr>

<tbody>
</tbody>
</table>
<hr/>

## check support (English)
<table>
<thead>
<tr style="background:#FFFFE0;">
<th></th>
<th>Basic(current version)</th><th>Plaus-A</th><th>Plus-B</th><th>Pro-A</th><th>Pro-B</th><th>Pro-C</th><th>Pro-D</th><th>Pro-E</th>
</tr>
</thead>
<tr>
<td style="background:#FFFFE0;">Enable hls</td><td>supported</td><td>supported</td><td>supported</td><td>not supported</td><td>not supported</td><td>supported</td><td>supported</td><td>supported</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Enable flv</td><td>Part</td><td>Part</td><td>Part</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td>
</tr>
<td style="background:#FFFFE0;">Enable webrtc</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>supported</td>
</tr>
</tr>
<td style="background:#FFFFE0;">websocket</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>supported</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Delay</td><td>slow</td><td>slowish</td><td>slowish</td><td>fast</td><td>fast</td><td>fast</td><td>fast</td><td>fast</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Panorama image</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Panorama video</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Normal video</td><td>not supported</td><td>not supported</td><td>supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>supported</td><td>supported</td>
</tr>
<tr>
<td style="background:#FFFFE0;">CubeMap</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Change CubeMap face</td><td>not supported</td><td>not supported</td><td>not supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td><td>supported</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Booster</td><td>CPU</td><td>CPU</td><td>CPU</td><td>GPU</td><td>GPU</td><td>GPU</td><td>GPU</td><td>GPU</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Stereo video</td><td>not supported</td><td>not supported</td><td>supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>not supported</td><td>supported</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Cinema mode</td><td>not supported</td><td>not supported</td><td>supported</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Free support</td><td>none</td><td>one year</td><td>one year</td><td>one year</td><td>one year</td><td>one year</td><td>one year</td><td>one year</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Enable decoder</td><td>h264</td><td>h264</td><td>h264</td><td>h264</td><td>h264,h265</td><td>h264,h265</td><td>h264,h265</td><td>h264,h265</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Enable resolution</td><td>2k</td><td>4k</td><td>4k</td><td>4k</td><td>4k</td><td>4k</td><td>4k</td><td>4k</td>
</tr>
<tr>
<td style="background:#FFFFE0;">Buy license</td><td>free</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td><td>?</td>
</tr>

<tbody>
</tbody>
</table>
<hr/>

* [中文在线文档](docs/index.md) 
* [English Documents](docs/index_en.md) 

* 有问题可[进入社区](http://discuss.mxreality.cn)提问
* Any questions?please check [discuss](http://discuss.mxreality.cn)
<hr/>

* 查看官方例子 [在线地址](https://www.covideo.cn)
* Check examples [examples](https://www.covideo.cn)


<hr/>

* 🐡本站提供全面的VR全景视频、普通2D和3D视频是在线免费上传分享功能，支持免费在线直播。
* 🐡Support VR video,VR video live,panorama images
<hr/>

* 🎈提供VR视频和普通视频直播技术支持
* 🎈Provide business support
<hr/>

* 🌼加入QQ群863363544交流行业技术心得
* 🌼Follow [Twitter](https://twitter.com/cheng67274319)
<hr/>

## Business support
[Connect on Twitter](https://twitter.com/cheng67274319)
## (商务合作请咨询）
<img src="docs/wechat.png" width="200" height="200" title=“wechat”/>
<hr/>