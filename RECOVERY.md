# 復旧・作業再開の手順（RECOVERY）— clair veil

困ったとき・久しぶりに作業を再開するときに読むメモです。

## 1. まず読むファイル

| ファイル | 中身 |
|---|---|
| `docs/PROJECT_STATUS.md` | いまの進み具合と、残りの作業 |
| `docs/SPEC.md` | 仕様書（何を作るか） |
| `docs/PLAN.md` | 設計（どう作るか） |
| `docs/CREDITS.md` | 写真の出典 |

Claude Code に頼むときは「`docs/PROJECT_STATUS.md` を読んで、続きをお願い」と伝えればOKです。

## 2. サイトをPCで見る方法

**かんたんな方法:** `index.html` をダブルクリックしてブラウザで開く。
（ほぼすべて動きます）

**確実な方法（確認用サーバー）:** PowerShell（Windowsのコマンド入力画面）でこのフォルダに移動して、次を実行します。

```
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/serve.ps1
```

ブラウザで `http://localhost:8080/` を開きます。止めるときは PowerShell の画面で `Ctrl + C`。

## 3. よくある修正の場所

| 直したいもの | ファイル |
|---|---|
| 料金・所要時間・セット割 | `js/data.js` の `CV.menus` / `CV.discounts` |
| スタッフの名前・ひとこと | `js/data.js` の `CV.staff` |
| ギャラリーのスタイル | `js/data.js` の `CV.styles`（写真は `images/style-番号.jpg`） |
| カラーシミュレーターの色 | `js/data.js` の `CV.colors`（`hex` が色の番号） |
| チャットの会話文 | `js/data.js` の `CV.chat` |
| 色・文字の大きさ・余白 | `css/style.css` の先頭（`:root`） |
| 上部メニュー・フッター | `js/common.js` |

## 4. 壊れてしまったとき

1. **直前の状態に戻したい:** OneDrive の「バージョン履歴」（ファイルを右クリック →「バージョン履歴」）で以前の版に戻せます。
2. **丸ごと戻したい:** バックアップ先 `C:\Users\shiba\OneDrive\デスクトップ\clodecode\clair-veil\` からフォルダごとコピーし直します。
3. **GitHub に上げた後なら:** GitHub 上のファイルが最新の正しい版です。そこからダウンロードし直せます。

## 5. 表示がおかしいときのチェック

- 写真が出ない → `images/` フォルダがあるか、ファイル名が合っているか
- 動き（シミュレーター等）が動かない → `js/` フォルダの中身がそろっているか。ブラウザで F12 キー →「Console」に赤いエラーがないか
- 文字化けする → ファイルを「UTF-8」で保存しているか（メモ帳なら保存時に文字コードを UTF-8 に）

## 6. 守るルール（SPEC より）

- 予約フォーム・チャットの内容は、どこにも送信・保存しない
- 全ページに noindex と「このサイトは制作サンプルです（架空の店舗）」を入れる
- 有料サービスは使わない（必要なら先に相談）
- Git の commit・push は、本人の指示があるときだけ
