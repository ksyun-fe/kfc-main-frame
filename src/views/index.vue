<template>
    <div>
        <div class="ccb-frame-content">
            <div class="ccb-frame-box">
                您访问的内容不存在!
                <p>
                    <a class="ccb-frame-a" href="#/console/overview">点击返回首页</a>
                </p>
            </div>

        </div>
    </div>
</template>

<script>
    export default {
        name: "",
        components: {

        },
        data() {
            return {}
        },
        mounted(){
        },
        methods: {

        }
    }
</script>

<style scoped>
    .ccb-frame-content{
        padding: 20px;
        padding-top: 200px;
        margin: 20px;
        background-color: #fff;
        font-size: 20px;
        height: calc(100vh - 90px);
    }
    .ccb-frame-box{
        width: 200px;
        margin: 0 auto;
    }
    .ccb-frame-a{
        font-size: 14px;
    }
</style>
