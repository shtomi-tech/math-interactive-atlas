# 数学インタラクティブ図鑑

高校数学の概念を、値を動かしながら観察する静的な学習ページです。既存の [`math-practice`](../math-practice/) 演習・ミニ試験アプリとは別の場所で動作します。

## 数学インタラクティブ図鑑

- URL: [`atlas.html`](./atlas.html)
- 目的: 「触る → 観察 → 気づく」の流れで、数学の関係を視覚的に理解する
- 実装済み: 二次関数・集合・場合の数・確率・データ分析・図形と計量・図形の性質を扱う25コンテンツ
- 教材データ: [`static/atlas/content-data.json`](./static/atlas/content-data.json) を正本とするデータ駆動構成
- Interaction Engine: `static/atlas/interactions/index.js` のRegistry経由で7エンジンを切り替える。GeometryBoardは8 Scene、SimulationLabは2 Sceneを共通基盤で再利用する
- 設計書: [`docs/atlas/DESIGN.md`](./docs/atlas/DESIGN.md)

## Checks

```text
node scripts/check-atlas-contract.js
node scripts/check-set-regions.js
node scripts/check-set-relations.js
node scripts/check-event-regions.js
node scripts/check-conditional-probability.js
node scripts/check-combinatorics.js
node scripts/check-statistics.js
node scripts/check-probability.js
node scripts/check-hypothesis-test.js
```

GitHub Actionsでも、同じ契約・数学ロジック検査と対象JavaScriptの構文検査を実行します。

GitHub ActionsのAtlas checksはpush / pull requestで実行します。Pages公開は手動実行の [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) から行い、`atlas.html`、`static/atlas.css`、`static/atlas/` を公開します。GitHub Pages deployment requires repository-side Pages configuration. PagesがRepository設定またはGitHubプランで有効化できない場合は、`Pages configuration required` として扱います。

`zukan.html` / `static/zukan/` は旧プロトタイプです。新規実装の正本は `atlas.html` / `static/atlas/` です。

## URLパラメータ

```text
/atlas.html?content=quadratic-basic
/atlas.html?content=quadratic-vertex
/atlas.html?content=quadratic-discriminant
/atlas.html?content=quadratic-range
/atlas.html?content=unit-circle
/atlas.html?content=triangle-area-sine
/atlas.html?content=set-regions
/atlas.html?content=necessary-sufficient
/atlas.html?content=event-regions
/atlas.html?content=conditional-probability
/atlas.html?content=counting-tree
/atlas.html?content=permutations-all
/atlas.html?content=combinations-order
/atlas.html?content=mean-median-outlier
/atlas.html?content=variance-distance
/atlas.html?content=boxplot-drag
/atlas.html?content=correlation-builder
/atlas.html?content=hypothesis-test-coin
/atlas.html?subject=math1
/atlas.html?subject=mathA
/atlas.html?subject=math1&unit=quadratic
```

## 実行

```text
py -m http.server 8000
```

ブラウザで `http://localhost:8000/atlas.html` を開きます。KaTeXとJSXGraphは固定バージョンのCDNを使用します。
