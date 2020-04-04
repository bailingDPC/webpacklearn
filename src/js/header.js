export function createHeader(root) {
    let elHeader = document.createElement('h1');
    elHeader.innerText = '网页内容标题  监听文件变化情况';
    root.appendChild(elHeader);
}