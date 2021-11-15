/*
 * @Author: lsx
 * @Date:   2021-05-24 01:47:48
 * @Last Modified by:   smallsky
 * @Last Modified time: 2021-08-29 22:56:24
 */
// 添加";"目的：容错，以防在代码压缩时，前面代码没有加";"
;
(root => {
    /**
     * 高斯模糊算法
     * @param  {[type]} imgData [图片像素点数据]
     * @return {[type]}         [高斯模糊图片像素点数据]
     */
    function gaussBlur(imgData) {
        var pixes = imgData.data;
        var width = imgData.width;
        var height = imgData.height;
        var gaussMatrix = [],
            gaussSum = 0,
            x, y,
            r, g, b, a,
            i, j, k, len;

        var radius = 10;
        var sigma = 5;

        a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
        b = -1 / (2 * sigma * sigma);
        //生成高斯矩阵
        for (i = 0, x = -radius; x <= radius; x++, i++) {
            g = a * Math.exp(b * x * x);
            gaussMatrix[i] = g;
            gaussSum += g;

        }
        //归一化, 保证高斯矩阵的值在[0,1]之间
        for (i = 0, len = gaussMatrix.length; i < len; i++) {
            gaussMatrix[i] /= gaussSum;
        }
        //x 方向一维高斯运算
        for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for (j = -radius; j <= radius; j++) {
                    k = x + j;
                    if (k >= 0 && k < width) { //确保 k 没超出 x 的范围
                        //r,g,b,a 四个一组
                        i = (y * width + k) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
                // console.log(gaussSum)
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
                // pixes[i + 3] = a ;
            }
        }
        //y 方向一维高斯运算
        for (x = 0; x < width; x++) {
            for (y = 0; y < height; y++) {
                r = g = b = a = 0;
                gaussSum = 0;
                for (j = -radius; j <= radius; j++) {
                    k = y + j;
                    if (k >= 0 && k < height) { //确保 k 没超出 y 的范围
                        i = (k * width + x) * 4;
                        r += pixes[i] * gaussMatrix[j + radius];
                        g += pixes[i + 1] * gaussMatrix[j + radius];
                        b += pixes[i + 2] * gaussMatrix[j + radius];
                        // a += pixes[i + 3] * gaussMatrix[j];
                        gaussSum += gaussMatrix[j + radius];
                    }
                }
                i = (y * width + x) * 4;
                pixes[i] = r / gaussSum;
                pixes[i + 1] = g / gaussSum;
                pixes[i + 2] = b / gaussSum;
            }
        }
        //end
        return imgData;
    }
    /**
     * 原理——
     * 1.canvas画布是由像素点组成的。
     * 2.每个像素点是由红、绿、蓝、透明度组成的，值的取值范围：0~255。
     * 3.可以将图片画入canvas指定位置，并指定图片显示的宽度和高度。
     * 4.可以获取canvas指定区域的像素点数据，为类型化数组。
     * 5.可以对获取的像素点数据进行操作。(算法)
     * 5.可以将像素点数据载入到canvas画布中显示。
     * 6.可以将canvas画布转换为Base64格式的图片地址。
     */
    /**
     * 通过canvas修改图片或将图片转换为base64格式
     * @param  {[object]} img [img元素]
     * @param  {[function]} callback [修改图片算法]
     * @return {[object]} [Promise对象，状态数据为base64格式图片地址]
     */
    root.blurImg = (imgSrc, ele) => {
        ele = ele || document.body;
        // 创建图片元素
        const img = new Image();
        // 异步加载图片，能获取到图片的信息
        img.src = imgSrc;
        img.onload = function() {
            // 获取图片本身的宽度和高度
            const imgWidth = img.width,
                imgHeight = img.height;
            // 创建canvas元素
            const canvas = document.createElement('canvas');
            // 设置canvas宽度和高度，比例尺1:1, 这两个值越小越模糊
            canvas.width = 100;
            canvas.height = 100;
            // 获得canvas 2d上下文
            const ctx = canvas.getContext('2d');
            // 将图片画入canvas指定位置，并显示指定宽度和高度
            ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
            // 获取canvas指定区域的像素点数据，类型化数组
            let imgData = ctx.getImageData(0, 0, imgWidth, imgHeight);
            // 使用修改图片算法，修改像素点数据
            imgData = gaussBlur(imgData);
            // 将修改后的像素点数据，画入canvas中指定位置显示
            ctx.putImageData(imgData, 0, 0);
            // 将canvas画布转换为base64格式的图片地址，可以选择图片类型，图片质量：0-1
            const ext = img.src.slice(img.src.lastIndexOf('.') + 1).toLowerCase();
            const base64Url = canvas.toDataURL(`image/${ext==='jpg'?'jpeg':ext}`); // 参数：图片类型, 图片质量
            /**
             * 图片类型，默认值为：image/png, 应该与传入的图片格式对应
             * 图片质量： [0, 1]取值，默认即可
             */
            // 设置元素的背景
            ele.style.backgroundImage = `url(${base64Url})`;
        };
    }
})(window.player || (window.player = {}));