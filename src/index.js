import Vue from "vue";
import Life from "./Life.vue";

window.life = new Vue({
    el: "#life",
    render: createElement => createElement(Life, {"ref": "life"})
}).$refs.life;
