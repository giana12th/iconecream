# Iconecream

## 目的

プロフィール画像用のアイスクリームアイコン画像を生成できるWebアプリケーション作成

## 方針

- simple is best
- 常に設計と実装を合わせる
- 実装を変更するときは、対応する設計書も更新する

## 技術スタック

bun vite react  
github pagesで公開
CSSファイルなしのインラインスタイル

## ファイル構成

```
src/
├── App.tsx                  # ルート：状態管理・レイアウト
├── components/
│   ├── Header.tsx           # タイトル・説明
│   ├── Preview.tsx          # プレビュー画像表示
│   ├── ColorPickers.tsx     # カラーピッカー2つのコンテナ
│   ├── ColorPickerItem.tsx  # カラーピッカー1つ分
│   ├── DownloadButton.tsx   # ダウンロードボタン
│   ├── AdvancedSettings.tsx # 折りたたみ設定パネル
│   ├── Terms.tsx            # 利用規約
│   └── Footer.tsx           # フッター
├── utils/
│   ├── svg.ts               # replaceSvgColors, svgToDataUrl
│   └── download.ts          # svgToJpgBlob, downloadBlob
├── constants/
│   ├── presets.ts           # PRESET_COLORS, SIZE_PRESETS
│   └── theme.ts             # THEME カラー定数
├── assets/
│   └── icon.svg             # アイスクリームSVG
└── main.tsx                 # エントリーポイント
```

## command

```sh
bun lint
bun dev
```

Claude Codeはプロジェクトのルートディレクトリで起動しています。cdによる実行ディレクトリの変更は不要です。

```sh
# BAD COMMAND
cd /d D:\workspace\iconecream && bun lint
# cd: too many arguments
```

## docs

docsフォルダに設計ドキュメントがまとまっている。
必要に応じて参照してください。

- SPEC.md
- component-design.md
- iconecream-mockup.jsx
- implementation-plan.md
- svg画像仕様.md
- 描画検証用App.tsx
