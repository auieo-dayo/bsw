# プラグイン開発ガイド

このドキュメントは、`plugins/` フォルダに配置する BSW 用プラグインの基本仕様をまとめたものです。

## 基本構成

- 各プラグインは CommonJS モジュールとして `module.exports = { ... }` をエクスポートします。
- 必要となるプロパティ例:
  - `enable`: true/false（false の場合ロードされません）
  - `name`: プラグイン名（任意）
  - `onLoad(api)`: プラグイン読み込み時に呼ばれる初期化関数
  - イベントハンドラ: `PlayerJoin`, `chat` など、ログの `type` 名に対応する関数を定義できます

## エントリポイント例

```javascript
module.exports = {
  enable: true,
  name: "sample",
  onLoad(api) {
    // 初期化処理。api は読み取り専用です。
  },
  PlayerJoin(json) {
    // ログイベント受信例
  },
  chat(json) {
    // チャットログ受信例
  }
}
```

## 利用可能な API

プラグインが受け取る `api` は読み取り専用（freeze）で渡されます。主なメソッド:

- `api.snedChat(name, msg)`
  - Discord などへサンプル通知を送るユーティリティ（コード上の名前は `snedChat` のままです）
- `api.getPlayerList()`
  - 現在オンラインのプレイヤー情報配列を返します
- `api.getBackupList(getAllBackupList=false)`
  - バックアップ一覧を取得します。引数に `true` を渡すと全期間を取得する実装です
- `api.sendCommand(cmd, isHidden=false)`
  - サーバーにコマンドを送信します

（注）将来 API 名が変更される可能性があります。プラグイン実装時はリポジトリ内の `src/pluginManager.js` と `plugins/sample.js` を参照してください。

## イベントハンドリング

- ログファイルに書き込まれる `type` フィールド名をそのままイベント名として受け取れます。
  例: `PlayerJoin`, `PlayerLeave`, `chat`, `death`, `BDS`, `server` など。
- 各ハンドラはログ JSON 全体を引数に受け取ります。

## 例: `plugins/sample.js` の簡易説明

- 読み込み時に起動メッセージを表示し、`PlayerJoin` イベントで挨拶メッセージを `api.snedChat` で送信します。
