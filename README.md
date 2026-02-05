
# **BSW**

「統合版マイクラサーバーを作ったけど、何か物足りない…」  
そんな経験、ありませんか？

## **BSWとは**
BSW(Bedrock Server Wrapper)はNode.js製の、**BDS(Bedrock Dedicated Server)用サーバー管理ツール**です。

## **できること**
- `server.properties` の同期  
- チャットログ・死亡ログの収集※1  
- Discordにチャットログ・死亡ログを送信※1  
- Discordにサーバーの起動・停止を通知※2  
- 自動バックアップ（差分）  
- Webダッシュボード  
- サーバー情報のAPI取得  
- WebSocketでコンソール操作  

※1 ワールドの実験的機能「ベータAPI」が有効である必要があります  
※2 サーバーで例外エラーが発生した場合、Discordに通知されることがあります

## **必要条件**
- OS: Ubuntu 22.04 LTS以降  
- Node.js: 18以降  
- BDS: 1.21.131.1以降  

## **セットアップ方法**
1. パッケージをインストール  
```bash
npm install
````

2. [BDSをダウンロード](https://www.minecraft.net/ja-jp/download/server/bedrock)し、新しく `bds` フォルダを作成して解凍
3. `bds` の中に `worlds` フォルダを作成、その中にさらに `world` フォルダを作成

## **設定について**

BSWを正しく動作させるには、`config.js` と `.env` の設定が必要です。  
以下はサンプルで、適用するにはそれぞれ `config.js` / `.env` に名前を変更してください。

---

### **config.jsの設定例**
#### config.jsはBSWの動作全般を管理する設定です


```javascript
// これはサンプル用コンフィグファイルです。
// 適用するにはファイル名を config.js にしてください
const config = {
    "Discord": {
        "TOKEN": "",            // ディスコードBotトークン
        "enabled": false,       // Discord通知を有効化するか
        "notifications": {
            "chat": {
                "enabled": true,       // チャット通知の有効化
                "playerDeath": true,   // プレイヤー死亡通知
                "channelId": ""        // 送信するチャンネルID
            },
            "serverStatus": {
                "enabled": true,       // サーバー状態通知の有効化
                "channelId": ""        // 送信するチャンネルID
            }
        },
    },
    "backup": {
        "interval": 30,            // 自動バックアップ間隔(分)
        "pauseIfNoPlayer": true,   // 人がいないときにバックアップを停止
        "skipForPlayers": []       // このプレイヤーだけの場合バックアップをスキップ
    },
    "webUi": {
        "port": 3000,              // Webダッシュボードのポート
        "username": "admin",       // WebUIログインユーザー名
        "password": "admin"        // WebUIログインパスワード
    },
    "lastLocationLog": {
        "saveLocationLog": false,  // 退出時に座標を自動保存するか
        "CouchDB": {               // CouchDBの設定
            "baseurl": "https://example.com",
            "dbname": "lastlocation",
            "user": {
                "name": "admin",
                "pass": "admin"
            }
        }
    }
}
module.exports = config

```

> 注意: パスワードやDiscordトークンは絶対に公開リポジトリに置かないようにしてください。


### **.envの設定例**
#### .envはBDSのサーバー設定を直接上書きします

```env
# これはサンプル用envファイルです。
# 適用するにはファイル名を .env にしてください

server-name=BSWserver       # サーバー名
gamemode=survival            # ゲームモード: survival, creative, adventure
difficulty=normal            # 難易度: peaceful, easy, normal, hard
allow-cheats=true            # チートの有効化
max-players=20               # 最大プレイヤー数
server-port=19132            # IPv4ポート
server-portv6=19133          # IPv6ポート
level-name=world             # ワールド名
level-seed=                  # ワールドシード（空欄でも可）
```

## **サーバーの起動方法**

BSWを起動するには、以下の手順を実行してください。

1. 必要なパッケージをインストール
```bash
npm install
````

2. サーバーを起動

```bash
npm start
```

* `npm start` は内部で `node main.js` を実行するよう設定されています
* 正常に起動するとターミナルにログが表示されます

3. Webダッシュボードにアクセス

* ブラウザで以下にアクセスします

```
http://localhost:3000
```

* `config.js` の `webUi.username` と `webUi.password` を使ってログイン

4. Discord通知を設定している場合

* config.jsでTOKENと通知チャンネルIDを設定
* チャットや死亡ログ、サーバー起動/停止の通知が送信されます

---

### **簡単な使い方の例**

* サーバーの起動: `npm start`
* チャットログ確認: Discord通知が有効なら指定チャンネルに表示/無効ならWebUIのコンソールに表示されます
* プレイヤー死亡通知: Discord通知でプレイヤー死亡を確認/無効ならWebUIのコンソールに表示されます

> ⚠ 注意: サーバーを終了する場合はターミナルからCtrl+Cで停止してください
> 正常に停止しないとバックアップやログが正しく保存されない場合があります

```

