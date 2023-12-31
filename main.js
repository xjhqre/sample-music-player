const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const MusicDataStore = require('./renderer/musicDataStore')
const MyWindow = require('./myWindow')

const musicDataStore = new MusicDataStore({
    // 设置存储文件名为 music data.josn
    'name': 'music data'
})

function createWindow() {
    // 创建主窗口
    const mainWindow = new MyWindow({}, 'renderer/index.html')

    // 初始化加载音乐列表
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('render-musicList-message', musicDataStore.getTracks())
    })

    // 监听打开添加音乐按钮消息，创建一个添加音乐窗口
    let addWindow = null
    ipcMain.on('open-add-music-window-message', () => {
        addWindow = new MyWindow({
            parent: mainWindow,
            // 在父窗口居中创建新窗口
            x: mainWindow.getPosition()[0],
            y: mainWindow.getPosition()[1]
        }, './renderer/add.html')

        addWindow.on('close', () => {
            addWindow = null
        })
    })

    // 监听选择音乐按钮发送的消息，打开文件选择对话框
    ipcMain.on('open-file-select-dialog-message', (event) => {
        // 打开选择文件对话框，具体查看Electron官方文档api
        dialog.showOpenDialog({
            // openFile：允许选择文件
            // multiSelections：允许多选
            properties: ['openFile', 'multiSelections'],
            // 过滤音乐文件
            filters: [{name: 'Music', extensions: ['wav', 'mp3', 'wma', 'flac']}]
        }).then(result => {
            // 返回选中的文件路径
            event.sender.send('selected-music-path', result.filePaths)
        }).catch(err => {
            console.log(err)
        })
    })

    // 监听保存音乐数据消息，本地化存储选择的音乐
    ipcMain.on('import-music-message', (event, musicFilePathList) => {
        const updatedTracks = musicDataStore.addToTracks(musicFilePathList).getTracks()
        mainWindow.webContents.send('render-musicList-message', updatedTracks)
        // 关闭添加音乐窗口
        addWindow.close()
        mainWindow.focus()
    })

    // 监听删除音乐消息
    ipcMain.on('delete-music-message', (event, musicId) => {
        // 弹出对话框确认是否关闭
        dialog.showMessageBox({
            type: 'question',
            title: '确认删除',
            message: '你确定要删除选择的音乐吗？',
            buttons: ['是', '否'],
            defaultId: 0,
            cancelId: 1,
            noLink: true,
        }).then(({response}) => {
            if (response === 0) {
                const updatedMusicList = musicDataStore.deleteTrack(musicId).getTracks()
                mainWindow.webContents.send('render-musicList-message', updatedMusicList)
            }
        });
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