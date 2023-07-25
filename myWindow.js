const {BrowserWindow} = require("electron")

const defaultWidth = 800
const defaultHeight = 600

class MyWindow extends BrowserWindow {
    // config：自定义的BrowserWindow配置
    // filePath：加载的html文件地址
    constructor(config, filePath) {
        const basicConfig = {
            width: defaultWidth,
            height: defaultHeight,
            show: false, // 不自动显示
            // frame: false, // 去除窗口默认边框，自己实现
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        }
        // 合并两个 config，若有相同配置则后覆盖前
        const finalConfig = {...basicConfig, ...config}
        super(finalConfig)
        this.loadFile(filePath)
        // 当页面准备就绪在显示，once：只会执行一次
        this.once('ready-to-show', () => {
            this.show()
        })
    }
}

module.exports = MyWindow