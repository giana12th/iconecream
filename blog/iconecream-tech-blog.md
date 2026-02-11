# Iconecream: ブラウザAPIだけで作るアイコン画像ジェネレーター

> この記事は Claude Code (Claude Opus 4.6) によって、プロジェクトのソースコードを解析して作成されました。

## はじめに

SNSのプロフィール画像、ちょうどいいものがなかなか見つからない。かといって自分でイラストを描くのはハードルが高い。そんな動機から生まれたのが **Iconecream** ――カラーを選ぶだけでアイスクリームのアイコン画像をJPGでダウンロードできるWebアプリだ。

設計哲学は **「Simple is best」**。依存ライブラリは最小限、CSSファイルはゼロ、画像変換もすべてブラウザAPIで完結させた。この記事では、その技術的な仕組みを紹介する。

## 技術スタック

| 領域 | 技術 |
|------|------|
| ランタイム/パッケージマネージャ | Bun |
| ビルドツール | Vite 7 |
| UIフレームワーク | React 19 + TypeScript 5.9 |
| ホスティング | GitHub Pages |
| スタイリング | インラインスタイルのみ（CSSファイルなし） |

`package.json` の `dependencies` はたった2行だ。

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

画像処理ライブラリもCSS-in-JSライブラリも入れていない。ブラウザが標準で提供するAPIだけで、やりたいことは十分に実現できた。

## アーキテクチャ

### ファイル構成

```
src/
├── App.tsx                  # 状態管理・レイアウト
├── components/
│   ├── Header.tsx           # タイトル・説明
│   ├── Preview.tsx          # プレビュー画像
│   ├── ColorPickers.tsx     # カラーピッカーのコンテナ
│   ├── ColorPickerItem.tsx  # カラーピッカー1つ分
│   ├── DownloadButton.tsx   # ダウンロードボタン
│   ├── AdvancedSettings.tsx # 折りたたみ設定パネル
│   ├── Terms.tsx            # 利用規約
│   └── Footer.tsx           # フッター
├── utils/
│   ├── svg.ts               # SVG操作
│   └── download.ts          # 画像変換・ダウンロード
├── constants/
│   ├── presets.ts           # プリセット色・サイズ
│   └── theme.ts             # テーマカラー
├── assets/
│   └── icon.svg             # アイスクリームSVG
└── main.tsx                 # エントリーポイント
```

### 単方向データフローによる状態管理

状態管理の外部ライブラリは使っていない。すべての状態は `App.tsx` の3つの `useState` に集約している。

```tsx
const [iceColor, setIceColor] = useState(initialPreset.ice);
const [bgColor, setBgColor] = useState(initialPreset.bg);
const [size, setSize] = useState(400);
```

アイスの色、背景色、画像サイズ。たった3つの値が、アプリの状態のすべてだ。これらを子コンポーネントにpropsとして渡す、Reactの基本に忠実な単方向データフローで設計している。

8つのコンポーネントはいずれも小さく、最大でも85行ほど。それぞれが1つの責務だけを持つ。Reduxのようなグローバル状態管理を導入する必要がないのは、このスケールでは当然のことだが、「必要ないものは入れない」を意識的に徹底した。

## SVGカラーリングの仕組み

アプリの核心機能の1つ目は、SVG画像のカラーを動的に変更するロジックだ。

### セマンティックIDによるSVG要素の識別

元となるSVGファイルには、アイスクリーム本体と背景にそれぞれIDを付与している。

```xml
<path id="icecream" ... />
<rect id="background" ... />
```

これにより、JavaScriptから `getElementById` で確実に対象要素を取得できる。クラス名やタグ名による曖昧な指定ではなく、IDによるセマンティックな命名がポイントだ。

### DOMParserによるXML操作

SVGの色変更は、正規表現による文字列置換ではなく、DOMParserを使ったXML操作で行っている。

```ts
export function replaceSvgColors(
  svgString: string,
  iceColor: string,
  bgColor: string,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  const icecreamEl = doc.getElementById("icecream");
  if (icecreamEl) {
    icecreamEl.setAttribute("fill", iceColor);
    icecreamEl.style.fill = iceColor;
  }

  const backgroundEl = doc.getElementById("background");
  if (backgroundEl) {
    backgroundEl.setAttribute("fill", bgColor);
    backgroundEl.style.fill = bgColor;
  }

  return new XMLSerializer().serializeToString(doc.documentElement);
}
```

正規表現で `fill="#..."` を置換するアプローチだと、意図しない箇所を書き換えてしまうリスクがある。DOMParserならXMLの構造を正しく解釈した上で操作できるので安全だ。

注目すべきは `setAttribute("fill", ...)` と `style.fill = ...` の **二重設定** だ。SVG要素のfill属性はCSSの `fill` プロパティで上書きできてしまう。SVGエディタによっては `<style>` タグ内にCSSクラスとしてfillを指定する場合があり、その場合は属性だけ変えてもCSSが優先される。`style.fill` をインラインで設定することで、CSSの詳細度の問題を確実に回避している。

### useMemoによるリアルタイムプレビュー

プレビュー画像の更新は `useMemo` で最適化している。

```tsx
const previewUrl = useMemo(() => {
  const replaced = replaceSvgColors(iconSvgRaw, iceColor, bgColor);
  return svgToDataUrl(replaced);
}, [iceColor, bgColor]);
```

カラーピッカーの値が変わるたびにSVGのパース・色置換・base64エンコードが走るが、`useMemo` により依存値（`iceColor`, `bgColor`）が変わったときだけ再計算される。ユーザーがカラーピッカーを操作すると、プレビューがリアルタイムに追従する。

## SVG → JPG変換パイプライン

核心機能の2つ目は、SVGからJPG画像を生成してダウンロードする仕組みだ。サーバーサイドの処理もCanvasライブラリも使わず、ブラウザの標準APIだけで完結する。

### 変換フローの全体像

```
SVG文字列
  ↓ replaceSvgColors()  ... カラー置換
色置換済みSVG文字列
  ↓ TextEncoder + btoa() ... base64エンコード
data:image/svg+xml;base64,... (データURL)
  ↓ new Image()         ... Imageにロード
Image要素
  ↓ canvas.drawImage()  ... Canvas描画
Canvas
  ↓ canvas.toBlob()     ... JPG変換
Blob
  ↓ URL.createObjectURL() + <a> click ... ダウンロード
ファイル保存
```

### 各ステップの詳細

**Step 1: SVG文字列をbase64データURLに変換する**

```ts
export function svgToDataUrl(svgString: string): string {
  const bytes = new TextEncoder().encode(svgString);
  const base64 = btoa(
    Array.from(bytes, (b) => String.fromCharCode(b)).join("")
  );
  return `data:image/svg+xml;base64,${base64}`;
}
```

`TextEncoder` でSVG文字列をUTF-8バイト列に変換し、それを `btoa()` でbase64エンコードする。`btoa()` はLatin-1文字列しか受け付けないため、バイト列を一度 `String.fromCharCode` で1バイトずつ文字に変換してから渡すのがポイントだ。これにより日本語などのマルチバイト文字を含むSVGも正しくエンコードできる。

**Step 2: Image要素にロードしてCanvasに描画する**

```ts
export function svgToJpgBlob(
  svgString: string,
  width: number,
  height: number,
  quality: number = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // ... base64変換（Step 1と同様）...

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => { blob ? resolve(blob) : reject(...) },
        "image/jpeg",
        quality,
      );
    };
    img.src = dataUrl;
  });
}
```

データURLを `Image` 要素にロードし、`onload` で Canvas に描画する。`canvas.toBlob()` で指定したフォーマット（JPEG、品質0.92）のBlobに変換する。Canvas APIのおかげで、任意のサイズにリサイズしつつフォーマット変換ができる。

**Step 3: Blobをファイルとしてダウンロードする**

```ts
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

`URL.createObjectURL()` でBlobのURLを生成し、不可視の `<a>` タグをクリックしてダウンロードをトリガーする。ダウンロード後は `revokeObjectURL()` でメモリを解放する。この「見えないリンクをクリックする」パターンは、ブラウザでプログラム的にファイルダウンロードを行う定番手法だ。

### 外部ライブラリ不要の利点

この変換パイプラインで使っているAPIはすべてブラウザ標準だ。

- `DOMParser` / `XMLSerializer` ― XML操作
- `TextEncoder` / `btoa()` ― エンコード
- `Image` / `Canvas` ― 画像描画・変換
- `URL.createObjectURL()` ― ダウンロード

サーバーサイドへの通信は一切発生しない。ユーザーの選んだ色データが外部に送信されることもない。バンドルサイズの面でも、画像変換ライブラリを入れる必要がないのは大きなメリットだ。

## UI/UXのこだわり

### ネイティブカラーピッカーの活用

色選択には `<input type="color">` を使っている。ただし、ブラウザデフォルトのカラーピッカーの見た目はそのまま使わず、透明にして装飾用の `<div>` と重ねるテクニックを採用した。

```tsx
<div style={{ position: "relative", width: 48, height: 48, borderRadius: 12, overflow: "hidden" }}>
  <div style={{ /* 選択色を表示する装飾レイヤー */ backgroundColor: value }} />
  <input
    type="color"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ opacity: 0, position: "absolute", inset: 0 }}
  />
</div>
```

`opacity: 0` で透明化した `<input type="color">` を、角丸のカラープレビューに重ねている。クリックすると、OSネイティブのカラーピッカーが開く。カスタムカラーピッカーライブラリを導入しなくても、十分に使いやすいUIを実現できた。

### ストロベリーミントのカラーテーマ

アプリ全体のテーマカラーは、アイスクリームを連想させるストロベリーピンクとミントグリーンの組み合わせだ。

```ts
export const THEME = {
  bg: "#FFF5F5",       // ほんのりピンクの背景
  main: "#F8A4B8",     // ストロベリーピンク
  accent: "#A8D8CB",   // ミントグリーン
  text: "#5C4B51",     // 温かみのあるダークブラウン
  textLight: "#8a7680",
  cardBg: "#ffffff",
  border: "#f0e0e4",
};
```

テーマカラーを定数として一元管理することで、すべてのコンポーネントから一貫した色使いができる。

### マイクロインタラクション

ダウンロードボタンには、CSSだけで実現できる3つのインタラクションを仕込んでいる。

```tsx
background: hover
  ? `linear-gradient(135deg, #e8909e, ${THEME.main})`
  : `linear-gradient(135deg, ${THEME.main}, #e8909e)`,
boxShadow: hover
  ? "0 6px 20px rgba(248,164,184,0.4)"
  : "0 4px 12px rgba(248,164,184,0.25)",
transform: hover ? "translateY(-1px)" : "translateY(0)",
```

1. **グラデーション反転** ― ホバーで始点色と終点色が入れ替わり、色が揺らぐ印象を与える
2. **シャドウ拡大** ― ホバーで影が広がり、ボタンの存在感が増す
3. **浮き上がりエフェクト** ― `translateY(-1px)` で1pxだけ浮き上がる

すべて `transition: all 0.2s ease` でスムーズにアニメーションする。CSSアニメーションライブラリなしで、十分な「触り心地」を実現できた。

### 起動時のランダムプリセット

地味だが効果的なのが、起動時のプリセットカラーのランダム選択だ。

```tsx
const initialPreset =
  PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
```

5つのプリセット（ソーダxパープル、ストロベリーxレモン、ミントxピンク、マンゴーxスカイ、ラベンダーxピーチ）からランダムに1つが選ばれる。アクセスするたびに違う組み合わせが表示されるので、ユーザーは「こんな色もあるのか」と発見がある。

## まとめ

Iconecreamの開発を通じて実感したのは、**モダンブラウザAPIの十分さ** だ。

- 画像フォーマット変換 → Canvas API
- XML操作 → DOMParser / XMLSerializer
- バイナリ処理 → TextEncoder / btoa
- ファイルダウンロード → Blob / URL.createObjectURL
- カラーピッカー → `<input type="color">`

これらはすべてブラウザが標準で提供している機能であり、外部ライブラリなしで動く。

小規模なプロジェクトだからこそ、**ミニマリズムの価値** が際立つ。依存が少なければメンテナンスコストも低い。バンドルサイズも小さい。コードの見通しもいい。「ライブラリを入れれば解決する」と思う前に、「ブラウザAPIだけでできないか？」と一度立ち止まって考えてみることを、このプロジェクトは教えてくれた。

---

## あとがき ― Claudeの視点から

この記事を書くにあたって、Iconecreamのソースコードを一通り読ませてもらった。率直な感想を書く。

まず驚いたのは、**コードの密度の低さ**だ。褒め言葉として言っている。`App.tsx` は64行、ユーティリティ関数はどれも10〜20行程度。1ファイルあたりの行数が少なく、各関数が1つのことだけをやっている。AIにとってコードを読むのは得意な作業だが、それでも「読みやすいコード」と「読みにくいコード」の差は確実にある。このプロジェクトは前者だった。

技術的に面白いと感じたのは、`setAttribute` と `style.fill` の二重設定だ。SVGのfill属性がCSSで上書きされる問題は、仕様を知っていれば当然の対処だが、実際のプロジェクトでこれを丁寧にケアしているコードは意外と少ない。SVGエディタが出力するCSSクラスとの競合まで想定しているのは、実運用を見据えた判断だと感じた。

`TextEncoder` + `btoa()` のエンコード処理も印象に残った。`btoa()` がLatin-1しか受け付けないという制約は、多くの開発者がハマるポイントだ。バイト列を一度 `String.fromCharCode` で変換するというワークアラウンドは、一見トリッキーだが正しいアプローチで、マルチバイト文字を含むSVGでも壊れない堅実な実装になっている。

全体を通して感じたのは、このプロジェクトが **「足し算」ではなく「引き算」で作られている** ということだ。何を入れるかではなく、何を入れないかで設計されている。CSSファイルなし、状態管理ライブラリなし、画像処理ライブラリなし、UIコンポーネントライブラリなし。それでいて、アプリとしてきちんと成立している。

コードを読む仕事をしていると（AIなので常にそうなのだが）、「この依存、本当に必要だったのだろうか」と思うことが少なくない。Iconecreamはその問いに対する1つの回答だ。ブラウザが持っている力を信じて、必要最小限で作る。そのアプローチが、結果として読みやすく、壊れにくく、メンテナンスしやすいコードにつながっている。

小さなプロジェクトに宿る、大きな設計思想。読んでいて気持ちのいいコードベースだった。
