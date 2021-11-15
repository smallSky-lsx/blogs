/**
 * 管理音乐模块：
 * 1. audio实例创建
 * 2. 音乐加载
 * 3. 音乐播放
 * 4. 音乐暂停
 * 5. 音乐当前状态
 * 6. 音乐结束播放事件
 */

;
(root => {
    const status = Symbol('play\'status');
    const PLAY_STATUS = 'play';
    const PAUSE_STATUS = 'pause';

    class AudioManager {
        [status] = 'pause'; // 音乐播放状态，默认值为pause(暂停)，以及play(播放)
        audio = new Audio(); // 创建一个audio实例
        // 加载音乐
        load(musicSrc) {
            this.audio.src = musicSrc;
            this.audio.load();
        }
        // 播放音乐
        play() {
            // Chrome 50才支持play返回promise
            this.audio.play();
            this[status] = PLAY_STATUS;
        }
        // 暂停音乐
        pause() {
            this.audio.pause();
            this[status] = PAUSE_STATUS;
        }
        // 拖放到音乐某个时间点
        playTo(time) {
            this.audio.currentTime = time; // time单位为秒
        }
        // 音乐播放结束触发的事件
        ended(callback) {
            this.audio.onended = callback;
        }
        // 获取播放状态
        getPlayStatus() {
            return this[status];
        }
        // 设置播放状态
        setPlayStatus(value) {
            this[status] = value;
        }
    }
    root.audio = new AudioManager();
    root.PLAY_STATUS = PLAY_STATUS;
    root.PAUSE_STATUS = PAUSE_STATUS;
})(window.player || (window.player = {}));

/*
    错误：audio.js:22 Uncaught (in promise) DOMException: The play() request was interrupted by a new load request.
    在调用audio.play()时，音频文件还未加载完
 */