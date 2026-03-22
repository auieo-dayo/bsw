# プラグイン開発ガイド

このドキュメントは、`plugins/` フォルダに配置する BSW 用プラグインの基本仕様をまとめたものです。

## 基本構成

各プラグインは CommonJS モジュールとして `module.exports` をエクスポートします。

### 必須プロパティ

- `enable`: boolean（`true` のみロードされます）
- `name`: string（プラグイン名）
- `onLoad(api)`: function（読み込み時に一度だけ呼ばれる初期化関数）

### イベントハンドラ

ログファイルの `type` フィールド値に対応するメソッドを定義することで、イベントを受け取れます。
各ハンドラはログ JSON 全体を引数に受け取ります。

**主なイベント例**: `PlayerJoin`, `PlayerLeave`, `chat`, `death`, `server` など

## エントリポイント例

```javascript
module.exports = {
  enable: true,
  name: "sample-plugin",
  onLoad(api) {
    // 初期化処理
    console.log("Plugin loaded!");
  },
  
  PlayerJoin(json) {
    // PlayerJoin イベント処理
  },
  
  chat(json) {
    // chat イベント処理
  }
};
```

## 利用可能な API

プラグインが受け取る `api` は読み取り専用（Object.freeze）で渡されます。

### チャット送信: `api.sendChat`

チャットメッセージを送信するオブジェクト。以下の 3 つのメソッドを持ちます:

#### `api.sendChat.mc(msg)`
Minecraft サーバー内のみに `tellraw` でメッセージを送信します。

```javascript
api.sendChat.mc("Hello from plugin!");
```

#### `api.sendChat.discord(msg)` ※非同期
Discord チャンネルのみにメッセージを送信します。設定で無効化されている場合は何もしません。

```javascript
await api.sendChat.discord("Hello from Discord!");
```

#### `api.sendChat.send(msg)` ※非同期
Minecraft と Discord 両方にメッセージを送信します。

```javascript
await api.sendChat.send("Hello to everywhere!");
```

### プレイヤー情報: `api.getPlayerList()`

現在オンラインのプレイヤー情報配列を取得します。
プレイヤーオブジェクトには `name` と `tags` が含まれます。

```javascript
const players = api.getPlayerList();
// [{"name":"Player1","tags":["tag1",...]}, ...]
players.forEach(p => console.log(p.name));
```

### バックアップ: `api.getBackupList(getAllBackupList=false)`

バックアップ一覧を取得します。

- `false`（デフォルト）: 本日のバックアップのみ返す
- `true`: 全期間のバックアップを返す

```javascript
const todayBackups = api.getBackupList(false);
const allBackups = api.getBackupList(true);
// { allbackup, today, todaybackuplist, fullbackuplist (全取得時) }
```

### コマンド実行: `api.sendCommand(cmd, isHidden=false)`

Bedrock Server にコマンドを送信します。

- `cmd`: string（実行するコマンド）
- `isHidden`: boolean（true の場合、ログに表示されません）

```javascript
api.sendCommand(`execute as "${playerName}" at @s run summon chicken ~~~`);
api.sendCommand(`say Hello!`, false);
```

## 実装例

詳細は `plugins/sample.js` を参照してください。以下は基本的な使用例です:

```javascript
const chalk = require("chalk");
let api;

module.exports = {
  enable: true,
  name: "example",
  
  onLoad(_api) {
    api = _api;
    console.log(chalk.bgBlue("Example plugin loaded!"));
  },
  
  PlayerJoin(json) {
    const player = json.data;
    api.sendChat.mc(`Welcome [${player}]!`);
    api.sendCommand(`execute as "${player}" at @s run particle minecraft:heart_particle ~~~`);
  },
  
  chat(json) {
    const { player, message, source } = json;
    console.log(`[${source}] ${player}: ${message}`);
  }
};
```

## 注意事項

- API は `onLoad` と各イベントハンドラ内でのみ利用可能です。
- `api.sendChat.discord()` と `api.sendChat.send()` は非同期操作です。必要に応じて `await` を使用してください。
- プラグインの実装時は `src/pluginManager.js` と `plugins/sample.js` を参照してください。
