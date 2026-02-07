
# BSW (Bedrock Server Wrapper)

BSW は Node.js ベースの BDS (Bedrock Dedicated Server) 管理ツールです。サーバー設定の同期、ログ収集、バックアップ、自動通知、Web ダッシュボード、WebSocket コンソールなどを提供します。

ちなみにめっちゃ自分用です()

## 概要
- server.properties の同期
- チャットログ・死亡ログの収集
- Discord への通知（設定時）
- 自動バックアップ（差分）
- Web ダッシュボードと REST API
- WebSocket によるリアルタイムログ/コマンド送信

## ドキュメント
- API: [docs/API.md](docs/API.md)
- WebSocket: [docs/Websocket.md](docs/Websocket.md)
- プラグイン開発: [docs/Plugins.md](docs/Plugins.md)

## 必要条件
- Node.js 18 以上
- BDS（Bedrock Dedicated Server）をローカルに配置しておくこと

## セットアップ
1. 依存パッケージをインストール

```bash
npm install
```

2. BDS をダウンロードし、リポジトリルートに `bds` フォルダを置く
3. `bds/worlds/world` を作成（ワールド配置用）

## 設定
- `config.js`：BSW の動作設定（WebUI, Discord, backup 等）
- `.env`：BDS の `server.properties` に対応する環境変数（`server-name`, `gamemode`, `level-name` など）

（既存の README のサンプル `config.js` / `.env` 設定はこのリポジトリ内に含まれています）

## 起動

```bash
npm start
```

デフォルトでは WebUI は `config.js` の `webUi.port`（デフォルト 3000）で起動します。

## プラグイン
プラグインは `plugins/` フォルダに配置します。例は `plugins/sample.js` を参照してください。

プラグインの基本:
- `enable: true|false`
- `name: "pluginName"`
- `onLoad(api)` があればロード時に呼ばれます
- `plugin[event](data)` のようにログイベントを受け取れます（例: `PlayerJoin`, `chat` など）

詳細は [docs/Plugins.md](docs/Plugins.md) を参照してください。