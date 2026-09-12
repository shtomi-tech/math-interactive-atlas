# 数学インタラクティブ図鑑

高校数学の概念を、値を動かしながら観察する静的な学習ページです。既存の [`math-practice`](../math-practice/) 演習・ミニ試験アプリとは別の場所で動作します。

## 数学インタラクティブ図鑑

- URL: [`atlas.html`](./atlas.html)
- 目的: 「触る → 観察 → 気づく」の流れで、数学の関係を視覚的に理解する
- 実装済み: 集合を塗って式を作る、必要条件・十分条件、余事象・和事象を塗る、条件付き確率で世界を絞る、数え上げの樹形図、順列を全部並べる、組合せは順序を無視する、`y = ax²`、頂点形式、判別式と交点数、最大・最小と定義域、単位円でsin・cosを見る、三角形の面積とsinの13コンテンツ
- 教材データ: [`static/atlas/content-data.json`](./static/atlas/content-data.json) を正本とするデータ駆動構成
- Interaction Engine: `static/atlas/interactions/index.js` のRegistry経由でRegionSelector / FunctionGraph / RangeGraph / GeometryBoard / CombinatoricsViewerを切り替える。RegionSelectorは集合・条件付き確率のScene、CombinatoricsViewerは樹形図・順列・組合せのSceneで再利用する
- 設計書: [`docs/atlas/DESIGN.md`](./docs/atlas/DESIGN.md)

## Checks

```text
node scripts/check-atlas-contract.js
node scripts/check-set-regions.js
node scripts/check-set-relations.js
node scripts/check-event-regions.js
node scripts/check-conditional-probability.js
node scripts/check-combinatorics.js
```

GitHub Actionsでも、同じ契約・数学ロジック検査と対象JavaScriptの構文検査を実行します。

`master`へのpush時は [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) が `atlas.html`、`static/atlas.css`、`static/atlas/` をGitHub Pagesへ公開します。PagesがRepository設定またはGitHubプランで有効化できない場合は、`Pages configuration required` として扱います。

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
/atlas.html?subject=math1
/atlas.html?subject=mathA
/atlas.html?subject=math1&unit=quadratic
```

## 実行

```text
py -m http.server 8000
```

ブラウザで `http://localhost:8000/atlas.html` を開きます。KaTeXとJSXGraphは固定バージョンのCDNを使用します。
