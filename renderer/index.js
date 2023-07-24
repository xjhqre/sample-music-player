 // 发送打开添加音乐窗口消息给主进程
 document.querySelector('#open-add-music-window').addEventListener('click', () => {
     window.electronAPI.openAddMusicWindow();
 })