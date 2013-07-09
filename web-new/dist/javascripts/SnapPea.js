/*!
 * 看我们的源码？不如来加入我们吧！豌豆实验室的前端团队正在寻找和您一样有好奇心的优秀前端工程师！
 *
 *   11
 *    01
 *    1001
 *     01111
 *     111111
 *      111111  1
 *      11111111
 *       11111111  01
 *        111111111
 *        1111111111  10                         111111    10       11111111111111      11    1
 *         11111111111 11                        111111 001000000   00111111111101  0000000100000001
 *          11111111111  101                      01111 01     10                       11 1  01
 *           111111111111  00                    10  10  01   11     001111111101     1 1 100 1 11
 *            111111111111    11                 101110 10 010100    0         01     101110111101
 *             1011111111111  101                 1  1  01 0 0 10    011111111101      01  0   01
 *               1111111111101    1               01 0  1 01 0 01     101111 001    1000110000101001
 *                111111111111111 11              1110   10  0         0     01         100 101
 *                      1        11              100001 00   0110  1111001110011101 100001    10000
 *              1111111  11111111 1011           11     1    1111  111111111111111  11            1
 *             01 11  11111  111 1 1100011
 *            101111111111111101111 001111
 *            10      11111      11 1
 *             11    101111      01
 *               110011  100111101
 *                         1111
 *
 *
 * http://www.wandoujia.com/join
 * @author Zeke Zhao
 * @mail wangye.zhao@wandoujia.com
 * @twitter @wangyezhao
 * @weibo @赵望野
 */

(function(e){require(["underscore","jquery","doT","ui/TemplateFactory","utilities/QueryString","utilities/BrowserSniffer"],function(t,n,r,i,s,o){if(o.is("wandoujia")&&s.get("debug")!=="true"){var u=e.console,a=function(){};e.console={debug:a,log:a,time:a,timeEnd:a,dir:a,error:a},e.whosYourDaddy=function(){e.console=u}}o.sysIs("WindowsXP")&&n("head").append(r.template(i.get("misc","font-style-xp"))({}))}),require(["jquery","backbone","main/views/MainView","doraemon/views/DoraemonModuleView","doraemon/views/GalleryView","message/views/MessageModuleView","browser/views/BrowserModuleView","app/views/AppModuleView","welcome/views/WelcomeModuleView","music/views/MusicModuleView","contact/views/ContactModuleView","photo/views/PhotoModuleView","video/views/VideoModuleView","optimize/views/OptimizeModuleView","app/wash/views/AppWashModuleView","sync/SyncModule","FunctionSwitch","social/SocialService","utilities/Util","Device","Settings","Environment","ui/Notification","ui/TemplateFactory","IOBackendDevice","Configuration","Log","IframeMessageListener","PerformanceTracker"],function(t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N,C,k,L,A){e.SnapPea=e.SnapPea||{};var O=r.getInstance();O.regModule("welcome",f),O.render(),O.regModule("doraemon",i),O.regModule("browser",u),O.regModule("message",o),O.regModule("app",a),O.regModule("music",l),O.regModule("photo",h),O.regModule("video",p),O.regModule("contact",c),O.regModule("optimize",d),O.regModule("app-wash",v),O.regModule("gallery",s),e.externalCall("","page_ready",""),A.launch()})})(this);