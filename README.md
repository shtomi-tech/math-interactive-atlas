# 数学インタラクティブ図鑑

高校数学の概念を、値を動かしながら観察する静的な学習ページです。既存の [`math-practice`](../math-practice/) 演習・ミニ試験アプリとは別の場所で動作します。

## 数学インタラクティブ図鑑

- URL: [`atlas.html`](./atlas.html)
- 目的: 「触る → 観察 → 気づく」の流れで、数学の関係を視覚的に理解する
- 実装済み: `y = ax²`、頂点形式、判別式と交点数、最大・最小と定義域、単位円でsin・cosを見る、三角形の面積とsinの6コンテンツ
- 教材データ: [`static/atlas/content-data.json`](./static/atlas/content-data.json) を正本とするデータ駆動構成
- Interaction Engine: `static/atlas/interactions/index.js` のRegistry経由でFunctionGraph / RangeGraph / GeometryBoardを切り替える。GeometryBoardは単位円と三角形のSceneで再利用する
- 設計書: [`docs/atlas/DESIGN.md`](./docs/atlas/DESIGN.md)
- 契約チェック: `node scripts/check-atlas-contract.js`

`zukan.html` / `static/zukan/` は旧プロトタイプです。新規実装の正本は `atlas.html` / `static/atlas/` です。

## URLパラメータ

```text
/atlas.html?content=quadratic-basic
/atlas.html?content=quadratic-vertex
/atlas.html?content=quadratic-discriminant
/atlas.html?content=quadratic-range
/atlas.html?content=unit-circle
/atlas.html?content=triangle-area-sine
/atlas.html?subject=math1&unit=quadratic
```

## 実行

```text
py -m http.server 8000
```

ブラウザで `http://localhost:8000/atlas.html` を開きます。KaTeXとJSXGraphは固定バージョンのCDNを使用します。
