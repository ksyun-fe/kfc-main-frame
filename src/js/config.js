const getDownPath = (name) => {
    const defaultPath = '/main/static/js/';
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
        //vue引入的配置名
        vue: ["$echarts", "", "monaco"]
    }
};
