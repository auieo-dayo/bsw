const chalk = require("chalk")

let api
module.exports = {
    enable: false,
    name: "sample",
    onLoad(_api) {
        console.log(chalk.bgRed("サンプルプラグインが入っています！"));
        api = _api
    },
//   イベント名はログファイルのtype、引数はログそのまま
    PlayerJoin(json) {
        const player = json.data
        // {"type":"PlayerJoin","data":"BotPlayer","time":1770277841000}
        console.log(player + " joined");
        // マイクラ側のみにチャットを送る
        api.sendChat.mc(`Hello [${player}]!`)
        // ディスコード側のみにチャットを送る
        api.sendChat.discord(`Hello [${player}]!`)
        // 両方に送信。
        api.sendChat.send(`Player joined.`)
        // [{"name":"","tags":["",...]},...](tagsは場合によってはない場合もあり)
        api.getPlayerList()
        // コマンドを送信
        api.sendCommand(`execute as "${player}" at @s run summon chicken ~~~`)

    
        // {
            //   "allbackup": 77,
            //   "today": 2,
            //   "todaybackuplist": [
            //     {
            //       "fullpath": "2025/12/20/10-27-39",
            //       "date": {
            //         "yyyy": 2025,
            //         "MM": 12,
            //         "dd": 20,
            //         "hh": 10,
            //         "mm": 27,
            //         "ss": 39
            //       },
            //       "fullpathja": "2025年12月20日 10時27分39秒",
            //       "full": false
            //     },
            //     {
            //       "fullpath": "2025/12/20/23-36-49_FULL",
            //       "date": {
            //         "yyyy": 2025,
            //         "MM": 12,
            //         "dd": 20,
            //         "hh": 23,
            //         "mm": 36,
            //         "ss": 49
            //       },
            //       "fullpathja": "2025年12月20日 23時36分49秒 (FULL)",
            //       "full": true
            //     }
            //   ]
            // }
        api.getBackupList(false)
},

    chat(json){
        const {data,player,message,source,time} = json
        console.log(`${player}:${message} | [${source}]`)
    }
};

