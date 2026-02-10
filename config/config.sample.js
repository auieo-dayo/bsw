// これはサンプル用コンフィグファイルです。
// コンフィグを適用するにはファイル名をconfig.jsに変えてください。
const config = {
    // BSWの標準出力に出すものを選択
    "console": {
        // チャットを標準出力に表示
        "chatLogToConsole": true,
        // 死亡ログを標準出力に表示
        "deathLogToConsole": true,
        // バックアップログを標準出力に表示
        "backupLogToConsole": true,
        // その他のBSW関係を標準出力に表示
        "bswSystemLogToConsole": true,
        // プレイヤーの参加を標準出力に表示
        "joinPlayerLogToConsole": true,
        // プレイヤーの退出を標準出力に表示
        "leavePlayerLogToConsole": true
    },
    "Discord": {
        // ディスコードBotトークン
        "TOKEN":"",
        // ディスコードを有効化するか
        "enabled":false,
        // ディスコードにBDSの情報を送信するか
        "notifications": {
            "chat": {
                // チャットを送受信するか
                "enabled": true,
                // プレイヤーの死亡を通知するか
                "playerDeath": true,
                // 送受信するチャンネルID
                "channelId": ""
            },
            "serverStatus": {
                // プレイヤー数が閾値を超えたら通知するか
                "enabled": true,
                // 通知するチャンネルID
                "channelId": ""
            },
            "playerInfoToAdmin": {
                // 管理者用チャンネルからプレイヤーの簡単な情報を取得できるようにするか
                "enabled": true,
                // 管理者用チャンネルID
                "channelId": "",
                // プレフィックスの設定 (デフォルトだと?p Playerか?playerinfo Playerで取得)
                "prefix": ["?p","?playerinfo"]
            },
            "deathInfoToAdmin": {
                // 管理者用チャンネルからプレイヤーの簡単な情報を取得できるようにするか
                "enabled": true,
                // 管理者用チャンネルID
                "channelId": "1456623336925958360",
                // プレフィックスの設定 (デフォルトだと?d Playerか?deathinfo Playerで取得)
                "prefix": ["?d","?deathinfo"]
            }
        },
    },
    "backup": {
        // 自動バックアップの間隔を設定します(分)
        "interval": 30,
        // 人がいないときに自動バックアップを止めるかどうか
        "pauseIfNoPlayer": true,
        // このプレイヤーだけの場合、バックアップをスキップ(pauseIfNoPlayerがtrueの場合のみ)
        "skipForPlayers": []
    },
    "webUi": {
        "port": 3000,
        "username":"admin",
        "password":"admin"
    },
    // 退出時に座標を自動で保存
    "lastLocationLog": {
        // 座標を自動で保存するかどうか
        "saveLocationLog": false,
        // CouchDBの設定
        "CouchDB": {
            // ベースのDBのURL
            "baseurl": "https://example.com",
            // DBの名前
            "dbname": "lastlocation",
            // DBの管理者ユーザーの設定
            "user": {
                "name": "admin",
                "pass": "admin"
            }
        }
    },
    // 死亡時に座標ログを保存
    "deathLocationLog": {
        // 座標を自動で保存するかどうか
        "saveDeathLocationLog": false,
        // CouchDBの設定
        "CouchDB": {
            // ベースのDBのURL
            "baseurl": "https://example.com",
            // DBの名前
            "dbname": "deathlocation",
            // DBの管理者ユーザーの設定
            "user": {
                "name": "admin",
                "pass": "admin"
            }
        }
    }
}
module.exports = config