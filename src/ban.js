const fs = require("fs-extra")
const path = require("path")

class BanManager {
    constructor(root) {
        try {
            this.cache = new Map()

            const folder = path.join(root, "datas")
            const filename = "bans.json"
            const fullpath = path.join(folder, filename)
            this.path = { folder, filename, fullpath }

            fs.ensureDirSync(this.path.folder)
            if (!fs.existsSync(this.path.fullpath)) fs.writeFileSync(this.path.fullpath,`[]`);
            this.unban = this.pardon
            this.load()
        } catch(e) {
            console.log(`[BanManager]Initialization - ${e}`)
        }
    }
    load() {
        const json = JSON.parse(fs.readFileSync(this.path.fullpath))
        Object.entries(json).forEach(([gamertag, data]) => {
            this.cache.set(gamertag, data);
        });
    }
    save() {
        fs.writeFileSync(this.path.fullpath,JSON.stringify(Object.fromEntries(this.cache),null,2))
    }
    ban(gamertag,reason="",author,expiredtime) {
        if (!gamertag) return
        this.cache.set(gamertag,{gamertag,reason,author,time:Date.now(),expiredtime: expiredtime || null})
        this.save()
        return {gamertag,reason}
    }
    pardon(gamertag) {
        const data = this.cache.get(gamertag)
        if (!data) return {delete:false}
        const del = this.cache.delete(gamertag)
        this.save()
        return {delete:del,gamertag:data.gamertag,reason:data.reason,time:data.time,author:data.author}
    }
    isbanned(gamertag) {
        const has = this.cache.has(gamertag)
        if (!has) return false
        // BANされている場合は一度詳細を取得
        const info = this.getinfo(gamertag)
        const {expiredtime} = info
        // 有効期限がない場合はスキップ
        if (!expiredtime) return true
        // 有効期限が切れている場合はBAN解除
        if (expiredtime <= Date.now()) {
            this.pardon(gamertag)
            return false
        }
        return true
    }
    getinfo(gamertag) {
        return this.cache.get(gamertag) || null;
    }
    allbanlist() {
        return [...this.cache.values()]
    }

}
module.exports = BanManager