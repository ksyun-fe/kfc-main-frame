const getDownPath = (name) => {
    // const defaultPath = '/main/static/js/';
    const defaultPath = '//ks3-cn-beijing.ksyun.com/bigdata-fe/project/ccb/fe-frame-demo/libs/';
    return defaultPath + name;
}
window.require.config({
    paths: {
        "echarts": getDownPath("echarts"),
        "jsPlumb": getDownPath("jsplumb"),
        'vs': getDownPath('monaco'),
        //"monaco": getDownPath("monaco")
    }
});

export const moduleConfigs = {
    demo: {
        //是否已加载
        loaded: false,
        //和require config对应名称
        module: ["echarts", "jsPlumb", "vs/editor/editor.main"],
        //vue引入的配置名  ""为直接绑定到window对象
        vue: ["$echarts", "", "monaco"]
    },
    projectA: {
        loaded: false,
        module: ["echarts"],
        vue: ["$echarts"]
    },
    projectB: {
        loaded: false,
        module: ["echarts", "jsPlumb", "vs/editor/editor.main"],
        vue: ["$echarts", "", "monaco"]
    }
};
