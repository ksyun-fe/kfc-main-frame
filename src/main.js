import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import resource from 'vue-resource'
import vueRouter from 'vue-router'
import {
    handle,
    routerUtil,
    getServiceName
} from './js/routerUtil';
import {
    getJson
} from './js/util';
import Default from './views/index'
import Error from './views/error'
import Normal from './views/normal'
import mixin from './js/mixin'
import './styles/loading.css'
import initHistorychangeEvent from './js/history.js';

Vue.use(resource)
Vue.use(vueRouter)
Vue.mixin(mixin)

Vue.config.productionTip = false

window.Vue = Vue;

let _vueVm = null;

//临时引入
import baseData from './config/pageConfig';

const createBaseRoutes = (baseData, routes) => {
    let baseRoutes = [
        {
            path: '/',
            name: 'default',
            component: Default
        },
        {
            path: '/loading',
            name: 'loading',
            component: Normal
        },
        {
            path: '/error',
            name: 'error',
            component: Error
        },
        {
            path: '/403',
            name: '403',
            component: noAuthPage
        },
        {
            path: '/networkerror',
            name: 'networkError',
            component: networkError
        },
        {
            path: '*',
            async beforeEnter(to, from, next) {
                // 业务线拦截
                let isService = await handle(to, from, next, baseData);
                // 非业务线页面，走默认处理
                if (!isService) {
                    next('/error');
                    window.bapp.type = 'vue';
                }

            }
        }
    ];
    if (routes && routes.length) {
        baseRoutes = baseRoutes.concat(routes);
    }
    return baseRoutes;
};


let render = async function () {
    //let baseData = await getJson("https://github.com/ksfe/fe-main-frame/blob/master/pageConfig.json");
    // baseData = JSON.parse(baseData);
    let baseRoutes = createBaseRoutes(baseData);
    let router = new vueRouter({
        routes: baseRoutes
    });

    router.beforeEach((to, from, next) => {
        if (to.meta.title) {
            document.title = to.meta.title
        }
        next()

    });

    const reloadFn = (that) => {
        var currentPath = window.location.hash.slice(1);
        if (that.$route.fullPath !== currentPath) {
            that.$router.push(currentPath);
            that.$router.replace('/loading');
            setTimeout(() => {
                that.$router.replace(currentPath);
            }, 300);
        }
    }

    const getIEVersion = () => {
        if (document.documentMode) return document.documentMode;
    }

    const renderVue = (Vue, router) => {
        _vueVm = new Vue({
            el: '#app',
            router,
            components: {
                App
            },
            template: '<App/>',
            render: function (createElement) {
                if ('-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style) {
                    let iEVersion = getIEVersion();
                    if (iEVersion == 10) {
                        reloadFn(this);
                    }
                    window.addEventListener('hashchange', () => {
                        var currentPath = window.location.hash.slice(1);
                        if (this.$route.path !== currentPath) {
                            this.$router.replace(currentPath);
                        }
                    });
                }
                return createElement(App);
            }
        });

        window.bapp.componentWillUnmount = () => {
            _vueVm && _vueVm.$destroy();
            _vueVm = null;
            document.querySelector('#container').innerHTML = '<div id="app"></div>';
        };
    };

    routerUtil(Vue, router, renderVue);

    window.Vue = Vue;

    renderVue(Vue, router);

}

const reInitRender = function () {
    let bapp = window.bapp;
    // 如果从react组件切换到vue组件
    const serverName = getServiceName(location.hash.replace('#', ''));
    // 如果是跨业务线跳转，且没有vue实例，且没有注册过的react等服务 react => vue || react => react
    if (bapp.serverName != serverName && !_vueVm && !bapp.renderFns[serverName]) {
        // 销毁react
        bapp.destoryFns[bapp.serverName] && bapp.destoryFns[bapp.serverName]();
        // 重新渲染vue
        // bapp.renderVue(bapp.Vue, bapp.router);
        let routes = createBaseRoutes(baseData, bapp.routes);
        let router = new vueRouter({
            routes: routes
        });
        routerUtil(bapp.Vue, router, bapp.renderVue);
        // window.bapp.router = router;
        window.bapp.serverName = serverName;
        bapp.renderVue(bapp.Vue, router);
    }
    // 如果跳转到已加载的业务线（react）则调用存储的渲染方法
    if (bapp.serverName != serverName && bapp.renderFns[serverName]) {
        bapp.componentWillUnmount();
        bapp.renderFns[serverName]();
        window.bapp.serverName = serverName;
    }

};

render();

// 初始化HistoryListener
initHistorychangeEvent();
window.addEventListener('hashchange', () => {
    reInitRender();
});

window.addHistoryListener('history', () => {
    reInitRender();
});
