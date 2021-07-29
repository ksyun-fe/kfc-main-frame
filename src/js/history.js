class Dep {
    constructor() {
        this.id = new Date();
        this.subs = [];
    }
    defined() {
        Dep.watch.add(this);
    }
    notify() {
        this.subs.forEach((e, i) => {
            if (typeof e.update === 'function') {
                try {
                    e.update.apply(e);
                } catch (err) {
                    console.warn(err);
                }
            }
        });
    }

}
Dep.watch = null;

class Watch {
    constructor(name, fn) {
        this.name = name;
        this.id = new Date();
        this.callBack = fn;
    }
    add(dep) {
        dep.subs.push(this);
    }
    update() {
        var cb = this.callBack;
        cb(this.name);
    }
}

const addHistoryMethod = (function () {
    let historyDep = new Dep();
    return function (name) {
        if (name === 'historychange') {
            return function (name, fn) {
                let event = new Watch(name, fn);
                Dep.watch = event;
                historyDep.defined();
                Dep.watch = null;
            };
        } else if (name === 'pushState' || name === 'replaceState') {
            var method = history[name];
            return function () {
                method.apply(history, arguments);
                historyDep.notify();
            };
        }

    };
}());

const initHistorychangeEvent = function () {
    window.addHistoryListener = addHistoryMethod('historychange');
    history.pushState = addHistoryMethod('pushState');
    history.replaceState = addHistoryMethod('replaceState');
};

module.exports = initHistorychangeEvent;

