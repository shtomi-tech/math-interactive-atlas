# 数学インタラクティブ図鑑

高校数学の概念を、値を動かしながら観察する静的な学習ページです。既存の [`math-practice`](../math-practice/) 演習・ミニ試験アプリとは別の場所で動作します。

## 数学インタラクティブ図鑑

- URL: [`atlas.html`](./atlas.html)
- Practice: [`practice.html`](./practice.html)
- 問題セット: [`sets.html`](./sets.html)
- 学習レポート: [`progress.html`](./progress.html)
- 目的: 「触る → 観察 → 気づく」の流れで、数学の関係を視覚的に理解する
- 実装済み: 数学I・数学A・数学Ⅱ・数学Bの15単元、89教材。数学Ⅱは指数・対数、三角関数、微分・積分、いろいろな式、図形と方程式、数学Bは数列、統計的な推測、数学と社会生活まで扱う
- 教材データ: [`static/atlas/content-data.json`](./static/atlas/content-data.json) を正本とするデータ駆動構成
- Practice問題: [`static/practice/problem-data.json`](./static/practice/problem-data.json) に15単元267問を収録。89教材をそれぞれ基礎・標準・発展の3問でカバーする
- 学習ループ: 図鑑で観察し、Practiceで使い、間違えた問題から図鑑へ戻る。お気に入り・閲覧・問題結果はブラウザのlocalStorageにだけ保存する
- Classroom Pack: 問題を最大30問のセットへまとめ、教師指定順のPractice、問題プリント、解答付きプリントへつなげる。セットと学習記録はこの端末のlocalStorageにだけ保存する
- 学習レポート: 教材の閲覧数、問題の習熟状態、単元ごとの状況、最近の学習を表示し、学習記録をJSONでバックアップ・置換復元する
- Interaction Engine: `static/atlas/interactions/index.js` のRegistry経由で11エンジンを切り替える。連続量はFunctionGraph / GeometryBoard / RangeGraph、離散量はSequenceLabで表示する
- 設計書: [`docs/atlas/DESIGN.md`](./docs/atlas/DESIGN.md)

## 教材構成

- 数学I・数と式: 展開を面積で見る、因数分解を逆再生する、平方公式の形を作る、平方根を数直線で探す、絶対値は距離、不等式と数直線、集合を塗って式を作る、必要条件・十分条件を集合で見る
- 数学I・図形と計量: 直角三角形と三角比、単位円でsin・cosを見る、三角比の相互関係、三角形の面積とsin、正弦定理と外接円、余弦定理を変形で見る
- 数学I・二次関数: y = ax² を動かす、頂点を動かす、平方完成をアニメーションする、3点から放物線を作る、最大・最小と定義域、判別式と交点数、二次不等式を塗る、パラメータと共有点
- 数学I・データの分析: 平均と中央値を壊してみる、分散を距離として見る、箱ひげ図を動かす、相関係数を作る、仮説検定をシミュレーション
- 数学A・場合の数と確率: 余事象・和事象を塗る、条件付き確率で世界を絞る、数え上げの樹形図、順列を全部並べる、組合せは順序を無視する、独立試行を大量実験する、円順列を回してみる、確率を標本空間で見る
- 数学A・図形の性質: 三角形の五心を追いかける、角の二等分線と辺の比、円周角を動かす、方べきの定理を動かす
- 数学A・数学と人間の活動: ユークリッド互除法を動かす
- 数学Ⅱ・指数関数・対数関数: 指数を実数へ広げる、指数関数の底を動かす、logは指数の逆、対数関数の底を動かす、指数・対数方程式をグラフで解く
- 数学Ⅱ・三角関数: 弧度法を円で見る、sin・cos・tanのグラフ、振幅・周期・位相を動かす、加法定理を図で見る、2倍角を動かす
- 数学Ⅱ・微分・積分の考え: 割線から接線へ、微分係数を動かす、導関数と元の関数、三次関数の増減・極値、不定積分と定数C、定積分と符号付き面積
- 数学B・数列: 等差数列を並べる、等比数列を拡大縮小で見る、数列の和を積み上げる、漸化式を反復する
- 数学Ⅱ・いろいろな式: 3次式の展開、整式の割り算、分数式の約分、複素数の計算、解と係数の関係、因数定理、恒等式の係数比較
- 数学Ⅱ・図形と方程式: 内分・外分、直線の方程式、直線の関係、円の方程式、円と直線の共有点、軌跡、不等式の表す領域
- 数学B・数列の発展: Σ記号、階差数列、数学的帰納法
- 数学B・統計的な推測: 母集団と標本、確率変数、確率分布の平均・分散、二項分布、正規分布、標準化、標本平均、信頼区間、仮説検定
- 数学B・数学と社会生活: 数学的モデルの構築、モデル比較、意思決定と感度分析
- カタログは検索、科目・単元・Interaction Typeの絞り込み、同一科目内の前後移動に対応する
- カタログは閲覧済み・未閲覧・お気に入りでも絞り込める。URLには `q`、`subject`、`unit`、`type`、`progress` を同期する

## データ構成

```text
Atlas: static/atlas/content-data.json
Practice: static/practice/problem-data.json
Shared: static/atlas/curriculum.js / static/atlas/storage.js / static/tokens.css
Classroom Pack: static/sets/ / static/worksheet/ / static/progress/
```

## Practice

- [`practice.html`](./practice.html): 267問の問題一覧。検索、科目・単元・難易度・習熟状態で絞り込める
- [`practice.html?problem=quad-discriminant-01`](./practice.html?problem=quad-discriminant-01): 問題を開く
- [`practice.html?status=review`](./practice.html?status=review): 要復習の問題だけを表示する。旧 `mode=mistakes` も互換対応する
- [`practice.html?content=quadratic-discriminant`](./practice.html?content=quadratic-discriminant): 1教材の基礎→標準→発展セッション
- `practice.html?unit=quadratic`、`?unit=quadratic&difficulty=1`、`?q=判別式`、`?status=mastered` で単元・難易度・検索語・習得状態を指定できる
- 正解判定後は自動で次へ進まず、次の問題ボタンを明示的に押す。誤答時は該当する図鑑教材へ戻れる
- 問題セットは [`sets.html`](./sets.html) で作成・保存・複製・JSON入出力できる。保存JSONにはタイトル、説明、問題IDだけを含め、教師指定の順番をPracticeへ引き継ぐ
- [`worksheet.html`](./worksheet.html) は `?ids=id1,id2` で問題を並べ、`&answers=1` で解答・解説を後ろに付ける。A4印刷を前提とする
- [`progress.html`](./progress.html) は現在の状態を `math-interactive-atlas-learning-record` v2 としてバックアップできる。読み込みは確認後の置き換えだけで、記録の結合は行わない
- 学習状態は `math-interactive-atlas-state-v1` の同じlocalStorage領域でv1からv2へ互換移行し、このブラウザ内だけに保存する。習熟状態は未挑戦・練習中・要復習・習得の4段階で、2回連続正解を習得の条件とする

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
node scripts/check-quadratic.js
node scripts/check-trigonometry.js
node scripts/check-exponential-logarithm.js
node scripts/check-calculus.js
node scripts/check-sequences.js
node scripts/check-curriculum.js
node scripts/check-related-content.js
node scripts/check-practice-data.js
node scripts/check-practice-answer.js
node scripts/check-practice-links.js
node scripts/check-learning-state.js
node scripts/check-practice-coverage.js
node scripts/check-practice-quality.js
node scripts/check-practice-session.js
node scripts/check-problem-set.js
node scripts/check-set-storage.js
node scripts/check-worksheet.js
node scripts/check-progress-summary.js
node scripts/check-learning-record.js
node scripts/check-asset-version.js
```

GitHub Actionsでも、同じ契約・数学ロジック検査と対象JavaScriptの構文検査を実行します。

GitHub ActionsのAtlas checksはpush / pull requestで実行します。Pages公開は手動実行の [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) から行い、Atlas、Practice、問題セット、問題プリント、学習レポートのHTML・CSS・JS・データを公開します。GitHub Pages deployment requires repository-side Pages configuration. PagesがRepository設定またはGitHubプランで有効化できない場合は、`Pages configuration required` として扱います。

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
