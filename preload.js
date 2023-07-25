const { contextBridge, ipcRenderer } = require('electron')

// 通过contextBridge将指定的API暴露给渲染进程。
contextBridge.exposeInMainWorld('electronAPI', {
  openAddMusicWindow: () => ipcRenderer.send('open-add-music-window-message'),
  renderMusicList: (musicPathList) => ipcRenderer.on('render-musicList-message', musicPathList),
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
