//添加";"目的，是为了在压缩代码时容错，避免前面代码没有加";",不影响代码运行
;
(root => {
    root.ajax = (obj = {}) => {
        // 将对象转换为key1=value2&key2=value2格式的字符串
        const toData = (data = null) => {
            if (!data || typeof data !== 'object') {
                return '';
            }
            const arr = [];
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    arr.push(`${key}=${data[key]}`);
                }
            }
            return arr.join('&');
        };
        return new Promise((resolve, reject) => {
            // 参数处理
            let {
                url = './', // 请求url，默认为./
                    type = 'get', // 请求方式，默认为get
                    async = true, // 是否异步请求，默认为true
                        data = null // 请求传递的参数，默认为null
            } = obj;
            // 获取XMLHttpRequest对象,根据浏览器不同处理
            let xhr = null;
            if (window.XMLHttpRequest) { // 标准浏览器
                xhr = new XMLHttpRequest();
            } else { // IE浏览器
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }
            // 根据HTTP请求方式处理
            if (type === 'get') { // get请求
                // 初始化
                data && !url.includes('?') && (url += '?' + toData(data)); // url处理
                xhr.open(type, url, async);
                // 发送请求
                xhr.send();
            } else { // post请求
                // 初始化
                xhr.open(type, url, async);
                // 设置请求头信息
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); //设置http请求头
                // 发送请求
                data = toData(data); //将对象转换为key1=value2&key2=value2格式的字符串传入
                xhr.send(data);
            }
            // 绑定事件，处理响应结果
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    const status = xhr.status;
                    if (status >= 200 && status < 300 || status === 304) {
                        // 正常状态
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        // 不正常状态
                        reject(status);
                    }
                }
            };
        });
    };
})(window);