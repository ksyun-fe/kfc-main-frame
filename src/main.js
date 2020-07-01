import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import resource from 'vue-resource'
import vueRouter from 'vue-router'
import {
    handle,
    routerUtil
} from './js/routerUtil'
import {
    getJson
} from './js/util';
import Default from './views/index'
import Error from './views/error'
import Normal from './views/normal'
import mixin from './js/mixin'
import './styles/loading.css'

Vue.use(resource)
Vue.use(vueRouter)
Vue.mixin(mixin)

Vue.config.productionTip = false

window.Vue = Vue;

//临时引入
import baseData from './config/pageConfig';

let render = async function () {
    //let baseData = await getJson("https://github.com/ksfe/fe-main-frame/blob/master/pageConfig.json");
    // baseData = JSON.parse(baseData);
    let router = new vueRouter({
        routes: [
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
                path: '*',
                async beforeEnter(to, from, next) {
                    // 业务线拦截
                    let isService = await handle(to, from, next, baseData);
                    // 非业务线页面，走默认处理
                    if (!isService) {
                        next('/error');
                    }

                }
            }
        ]
    });

    router.beforeEach((to, from, next) => {
        if (to.meta.title) {
            document.title = to.meta.title
        }
        next()

    });

    routerUtil(Vue, router);

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

    new Vue({
        el: '#app',
        router,
        template: '<App/>',
        components: {
            App
        },
        render: function (createElement) {
            if ('-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style) {
                let iEVersion = getIEVersion();
                if (iEVersion == 10) {
                    reloadFn(this);
                }
                window.addEventListener('hashchange', () => {
                    var currentPath = window.location.hash.slice(1)
                    if (this.$route.path !== currentPath) {
                        this.$router.replace(currentPath)
                    }
                })
            }
            return createElement(App);
        }
    })



}
render();
