export function createImg(root, url) {
    let elImg = document.createElement('img');
    elImg.src=url;
    root.appendChild(elImg);
}