var Promise = require('promise');

export default {
    methods: {
        //格式化参数
        formatParams(obj) {
            let ary = [];
            for (var key in obj) {
                ary.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            }
            return ary.join('&')
        },
        _request({ url, params = [], data = {}, method = 'get', headers = {}, before, body ,progress = ()=>{}}) {
            for(let keyStr in headers){
                headers[keyStr] = headers[keyStr].toString()
            }
            let timer = new Date().getTime();
            if (method.toLowerCase() == 'post' || method.toLowerCase() == 'put') {
                return new Promise((resolve, reject) => {
                    this.$http[method.toLowerCase()](url, data, {
                        // headers: {'Content-Type': 'application/json'},
                        // emulateJSON: true,
                        headers,
                        before,
                        progress
                    }).then((res) => {
                        resolve(res);
                    }, (e) => {
                        reject({ status: e.status, message: e.statusText })
                    })
                })
            } else if (method.toLowerCase() == 'delete') {
                return new Promise((resolve, reject) => {
                    this.$http[method.toLowerCase()](url + '?timer=' + timer, {
                        // headers: {'Content-Type': 'application/json'},
                        // emulateJSON: true,
                        params: params,
                        headers,
                        before,
                        body: data || body
                    }).then((res) => {
                        //TODO 请求判断

                        resolve(res);
                    }, (e) => {
                        reject({ status: e.status, message: e.statusText })
                    })
                })
            } else {
                return new Promise((resolve, reject) => {
                    this.$http[method.toLowerCase()](url + '?timer=' + timer, {
                        params: params,
                        headers,
                        before
                    }).then((res) => {
                        res.data = res.body;
                        resolve(res);
                    }, (e) => {
                        reject({ status: e.status, message: e.statusText })
                    })
                })
            }
        },

        axiosCancel(CancelProp) {
            if (!this[CancelProp]) return;
            if (Array.isArray(this[CancelProp])) {
                this[CancelProp].forEach(fn => fn.abort());
                CancelProp = [];
            } else {
                this[CancelProp].abort();
                this[CancelProp] = null;
            }
        },
        GetUrlParam(paraName) {
            let url = document.location.hash.toString();
            let arrObj = url.split("?");

            if (arrObj.length > 1) {
                let arrPara = arrObj[1].split("&");
                let arr;

                for (let i = 0; i < arrPara.length; i++) {
                    arr = arrPara[i].split("=");

                    if (arr != null && arr[0] == paraName) {
                        return arr[1];
                    }
                }
                return "";
            } else {
                return "";
            }
        }
    }
};
