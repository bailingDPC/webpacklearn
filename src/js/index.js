import "@babel/polyfill";

import { createHeader } from "./header";
import { createContent } from "./content";
import { createSiderbar } from "./siderbar";
import { createImg } from "./image";
import { createBtn } from "./createBtn";
import { add } from "./math";

import img from "../images/9.jpeg";
import "../font/iconfont.css";
import "../css/index.css";

console.log("img变量类型:" + typeof img + ":" + img);
add(3, 6);


let root = document.querySelector('body');

let arr = [1,3,4,5,6,6,34,67,7,23,83];
let pro = new Promise(()=>{
    console.log("你好 世界");
});

createHeader(root);
createSiderbar(root);
createContent(root);
createImg(root, img);
createBtn(root);

function getComponent(){
    //魔法注释
    return import(/* webpackChunkName:"lodash" */'lodash').then(({default: _}) => {
        let ele = document.createElement("div");
        ele.innerText = _.join(["a", "b", "c"], "****");
        return ele;
    })
}
document.addEventListener("click", ()=> {
    getComponent().then((ele) => {
        document.body.appendChild(ele);
    });
});

//模块热更新
if(module.hot){
    module.hot.accept('./createBtn.js', ()=>{
        createBtn(root);
    })
}