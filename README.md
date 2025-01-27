# Sequilize　の検索条件の検証

sequilizeのWHERE句の記述に関する検証。
データベースはSQLite3を使用している。

## 依存パッケージのインストール

```bash
npm install
```

## データベースのセットアップ

以下のコマンドでデータベースをセットアップする。

テーブルと検証用のデータが作成される。

```
npm run setup
```

## 動作確認

以下のコマンドで検証を行う。

次の入力を求められる。

- ユーザーの選択
- 商品分類名の入力

```
npm run start
Executing (default):
SELECT
  `id`,
  `name`,
  `email`,
  `createdAt`,
  `updatedAt`
FROM
  `Users` AS `User`;
✔ ユーザーを選んでください 1: Jeanette Bosco
✔ 商品分類名を入力してください Games
```
