const {ipcRenderer} = require('electron')
let musicAudio = new Audio()


// 发送打开添加音乐窗口消息给主进程
document.querySelector('#open-add-music-window').addEventListener('click', () => {
    ipcRenderer.send('open-add-music-window-message')
})

// 接收渲染音乐列表消息
let allMusic = []
ipcRenderer.on('render-musicList-message', (event, musicList) => {
    allMusic = musicList
    const musicListDOM = document.querySelector('#musicList')
    const musicListHTML = musicList.reduce((html, music) => {
        html += `<li class="row list-group-item d-flex justify-content-between align-items-center">
            <div class="col-10 namelengthlimit">
                <i class="fas fa-music me-4 text-secondary"></i>
                <b style="cursor: default;" title="${music.fileName}">${music.fileName}</b>
            </div>
            <div class="col-2">
                <i class="fas fa-play me-4" data-id="${music.id}"></i>
                <i class="fas fa-trash-alt" data-id="${music.id}"></i>
            </div>
        </li>`
        return html;
    }, '')
    const emptyHTML = `<div class="alert alert-primary">音乐列表为空</div>`
    musicListDOM.innerHTML = musicList.length ? `<ul class="list-group">${musicListHTML}</ul>` : emptyHTML
});

// 点击播放音乐按钮事件
let lastMusic = null // 上一次播放的音乐数据
let currentMusic = null // 当前正在播放的音乐
document.querySelector('#musicList').addEventListener('click', (event) => {
    event.preventDefault()
    const {dataset, classList} = event.target // 获取点击标签上的自定义属性和样式集合
    // 播放音乐
    if (classList.contains('fa-play')) {
        // 如果上一次播放的音乐未暂停
        if (lastMusic) {
            musicAudio.pause()
            lastMusic.classList.replace('fa-pause', 'fa-play')
        }
        // 播放选中的音乐
        currentMusic = allMusic.find(music => music.id === dataset.id)
        musicAudio.src = currentMusic.path
        musicAudio.play()
        classList.replace('fa-play', 'fa-pause')
        lastMusic = {classList}
    }
    // 暂停音乐
    else if (classList.contains('fa-pause')) {
        musicAudio.pause()
        classList.replace('fa-pause', 'fa-play')
    }
    // 删除音乐
    else if (classList.contains('fa-trash-alt')) {
        ipcRenderer.send('delete-music-message', dataset.id)
    }
})

// 开始渲染播放器状态
musicAudio.addEventListener('loadedmetadata', () => {
    const playerStatusDOM = document.querySelector('#player-status')
    const renderPlayerHTML = `
    <div class="col-8 font-weight-bold" style="white-space: nowrap; overflow: hidden;text-overflow: ellipsis;">
        ${currentMusic.fileName}
    </div>
    <div class="col-4" style="text-align: right; white-space: nowrap; overflow: hidden;text-overflow: ellipsis;">
        <span id="current-seeker">00:00</span> / ${formatTime(musicAudio.duration)}
    </div>`
    playerStatusDOM.innerHTML = renderPlayerHTML
})

function formatTime(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// 更新播放器状态
// 开始渲染播放器状态
musicAudio.addEventListener('timeupdate', () => {
    const seekerDOM = document.querySelector('#current-seeker')
    const processBarDOM = document.querySelector('#processBar')
    seekerDOM.innerHTML = formatTime(musicAudio.currentTime)
    const process = Math.floor(musicAudio.currentTime / musicAudio.duration * 100)
    processBarDOM.style.width = process + '%'
})

// 点击进度条快进音乐
const processBarWrapperDOM = document.querySelector('#processBarWrapper')
processBarWrapperDOM.addEventListener('click', (event) => {
    // 当前未播放音乐则跳过
    if (musicAudio.paused) {
        return
    }
    // 鼠标点击处占进度条的百分比
    // event.clientX：鼠标点击的
    const percentage = (event.clientX - processBarWrapperDOM.getBoundingClientRect().left) / processBarWrapperDOM.offsetWidth
    console.log(percentage)
    musicAudio.currentTime = musicAudio.duration * percentage
})