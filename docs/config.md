# 設定ドキュメント

BSW（Bedrock Server Wrapper）の設定について説明します。設定は `config.js` ファイルで行います。`config.sample.js` をコピーして `config.js` という名前に変更し、カスタマイズしてください。

---

## 1. console（コンソール出力設定）

サーバーの標準出力に表示するログを選択できます。

### プロパティ

| プロパティ               | 型      | 説明                      |
| ------------------- | ------ | ----------------------- |
| `chatLogToConsole`  | boolean | チャットメッセージを標準出力に表示するか |
| `deathLogToConsole` | boolean | プレイヤー死亡ログを標準出力に表示するか |
| `backupLogToConsole` | boolean | バックアップログを標準出力に表示するか |
| `bswSystemLogToConsole` | boolean | BSWシステムログを標準出力に表示するか |
| `joinPlayerLogToConsole` | boolean | プレイヤー参加を標準出力に表示するか |
| `leavePlayerLogToConsole` | boolean | プレイヤー退出を標準出力に表示するか |

### 設定例

```javascript
"console": {
    "chatLogToConsole": true,
    "deathLogToConsole": true,
    "backupLogToConsole": true,
    "bswSystemLogToConsole": true,
    "joinPlayerLogToConsole": true,
    "leavePlayerLogToConsole": true
}
```

---

## 2. Discord（Discord連携設定）

BSWをDiscord Botと連携させて、チャットや通知をDiscordに送信できます。

### メイン設定

| プロパティ | 型      | 説明                   |
| ------ | ------ | -------------------- |
| `TOKEN` | string | Discord Bot トークン   |
| `enabled` | boolean | Discord連携を有効化するか |

### notifications（通知設定）

#### 2.1 chat

ゲーム内チャットとDiscordチャット間の送受信を設定します。

| プロパティ      | 型      | 説明                         |
| ---------- | ------ | -------------------------- |
| `enabled`   | boolean | チャット送受信を有効化するか        |
| `playerDeath` | boolean | プレイヤー死亡を通知するか       |
| `channelId` | string  | チャットを送受信するDiscordチャンネルID |

#### 2.2 serverStatus

サーバーのステータス情報を通知します。

| プロパティ      | 型      | 説明                         |
| ---------- | ------ | -------------------------- |
| `enabled`   | boolean | サーバーステータス通知を有効化するか |
| `channelId` | string  | 通知先のDiscordチャンネルID    |

#### 2.3 toAdmin

管理者用チャンネルの設定です。管理者はこのチャンネルから特定のコマンドを使用できます。

| プロパティ      | 型      | 説明                         |
| ---------- | ------ | -------------------------- |
| `channelId` | string  | 管理者用DiscordチャンネルID   |
| `enabled`   | boolean | 管理者機能を有効化するか        |

##### deathInfo（死亡情報取得）

プレイヤーの死亡情報を管理者チャンネルから取得できます。

| プロパティ    | 型    | 説明                                    |
| -------- | ----- | ------------------------------------- |
| `enabled` | boolean | 死亡情報取得を有効化するか                     |
| `prefix`  | array   | コマンドプレフィックス。例：`?d`, `?deathinfo` |

使用例：`?d PlayerName` または `?deathinfo PlayerName`

##### playerInfo（プレイヤー情報取得）

プレイヤーの基本情報を管理者チャンネルから取得できます。

| プロパティ    | 型    | 説明                                    |
| -------- | ----- | ------------------------------------- |
| `enabled` | boolean | プレイヤー情報取得を有効化するか                 |
| `prefix`  | array   | コマンドプレフィックス。例：`?p`, `?playerinfo` |

使用例：`?p PlayerName` または `?playerinfo PlayerName`

### 設定例

```javascript
"Discord": {
    "TOKEN":"YOUR_BOT_TOKEN_HERE",
    "enabled":true,
    "notifications": {
        "chat": {
            "enabled": true,
            "playerDeath": true,
            "channelId": "123456789012345678"
        },
        "serverStatus": {
            "enabled": true,
            "channelId": "987654321098765432"
        },
        "toAdmin": {
            "channelId": "111111111111111111",
            "enabled": true,
            "deathInfo": {
                "enabled":true,
                "prefix": ["?d","?deathinfo"]
            },
            "playerInfo": {
                "enabled":true,
                "prefix": ["?p","?playerinfo"]
            }
        }
    }
}
```

---

## 3. backup（自動バックアップ設定）

サーバーワールドの自動バックアップを設定します。

### プロパティ

| プロパティ         | 型      | 説明                                   |
| -------------- | ------ | ------------------------------------ |
| `interval`     | number | バックアップの実行間隔（分）                    |
| `pauseIfNoPlayer` | boolean | プレイヤーがいない時にバックアップを停止するか    |
| `skipForPlayers` | array   | 指定ユーザーのみの場合、バックアップをスキップする |

### 設定例

```javascript
"backup": {
    "interval": 30,
    "pauseIfNoPlayer": true,
    "skipForPlayers": ["Player1", "Player2"]
}
```

---

## 4. webUi（Web UI設定）

Web管理画面にアクセスする際の設定です。

### プロパティ

| プロパティ    | 型      | 説明                    |
| --------- | ------ | --------------------- |
| `port`    | number | Web UIのポート番号（デフォルト3000） |
| `username` | string  | ログインユーザー名           |
| `password` | string  | ログインパスワード           |

### 設定例

```javascript
"webUi": {
    "port": 3000,
    "username":"admin",
    "password":"admin"
}
```

---

## 5. lastLocationLog（最後の座標ログ設定）

プレイヤーが退出する際に、その時点での座標を自動で保存します。

### プロパティ

| プロパティ          | 型      | 説明                   |
| -------------- | ------ | -------------------- |
| `saveLocationLog` | boolean | 座標を自動保存するか     |

### CouchDB設定

| プロパティ | 型     | 説明                    |
| ------ | ----- | --------------------- |
| `baseurl` | string | CouchDBのベースURL      |
| `dbname` | string | データベース名           |
| `user.name` | string | CouchDB管理者ユーザー名 |
| `user.pass` | string | CouchDB管理者パスワード |

### 設定例

```javascript
"lastLocationLog": {
    "saveLocationLog": true,
    "CouchDB": {
        "baseurl": "https://couchdb.example.com",
        "dbname": "lastlocation",
        "user": {
            "name": "admin",
            "pass": "password"
        }
    }
}
```

---

## 6. deathLocationLog（死亡時座標ログ設定）

プレイヤーが死亡した際に、その時点での座標を自動で保存します。

### プロパティ

| プロパティ               | 型      | 説明                   |
| -------------------- | ------ | -------------------- |
| `saveDeathLocationLog` | boolean | 座標を自動保存するか     |

### CouchDB設定

| プロパティ | 型     | 説明                    |
| ------ | ----- | --------------------- |
| `baseurl` | string | CouchDBのベースURL      |
| `dbname` | string | データベース名           |
| `user.name` | string | CouchDB管理者ユーザー名 |
| `user.pass` | string | CouchDB管理者パスワード |

### 設定例

```javascript
"deathLocationLog": {
    "saveDeathLocationLog": true,
    "CouchDB": {
        "baseurl": "https://couchdb.example.com",
        "dbname": "deathlocation",
        "user": {
            "name": "admin",
            "pass": "password"
        }
    }
}
```

---

## セットアップ手順

1. `config.sample.js` をコピーしてファイル名を `config.js` に変更します
2. `config.js` をテキストエディタで開き、必要な設定を変更します
3. 特にDiscordボットの場合は、`TOKEN` フィールドにあなたのBot Tokenを入力してください
4. CouchDBを使用する場合は、`baseurl`、`dbname`、ユーザー情報を設定してください
5. 設定が完了したら、BSWを起動すると新しい設定が適用されます
