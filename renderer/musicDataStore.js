const Store = require('electron-store')
const uuid = require('uuid')
const path = require('path')

class DataStore extends Store {
    constructor(props) {
        super(props);
        // 保存的音乐文件的信息
        this.tracks = this.getTracks()
    }

    // 保存音乐信息
    saveTracks() {
        this.set('tracks', this.tracks)
        return this
    }

    // 获取音乐文件信息
    getTracks() {
        return this.get('tracks') || []
    }

    addToTracks(pathList) {
        const newTrackList = pathList.map(musicPath => {
            return {
                id: uuid.v4(),
                path: musicPath,
                fileName: path.basename(musicPath)
            }
        }).filter(track => {
            // 获取已有的音乐路径
            const currentTracksPath = this.getTracks().map(track => track.path)
            // 添加不存在 currentTracksPath 里的 track
            return currentTracksPath.indexOf(track.path) < 0
        })
        this.tracks = [ ...this.getTracks(), ...newTrackList ]
        return this.saveTracks()
    }
}

module.exports = DataStore