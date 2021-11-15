/**
 * 索引控制：
 * 1. 获取索引
 * 2. 设置索引
 * 3. 上一个索引
 * 4. 下一个索引
 */
;
(root => {
    const index = Symbol('current index');
    const boundary = Symbol('index boundary handler');

    class Index {
        [index] = 0; // 当前索引，私有成员
        constructor(len) {
            this.len = len; // 索引的范围：[0, len-1]
        }
        // 设置当前索引
        setIndex(val) {
            return this[index] = val; // 经典索引处理方式，循环
        }
        // 获取当前索引
        getIndex() {
            return this[index];
        }
        // 边界处理
        [boundary](val) {
            return this[index] = (this[index] + val + this.len) % this.len;
        }
        // 获取上一个索引
        prevIndex() {
            return this[boundary](-1);
        }
        // 获取下一个索引
        nextIndex() {
            return this[boundary](1);
        }
    }

    root.Index = Index;
})(window.player || (window.player = {}));