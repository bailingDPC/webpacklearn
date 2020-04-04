export function createBtn(root){
    let el = document.createElement("button");
    el.innerText = "新建元素";
    root.appendChild(el);
    el.onclick = function(){
        let el1 = document.createElement("p");
        el1.innerText = "新元素内容 模块热更新 二次更新 变化恒大";
        el1.classList.add('newcon');
        root.appendChild(el1);
    }
}