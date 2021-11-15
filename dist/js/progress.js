/**
 * 1. 进度条
 * 2. 拖拽
 */
;
(root => {
    // 进度条
    class Progress {
        totalTime = 0; // 歌曲总时间，秒
        curTime = 0; //歌曲当前播放时间，秒
        frameTimer = null; // 定时器
        lastPlayTime = 0; // 记录上一次播放时间，毫秒
        constructor() {
            this.init();
        }
        // 初始化
        init() {
            this.getDom();
        }
        // 获取页面dom
        getDom() {
            this.oCurTime = document.querySelector('.curTime');
            this.oTotalTime = document.querySelector('.totalTime');
            this.oCircle = document.querySelector('.circle');
            this.oFrontBg = document.querySelector('.frontBg');
        }
        // 将歌曲时间渲染到页面
        renderMusicTime(time) {
            // time是秒数
            this.totalTime = time;
            this.oTotalTime.innerText = this.formatTime(time); // 总时间
        }
        // 格式化歌曲时间，秒
        formatTime(time) {
            time = Math.round(time); // 四舍五入取整，时间为整数
            let m = Math.floor(time / 60);
            let s = time % 60;

            m = m < 10 ? `0${m}` : m;
            s = s < 10 ? `0${s}` : s;
            return m + ':' + s;
        }
        // 移动小圆点、盒子宽度、当前播放时间
        move(startPercent) {
            // 在开启定时器前先清除定时器
            cancelAnimationFrame(this.frameTimer);
            // 记录开始播放的时间戳
            let startTime = new Date().getTime();
            // 从指定时间段开始
            this.lastPlayTime = startPercent === undefined ? this.lastPlayTime : startPercent * this.totalTime * 1000;
            // 每一帧动画播放音乐的百分比
            const frame = () => {
                // 这一帧动画末时间戳
                let endTime = new Date().getTime();
                let percent = (endTime - startTime + this.lastPlayTime) / (this.totalTime * 1000);
                if (percent <= 1) {
                    // 歌曲播放未结束，更新当前播放时间、小圆点位置、前背景宽度
                    this.update(percent);
                } else {
                    // 歌曲播放结束，清除定时器
                    cancelAnimationFrame(this.frameTimer);
                }
                this.frameTimer = requestAnimationFrame(frame);
            };
            frame();
        }
        // 更新播放时间、前背景宽度、小圆点位置
        update(percent) {
            // 更新当前播放时间
            this.curTime = this.totalTime * percent;
            this.oCurTime.innerText = this.formatTime(this.curTime);
            // 更新前背景宽度
            this.oFrontBg.style.width = `${percent*100}%`;
            // 更新小圆点位置
            this.oCircle.style.transform = `translateX(${this.oCircle.offsetParent.clientWidth*percent}px)`;
        }
        // 停止
        stop() {
            cancelAnimationFrame(this.frameTimer);
            this.lastPlayTime = this.curTime * 1000;
        }
    }
    // 实例化Progress
    function instanceProgress() {
        return new Progress();
    }
    // 拖拽
    class Drag {
        startPointX = 0; // 按下时小圆点位置
        fixedDistance = 0; // 固定距离
        percent = 0; // 进度条移动百分比
        constructor(dom) {
            this.dom = dom; // 拖拽的元素
            this.init();
        }
        init() {
            // 为了在未播放时能，获取小圆点位置值
            this.dom.style.transform = 'translateX(0)';
            // 拖拽开始：按下
            this.dom.addEventListener('touchstart', e => {
                // 小圆点在进度条当前位置
                this.startPointX = parseFloat(this.dom.style.transform.split('(')[1]);
                // changedTouches中存储着触发事件的手指，按先后顺序存储
                this.fixedDistance = e.changedTouches[0].pageX - this.startPointX;
                // 暴露给外界
                this.start && this.start();
                e.preventDefault();
            }, false);
            // 拖拽中：移动
            this.dom.addEventListener('touchmove', e => {
                // 小圆点在进度中移动到的位置
                let disX = e.changedTouches[0].pageX - this.fixedDistance;
                // 边界处理
                const progressLen = this.dom.offsetParent.clientWidth;
                disX = disX < 0 ? 0 : disX;
                disX = disX > progressLen ? progressLen : disX;
                // 小圆点移动到的位置，占进度条的百分比
                this.percent = disX / progressLen;
                // 暴露给外界
                this.move && this.move(this.percent);
                e.preventDefault();
            }, false);
            // 拖拽结束：松开
            this.dom.addEventListener('touchend', e => {
                // 暴露给外界
                this.end && this.end(this.percent);
                e.preventDefault();
            }, false);
        }
    }
    // 实例化Drag
    function instanceDrag(dom) {
        return new Drag(dom);
    }
    // 暴露
    root.progress = {
        instanceProgress,
        instanceDrag
    }
})(window.player || (window.player = {}));