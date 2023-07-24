const { log } = require('console')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

class MyWindow extends BrowserWindow {
  // config：自定义的BrowserWindow配置
  // filePath：加载的html文件地址
  constructor(config, filePath) {
    const basicConfig = {
      width: 800,
      height: 600,
      show: false, // 不自动显示
      webPreferences: {
        nodeIntegration: true,
        contextIsolation:false
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

function createWindow () {
  // 创建主窗口
  const mainWindow = new MyWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  }, 'renderer/index.html')
  
  // 监听打开添加音乐按钮消息，创建一个添加音乐窗口
  ipcMain.on('open-add-music-window-message', () => {
    const addWindow = new MyWindow({
      parent: mainWindow
    }, './renderer/add.html')
  })

  // 监听选择音乐按钮发送的消息，打开文件选择对话框
  ipcMain.on('open-file-select-dialog-message', (event) => {
    // 打开选择文件对话框，具体查看Electron官方文档api
     dialog.showOpenDialog({
      // openFile：允许选择文件
      // multiSelections：允许多选
      properties: ['openFile', 'multiSelections'],
      // 过滤音乐文件
      filters: [{ name: 'Music', extensions: ['wav', 'mp3', 'wma', 'flac'] }]
     }).then(result => {
      // 返回选中的文件路径
      event.sender.send('selected-music-path', result.filePaths)
    }).catch(err => {
      console.log(err)
    })
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})