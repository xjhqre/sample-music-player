// 发送打开添加音乐窗口消息给主进程
document.querySelector('#open-add-music-window').addEventListener('click', () => {
    window.electronAPI.openAddMusicWindow();
})

// 接收渲染音乐列表消息
window.electronAPI.renderMusicList((event, musicList) => {
    const musicListDOM = document.querySelector('#musicList')
    const musicListHTML = musicList.reduce((html, music) => {
        html += `<li class="row music-track list-group-item d-flex justify-content-between align-items-center"><div class="col-10">
                <i class="fas fa-music me-4 text-secondary"></i>
                <b>${music.fileName}</b>
            </div>
            <div class="col-2">
                <i class="fas fa-play me-4"></i>
                <i class="fas fa-trash-alt"></i>
            </div>
        </li>`
        return html;
    }, '')
    const emptyHTML = `<div class="alert alert-primary">音乐列表为空</div>`
    musicListDOM.innerHTML = musicList.length ? `<ul class="list-group">${musicListHTML}</ul>` : emptyHTML
});