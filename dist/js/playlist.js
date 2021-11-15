/**
 * 播放列表模块：
 * 1. 根据请求数据渲染播放列表
 * 2. 上拉显示播放列表
 * 3. 下滑隐藏播放列表
 * 4. 根据索引显示正在播放或暂停的音乐
 */
;
(root => {
    const playingClassStyle = 'active'; // 播放列表中正在播放的类样式

    class PlayList {
        constructor(datas, wrap) {
            // 创建元素
            const list = document.createElement('div'),
                dl = document.createElement('dl'),
                dt = document.createElement('dt'),
                close = document.createElement('div');
            // 添加元素
            wrap.appendChild(list);
            list.appendChild(dl);
            list.appendChild(close);
            dl.appendChild(dt);
            // 添加文本内容
            dt.innerText = '播放列表';
            close.innerText = '关闭';
            // 添加样式
            list.classList.add('list');
            close.classList.add('close');
            // 包含音乐项dom元素，用于外界点击播放
            this.musicList = datas.reduce((arr, data, index) => {
                const dd = document.createElement('dd');
                dd.innerText = data.name;
                dl.appendChild(dd);
                arr.push(dd);
                return arr;
            }, []);

            this.list = list;
            this.close = close;
        }
        // 上拉显示播放列表
        showUp() {
            this.list.style.transform = 'translateY(0)';
        }
        // 下拉隐藏播放列表
        hideDown() {
            this.list.style.transform = 'translateY(100%)';
        }
        // 根据索引，在播放列表中显示当前状态的音乐
        showPlayingStyle(index) {
            this.musicList.forEach(oMusic => oMusic.classList.remove(playingClassStyle));
            this.musicList[index].classList.add(playingClassStyle);
        }
    }

    root.PlayList = PlayList;
})(window.player || (window.player = {}));