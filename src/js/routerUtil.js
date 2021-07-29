import {
    loading
} from './util';

import {moduleConfigs} from './config';

let moduleConfigs = null;
let loadbar = new loading();

// 注册全局app对象
window.bapp = Object.assign(window.bapp || {}, {
    serverName: null,
    type: 'vue',
    routes: [],
    componentWillUnmount: function () {},
    renderFns: {},
    destoryFns: {}
});

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
    if (!url) return false;
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
function routerUtil(Vue, router, renderVue) {
    function registerApp(
        {
            routes
        },
        type = 'vue',
        renderFn,
        destoryFn
    ) {
        // vue register in main router
        if (routes && type === 'vue') {
            // console.log(routes)
            router.addRoutes(routes);
            window.bapp.routes = window.bapp.routes.concat(routes);
        }
        // 非 vue || 单独部署的vue
        if (type !== 'vue' && renderFn && typeof renderFn === 'function') {
            // if (window.bapp.type === 'vue') {
            // }
            window.bapp.componentWillUnmount();
            setTimeout(() => {
                renderFn();
            }, 0);
        }
        // 暂存项目名称
        const serverName = getServiceName(location.hash.replace('#', ''));
        // 暂存本次serverName
        window.bapp.serverName = serverName;
        // 存储本次react等其他应用 渲染方法
        window.bapp.renderFns[serverName] = renderFn;
        // 存储本次react等其他应用 销毁方法
        window.bapp.destoryFns[serverName] = destoryFn;
        // 设置当前渲染类型
        window.bapp.type = type;
    }

    window.bapp.Vue = Vue;
    window.bapp.router = router;
    window.bapp.renderVue = renderVue;
    window.bapp.registerApp = registerApp;
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
    // load 第三方js
    loadbar.start();
    await loadOtherModule(name);
    loadbar.middle();
    await loadCss(href);
    if (Object.prototype.toString.call(url) === '[object Array]') {
        for (let i = 0; i < url.length; i++) {
            await loadScript(url[i]);
        }
    } else {
        await loadScript(url);
    }
    loadbar.stop();
};

const getServiceName = function (path) {
    let paths = path.split('/');
    return paths[1];
};

//router方法
const handle = async (to, from, next, config) => {
    let path = to.path || '';
    const serviceName = getServiceName(path);
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
    routerUtil,
    getServiceName
}
