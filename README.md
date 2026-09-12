# 数学インタラクティブ図鑑

高校数学の概念を、値を動かしながら観察する静的な学習ページです。既存の [`math-practice`](../math-practice/) 演習・ミニ試験アプリとは別の場所で動作します。

## 数学インタラクティブ図鑑

- URL: [`atlas.html`](./atlas.html)
- 目的: 「触る → 観察 → 気づく」の流れで、数学の関係を視覚的に理解する
- 実装済み: 数学I・数学Aの7単元、40教材。二次関数・集合・場合の数・確率・データ分析・図形と計量・図形の性質・数と式・数学と人間の活動を扱う
- 教材データ: [`static/atlas/content-data.json`](./static/atlas/content-data.json) を正本とするデータ駆動構成
- Interaction Engine: `static/atlas/interactions/index.js` のRegistry経由で10エンジンを切り替える。AlgebraLab / NumberLineLab / AlgorithmLabを追加し、既存Engineの新modeもRegistryで再利用する
- 設計書: [`docs/atlas/DESIGN.md`](./docs/atlas/DESIGN.md)

## 教材構成

- 数学I・数と式: 展開を面積で見る、因数分解を逆再生する、平方公式の形を作る、平方根を数直線で探す、絶対値は距離、不等式と数直線、集合を塗って式を作る、必要条件・十分条件を集合で見る
- 数学I・図形と計量: 直角三角形と三角比、単位円でsin・cosを見る、三角比の相互関係、三角形の面積とsin、正弦定理と外接円、余弦定理を変形で見る
- 数学I・二次関数: y = ax² を動かす、頂点を動かす、平方完成をアニメーションする、3点から放物線を作る、最大・最小と定義域、判別式と交点数、二次不等式を塗る、パラメータと共有点
- 数学I・データの分析: 平均と中央値を壊してみる、分散を距離として見る、箱ひげ図を動かす、相関係数を作る、仮説検定をシミュレーション
- 数学A・場合の数と確率: 余事象・和事象を塗る、条件付き確率で世界を絞る、数え上げの樹形図、順列を全部並べる、組合せは順序を無視する、独立試行を大量実験する、円順列を回してみる、確率を標本空間で見る
- 数学A・図形の性質: 三角形の五心を追いかける、角の二等分線と辺の比、円周角を動かす、方べきの定理を動かす
- 数学A・数学と人間の活動: ユークリッド互除法を動かす
- カタログは検索、科目・単元・Interaction Typeの絞り込み、同一科目内の前後移動に対応する

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
node scripts/check-algebra.js
node scripts/check-number-line.js
node scripts/check-sample-space.js
node scripts/check-number-theory.js
node scripts/check-geometry.js
```

GitHub Actionsでも、同じ契約・数学ロジック検査と対象JavaScriptの構文検査を実行します。

GitHub ActionsのAtlas checksはpush / pull requestで実行します。Pages公開は手動実行の [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) から行い、`atlas.html`、`static/atlas.css`、`static/atlas/` を公開します。GitHub Pages deployment requires repository-side Pages configuration. PagesがRepository設定またはGitHubプランで有効化できない場合は、`Pages configuration required` として扱います。

`zukan.html` / `static/zukan/` は旧プロトタイプです。新規実装の正本は `atlas.html` / `static/atlas/` です。Legacy prototype. Do not add new features here.

## URLパラメータ

```text
/atlas.html?content=quadratic-basic
/atlas.html?content=quadratic-vertex
/atlas.html?content=quadratic-discriminant
/atlas.html?content=completing-square
/atlas.html?content=three-point-parabola
/atlas.html?content=quadratic-inequality
/atlas.html?content=parameter-intersections
/atlas.html?content=quadratic-range
/atlas.html?content=unit-circle
/atlas.html?content=right-triangle-trig
/atlas.html?content=trig-relations
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
/atlas.html?content=expansion-area
/atlas.html?content=factorization-reverse
/atlas.html?content=perfect-square-build
/atlas.html?content=sqrt-numberline
/atlas.html?content=absolute-distance
/atlas.html?content=inequality-numberline
/atlas.html?content=circular-permutations
/atlas.html?content=sample-space-grid
/atlas.html?content=euclidean-algorithm
/atlas.html?subject=math1
/atlas.html?subject=mathA
/atlas.html?subject=math1&unit=quadratic
/atlas.html?q=判別式
/atlas.html?subject=math1&unit=quadratic&type=slider
```

## 実行

```text
py -m http.server 8000
```

ブラウザで `http://localhost:8000/atlas.html` を開きます。KaTeXとJSXGraphは固定バージョンのCDNを使用します。
