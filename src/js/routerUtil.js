import {
    loading
} from './util';

import {moduleConfigs} from './config';

let loadbar = new loading();

function loadScript(url) {
    return new Promise((resolve) => {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        loadbar.start();
        if (script.readyState) {
            //IE
            script.onreadystatechange = function () {
                if (this.readyState == 'complete' || script.readyState == "loaded") {
                    script.onreadystatechange = null;
                    script.parentNode.removeChild(script);
                    loadbar.stop();
                    resolve();
                }
            }
        } else {
            //其他浏览器
            script.onload = function () {
                loadbar.stop();
                resolve();
            };
        }
        script.src = url;
        head.appendChild(script);
    });
}


function loadCss(url) {
    return new Promise((resolve) => {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('link');
        script.rel = 'stylesheet';
        script.href = url
        if (script.readyState) {
            //IE
            script.onreadystatechange = function () {
                if (this.readyState == 'complete' || script.readyState == "loaded") {
                    script.onreadystatechange = null;
                    resolve || resolve();
                }
            }
        } else {
            //其他浏览器
            script.onload = function () {
                resolve();
            };
        }
        head.appendChild(script);
    });
}

// 挂载业务线数据
function routerUtil(Vue, router) {
    function registerApp({
                             routes
                         }) {
        if (routes) {
            // console.log(routes)
            router.addRoutes(routes);
        }
    }

    window.bapp = Object.assign(window.bapp || {}, {
        Vue,
        router,
        registerApp
    });
}

//加载第三方
const loadOtherModule = async function (name) {
    return new Promise((resolve) => {
        if (moduleConfigs[name] && !moduleConfigs[name].loaded && moduleConfigs[name].module.length) {
            window.require(moduleConfigs[name].module, (...arg) => {
                // console.log(arg)
                moduleConfigs[name].vue.forEach((event, index) => {
                    //如果不是amd风格
                    if(arg[index] == undefined){
                        arg[index] = window[moduleConfigs[name].module[index]]
                    }
                    //console.log(arg[index])
                    if(event){
                        window.Vue.prototype[event] = arg[index];
                    }
                    else{
                        window[moduleConfigs[name].module[index]] = arg[index];
                    }
                });
                moduleConfigs[name].loaded = true;
                resolve();
            })
        } else {
            resolve();
        }
    });
}

//加载相应js，css
const loadJsCss = async function (name, href, url) {
    //load 第三方js
    await loadOtherModule(name);
    await loadScript(url);
    await loadCss(href);
    // await loadScript(url);
}

//router方法
const handle = async (to, from, next, config) => {
    let path = to.path || "";
    let paths = path.split('/');
    // let reg = /\-\w{1,}$/;
    // let serviceName = paths[1].replace(reg, '');
    let serviceName = paths[1];
    //console.log('path: ', serviceName);
    let cfg = config[serviceName];

    // 非业务线路由
    if (!cfg) {
        return false;
    }

    // 该业务线已经加载
    if (cfg.loaded) {
        next();
        return true;
    }

    await loadJsCss(serviceName, cfg.css, cfg.app);
    //debugger

    cfg.loaded = true;

    next(to);  // 继续请求页面
    return true;
}


module.exports = {
    handle,
    routerUtil
}
