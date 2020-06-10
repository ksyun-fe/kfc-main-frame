var Promise = require('promise');
const projectKey = 'project-manager'


function createXMLHTTPRequest() {
    //1.创建XMLHttpRequest对象
    //这是XMLHttpReuquest对象无部使用中最复杂的一步
    //需要针对IE和其他类型的浏览器建立这个对象的不同方式写不同的代码
    var xmlHttpRequest;
    if (window.XMLHttpRequest) {
        //针对FireFox，Mozillar，Opera，Safari，IE7，IE8
        xmlHttpRequest = new XMLHttpRequest();
        //针对某些特定版本的mozillar浏览器的BUG进行修正
        if (xmlHttpRequest.overrideMimeType) {
            xmlHttpRequest.overrideMimeType("text/xml");
        }
    } else if (window.ActiveXObject) {
        //针对IE6，IE5.5，IE5
        //两个可以用于创建XMLHTTPRequest对象的控件名称，保存在一个js的数组中
        //排在前面的版本较新
        var activexName = ["MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (var i = 0; i < activexName.length; i++) {
            try {
                //取出一个控件名进行创建，如果创建成功就终止循环
                //如果创建失败，回抛出异常，然后可以继续循环，继续尝试创建
                xmlHttpRequest = new ActiveXObject(activexName[i]);
                if (xmlHttpRequest) {
                    break;
                }
            } catch (e) {
            }
        }
    }
    return xmlHttpRequest;
}

export const getName = function (name) {
    return [projectKey, name].join('-')
}
export const getPath = function (path) {
    return path.replace(/^\//, '\/' + projectKey + '-')
}

export const getJson = function (url) {
    return new Promise((resolve, reject) => {
        var req = createXMLHTTPRequest();
        if (req) {
            //+ '?timer=' + new Date().getTime()
            req.open("GET", url + '?timer=' + new Date().getTime(), true);
            // req.open("GET", url + '?timer=', true);
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        resolve(req.responseText);
                    } else {
                        console.log("error");
                    }
                }
            }
            req.send(null);
        }
    })

}

export const loading = function () {
    this.bar = null;
}
loading.prototype.start = function () {
    this.bar && this.bar.remove();
    let bar =
        '<div class="k-progress-container">' +
        '<div class="k-content">' +
        '<div class="k-bg">' +
        '</div>' +
        '</div>' +
        '</div>';
    let barBox = document.createElement('div');
    barBox.innerHTML = bar;
    this.bar = barBox;
    document.querySelector('body').appendChild(barBox);
    setTimeout(function () {
        barBox.querySelector('.k-bg').style.width = '60%';
    }, 0)
}
loading.prototype.stop = function () {
    this.bar.querySelector('.k-progress-container').className = 'k-progress-container stop';
    this.bar.querySelector('.k-bg').style.width = '100%';
    setTimeout(() => {
        try {
            this.bar.remove();
        } catch (e) {
            document.querySelector('body').removeChild(this.bar);
        }
        this.bar = null;
    }, 400)
}
