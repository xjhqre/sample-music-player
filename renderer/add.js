// 配置了 nodeIntegration: true 可以使用以下语句
const { ipcRenderer } = require('electron')
const path = require('path')

// 点击选择音乐按钮事件，打开文件选择对话框
document.querySelector('#select-music').addEventListener('click', () => {
    ipcRenderer.send('open-file-select-dialog-message')
})

// 监听主进程选择的音乐文件路径
let musicFilePathList = []
ipcRenderer.on('selected-music-path', (event, filePathList) => {
    musicFilePathList = filePathList
    const musicList = document.querySelector('#musicList')
    // html初始值为‘’，将每次拼接的值加到html末尾，最后返回
    const musicItemsHTML = filePathList.reduce((html, filePath) => {
        html += `<li class="list-group-item">${path.basename(filePath)}</li>`
        return html
    }, '')
    musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
})

// 点击导入音乐按钮事件，向主进程发送保存音乐数据的消息
document.querySelector('#import-music').addEventListener('click', () => {
    ipcRenderer.send('import-music-message', musicFilePathList)
})