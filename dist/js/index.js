/**
 * 负责初始化，整合模块:
 * 1. 数据载入
 * 2. 歌曲数据渲染
 * 3. 添加功能
 */
;
((root, player) => {
    const playClassStyle = 'playing';

    class MusicPlayer {
        dataList = []; // 存储请求数据
        indexObj = null; // 管理索引对象
        rotateTimer = null; // 旋转定时器
        playList = null; // 控制播放列表
        progress = player.progress.instanceProgress();
        startTouchTime = 0; // 记录开始点击时间
        lastTouchTime = 0; // 记录最后点击时间
        allowDuration = 300; // 前后两次touch生效的最小时间间隔，ms
        constructor(dom) {
            this.wrap = dom; // wrap容器，用于动态生成播放列表
        }
        /**
         * 初始化音乐播放器:
         * 1. 获取页面dom元素
         * 2. 获取音乐数据
         */
        init() {
            this.getDom();
            this.getData('./../mock/data.json');
        }
        /**
         * 获取页面dom元素：
         * 1. oRecord：歌曲图片，用于播放旋转
         * 2. oControlBtns：音乐播放器功能按钮
         */
        getDom() {
            const [oMusicLike, oMusicPrev, oMusicPlay, oMusicNext, oPlayList] = document.querySelectorAll('.control .icon');
            Object.assign(this, {
                oMusicLike,
                oMusicPrev,
                oMusicPlay,
                oMusicNext,
                oPlayList
            });
            this.oCircle = document.querySelector('.circle');
        }
        /**
         * 请求歌曲数据：
         * 1. 加载歌曲
         * 2. 添加播放器功能
         * 3. 初始化索引对象，管理播放索引
         */
        async getData(url) {
            try {
                this.dataList = await root.ajax({
                    url
                });
                this.playList = new player.PlayList(this.dataList, this.wrap);
                this.indexObj = new player.Index(this.dataList.length);
                this.loadMusic(this.indexObj.getIndex());
                this.addControls();
            } catch (e) {
                console.log(e);
            }
        }
        /**
         * 加载歌曲：
         * 1. 将歌曲信息载入到播放器中
         * 2. 加载歌曲
         * 3. 判断是否应该播放
         */
        loadMusic(index) {
            const data = this.dataList[index];
            const audio = player.audio;

            player.renderMusicInfo(data, () => {
                // 切换音乐：上一首、下一首、点击音乐播放列表直接播放
                if (audio.getPlayStatus() === player.PLAY_STATUS) {
                    audio.play();
                    this.changePlayStyle(true);
                    this.oRecord = null;
                    this.startRotateImg(true);
                    this.progress.move(0);
                }
            });
            audio.load(data.audioSrc);
            this.progress.renderMusicTime(data.duration);


            // 更新播放列表样式
            this.playList.showPlayingStyle(index);
        }
        /**
         * 添加播放功能：
         * 0. 切换喜欢
         * 1. 上一首
         * 2. 播放、暂停
         * 3. 下一首
         * 4. 播放列表
         */
        addControls() {
            // 喜欢
            this.oMusicLike.addEventListener('touchend', () => this.toggleLike(), false);
            // 上一首
            this.oMusicPrev.addEventListener('touchend', () => this.prevMusic(), false);
            // 播放、暂停
            this.oMusicPlay.addEventListener('touchend', () => this.musicPlayToggle(), false);
            // 下一首
            this.oMusicNext.addEventListener('touchend', () => this.nextMusic(), false);
            // 显示播放列表
            this.oPlayList.addEventListener('touchend', () => this.playList.showUp(), false);
            // 隐藏播放列表
            this.playList.close.addEventListener('touchend', () => this.playList.hideDown(), false);
            // 点击播放列表的音乐切换音乐
            this.playList.musicList.forEach((oMusic, index) => {
                oMusic.addEventListener('touchend', (() => {
                    return () => {
                        this.toggleListMusic(index);
                    };
                })(index), false);
            });
            // 音乐播放完成后，自动进入下一首音乐
            player.audio.ended(() => this.nextMusic());
            // 拖拽进度条功能
            this.dragProgress();
        }
        // 根据当前播放状态，改变播放按钮样式
        changePlayStyle(isPlay) {
            const classList = this.oMusicPlay.classList;
            const isExistPlay = classList.contains(playClassStyle);

            if (isPlay) {
                !isExistPlay && classList.add(playClassStyle);
            } else {
                isExistPlay && classList.remove(playClassStyle);
            }
        }
        // 开始旋转图片, 初次播放，angle为0
        startRotateImg(initalPlay = true) {
            clearInterval(this.rotateTimer);

            initalPlay && (this.oRecord = document.querySelector('.songImg img'));
            this.oRecord = this.oRecord || document.querySelector('.songImg img');
            let angle = initalPlay ? 0 : (this.oRecord.dataset.angle || 0); // 歌曲旋转的初始角度

            this.rotateTimer = setInterval(() => {
                angle = +angle + 0.1;
                this.oRecord.style.transform = `rotate(${angle}deg)`;
                this.oRecord.dataset.angle = angle;
            }, 1000 / 60);
        }
        // 暂停旋转图片
        stopRotateImg() {
            clearInterval(this.rotateTimer);
        }
        // 切换歌曲喜欢
        toggleLike() {
            // TODO
        }
        // 上一首歌曲
        prevMusic() {
            // 检测是否有效点击
            if (this.isTouchend()) {
                // 切换到上一首，会自动进行播放
                player.audio.setPlayStatus(player.PLAY_STATUS);
                // 加载歌曲
                this.loadMusic(this.indexObj.prevIndex());
            }
        }
        // 下一首歌曲
        nextMusic() {
            if (this.isTouchend()) {
                // 切换到上一首，会自动进行播放
                player.audio.setPlayStatus(player.PLAY_STATUS);
                // 加载歌曲
                this.loadMusic(this.indexObj.nextIndex());
            }
        }
        // 播放、暂停歌曲
        musicPlayToggle() {
            const audio = player.audio;

            if (audio.getPlayStatus() === player.PLAY_STATUS) {
                audio.pause();
                this.changePlayStyle(false);
                this.stopRotateImg();
                this.progress.stop();
            } else {
                audio.play();
                this.changePlayStyle(true);
                this.startRotateImg(false);
                this.progress.move();
            }
        }
        /**
         * 点击播放列表中音乐：
         * 1. 若点击的是当前状态的音乐，无任何操作。
         * 2. 点击其他列表音乐，开始播放，下拉列表隐藏。
         */
        toggleListMusic(index) {
            // 点击当前状态歌曲, 无任何操作
            if (this.indexObj.getIndex() === index) {
                return;
            }
            // 点击列表其他音乐：开始播放、改变列表样式、下拉隐藏列表
            player.audio.setPlayStatus(player.PLAY_STATUS); // 改变播放状态
            this.loadMusic(index); // 渲染信息、加载音乐、播放音乐、图片旋转
            this.playList.hideDown(); // 下拉隐藏
            this.indexObj.setIndex(index); // 更新索引
        }
        // 拖拽进度条功能
        dragProgress() {
            const that = this;
            const drag = player.progress.instanceDrag(this.oCircle);
            // 拖拽开始
            drag.start = function() {
                // 开始拖拽时停止进度条移动
                that.progress.stop();
            };
            // 拖拽移动
            drag.move = function(percent) {
                // 更新小圆点位置、播放时间、进度条进度
                that.progress.update(percent);
            };
            // 拖拽结束
            drag.end = function(percent) {
                // 歌曲跳转到指定时间
                player.audio.playTo(percent * that.dataList[that.indexObj.getIndex()].duration);
                // 开始播放音乐
                player.audio.play();
                // 改变播放按钮状态
                that.changePlayStyle(true);
                // 开始旋转歌曲图片
                that.startRotateImg(false);
                // 继续移动进度条
                that.progress.move(percent);
            };
        }
        // 检测连续touchend是否是有效touch
        isTouchend() {
            if (!this.lastTouchTime && this.startTouchTime) {
                this.lastTouchTime = new Date().getTime();
                const duration = this.lastTouchTime - this.startTouchTime;

                this.startTouchTime = this.lastTouchTime;
                this.lastTouchTime = 0;

                if (duration >= this.allowDuration) {
                    return true;
                }
                return false;
            }
            this.startTouchTime = new Date().getTime();
            return true;
        }
    }

    const musicPlayer = new MusicPlayer(document.getElementById('wrap'));

    musicPlayer.init();
})(window, window.player);