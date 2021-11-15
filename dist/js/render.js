/**
 * 渲染模块：
 * 1. body背景图片-高斯模糊
 * 2. 歌曲图片-
 * 3. 歌曲信息-
 * 4. 歌曲是否喜欢-
 */
;
(root => {
    const likeClassStyle = 'liking';

    // 歌曲图片高斯模糊作为body背景图片
    function bodyBgImg(imgSrc) {
        root.blurImg(imgSrc);
    }
    // 歌曲图片
    function musicImg(imgSrc, callback) {
        const oSongImg = document.querySelector('.songImg');
        const oImg = new Image();

        oImg.onload = function() {
            oSongImg.innerHTML = '';
            oSongImg.appendChild(oImg);
            callback && callback();
        }
        oImg.src = imgSrc;
    }
    // 歌曲信息
    function musicInfo(data) {
        const { name, singer, album } = data;
        const [oSingName, oSinger, oAlbum] = document.querySelector('.songInfo').children;

        oSingName.innerText = name;
        oSinger.innerText = singer;
        oAlbum.innerText = album;
    }
    // 歌曲是否喜欢
    function musicIsLike(isLike) {
        const oLike = document.querySelector('.control .icon');
        const classList = oLike.classList;
        const isExistLike = classList.contains(likeClassStyle);

        if (isLike) {
            !isExistLike && classList.add(likeClassStyle);
        } else {
            isExistLike && classList.remove(likeClassStyle);
        }
    }
    root.renderMusicInfo = (data, callback) => { // data为请求的歌曲数据
        const { image, isLike } = data;

        bodyBgImg(image);
        musicImg(image, callback);
        musicInfo(data);
        musicIsLike(isLike);
    };
})(window.player || (window.player = {}));