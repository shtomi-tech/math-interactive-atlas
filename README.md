# 数学インタラクティブ図鑑

外部Repository由来の数学Interactionを、実際に操作できる形で収集・整理する静的な図鑑です。既存の [`math-practice`](../math-practice/) 演習・ミニ試験アプリとは別の場所で動作します。

## 数学インタラクティブ図鑑

- URL: [`atlas.html`](./atlas.html)
- Practice: [`practice.html`](./practice.html)
- 問題セット: [`sets.html`](./sets.html)
- 学習レポート: [`progress.html`](./progress.html)
- 目的: 外部Repository由来のInteractive Featureを調査・監査し、「触る → 観察 → 気づく」の流れで整理する
- 基本単位: 数学単元ではなくInteraction。数学ContentとInteractionを分離し、Component / Engineとして再利用する
- Atlas候補: 数学I・数学A・数学Ⅱ・数学Bの15単元、89教材。数学Ⅱは指数・対数、三角関数、微分・積分、いろいろな式、図形と方程式、数学Bは数列、統計的な推測、数学と社会生活まで扱う。正式採用はExternal Repository Audit後に決める
- 教材データ: [`static/atlas/content-data.json`](./static/atlas/content-data.json) を正本とするデータ駆動構成
- Practice問題: [`static/practice/problem-data.json`](./static/practice/problem-data.json) は現在0問。外部Repository Audit後に、必要な理解確認問題を再整備する
- 学習ループ: 監査済みのAtlasで観察し、将来Practiceで確認する。現在はAtlasの閲覧・お気に入りを維持し、古いPractice履歴は表示しない
- Classroom Pack: 問題セット、Worksheet、Progressの基盤は維持するが、現在は選択できるPractice問題がないため各画面がEmpty Stateを表示する
- 学習レポート: 教材の閲覧数、問題の習熟状態、単元ごとの状況、最近の学習を表示し、学習記録をJSONでバックアップ・置換復元する
- Interaction Engine: `static/atlas/interactions/index.js` のRegistry経由で11エンジンを切り替える。連続量はFunctionGraph / GeometryBoard / RangeGraph、離散量はSequenceLabで表示する
- 監査Registry: [`research/repository-audit.json`](./research/repository-audit.json) に外部Repositoryとの関係を記録する。許可するrelationは `inspired-by` / `adapted-from` のみ
- Canonical Interaction Library: [`data/interactions.json`](./data/interactions.json) にCanonical Interaction 10件（R7で009/010を昇格）、[`research/external-repositories.json`](./research/external-repositories.json) に外部Repository 9件・Feature 13件を保存する。実行時の状態は [`data/interaction-runtime-map.json`](./data/interaction-runtime-map.json) で分離し、[`dist/ai/interactions.json`](./dist/ai/interactions.json) は3つの正本から生成する。89候補とのCoverageは [`data/candidate-canonical-map.json`](./data/candidate-canonical-map.json) から [`dist/ai/candidate-canonical-coverage.json`](./dist/ai/candidate-canonical-coverage.json) へ別生成し、R7の昇格判断は [`dist/ai/canonical-promotion-decisions.json`](./dist/ai/canonical-promotion-decisions.json) へ生成する
- 設計書: [`docs/atlas/DESIGN.md`](./docs/atlas/DESIGN.md)
- プロジェクトゴール: [`docs/PROJECT_GOAL.md`](./docs/PROJECT_GOAL.md)

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
Repository Audit: research/repository-audit.json
Canonical Interaction Metadata: data/interactions.json
Canonical Interactions: data/interactions.json
External Repositories: research/external-repositories.json
Candidate Canonical Map: data/candidate-canonical-map.json
Generated AI Index: dist/ai/interactions.json / dist/ai/candidate-canonical-coverage.json / dist/ai/canonical-research-priorities.json
```

## Practice

- [`practice.html`](./practice.html): 現在0問のPractice一覧。空状態を表示し、監査後の問題再整備に備える
- Practice問題は現在0問のため、個別問題への直リンクはありません
- [`practice.html?status=review`](./practice.html?status=review): 要復習の問題だけを表示する。旧 `mode=mistakes` も互換対応する
- AtlasからPracticeへ戻る導線は、対応する問題が登録された教材だけに表示します
- `practice.html?unit=quadratic`、`?unit=quadratic&difficulty=1`、`?q=判別式`、`?status=mastered` で単元・難易度・検索語・習得状態を指定できる
- 正解判定後は自動で次へ進まず、次の問題ボタンを明示的に押す。誤答時は該当する図鑑教材へ戻れる
- 問題セットは [`sets.html`](./sets.html) で作成・保存・複製・JSON入出力できる。保存JSONにはタイトル、説明、問題IDだけを含め、教師指定の順番をPracticeへ引き継ぐ
- [`worksheet.html`](./worksheet.html) は `?ids=id1,id2` で問題を並べ、`&answers=1` で解答・解説を後ろに付ける。A4印刷を前提とする
- [`progress.html`](./progress.html) は現在の状態を `math-interactive-atlas-learning-record` v2 としてバックアップできる。読み込みは確認後の置き換えだけで、記録の結合は行わない
- 学習状態は `math-interactive-atlas-state-v1` の同じlocalStorage領域でv1からv2へ互換移行し、このブラウザ内だけに保存する。習熟状態は未挑戦・練習中・要復習・習得の4段階で、2回連続正解を習得の条件とする

## Checks

```text
node scripts/check-atlas-contract.js
node scripts/check-repository-audit.js --require-complete
node scripts/report-repository-audit.js
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
node scripts/check-r3-scope.js
node scripts/check-external-repositories.js
node scripts/check-interaction-library.js
node scripts/build-interaction-index.js --check
node scripts/check-interaction-runtime-map.js
node scripts/check-r4-scope.js
node scripts/check-interaction-index.js
node scripts/report-interaction-library.js
node scripts/check-r5-scope.js
node scripts/check-evidence-readiness.js
node scripts/check-candidate-canonical-map.js
node scripts/report-candidate-canonical-coverage.js
node scripts/build-candidate-canonical-index.js --check
node scripts/check-gap-behavior-analysis.js
node scripts/check-canonical-interaction-candidates.js
node scripts/check-canonical-candidate-repository-leads.js
node scripts/report-r6-research-priorities.js
node scripts/build-canonical-research-index.js --check
node scripts/check-r6-scope.js
node scripts/check-canonical-promotion-plan.js
node scripts/check-canonical-promotion-evidence.js
node scripts/check-r7-coverage-delta.js
node scripts/report-r7-promotion.js
node scripts/build-canonical-promotion-index.js --check
node scripts/check-r7-scope.js
```

GitHub Actionsでも、同じ契約・数学ロジック検査と対象JavaScriptの構文検査を実行します。

### Phase R0: Practice curation reset

現在の到達点は `Atlas候補 89 / Practice 0 / Interaction Engine 11 / Subjects 4` です。既存のオリジナルPractice問題は正本から削除し、Practice・Problem Set・Worksheet・Progressの仕組みと安定IDは残しています。0問でも各画面が明示的なEmpty Stateを表示し、AtlasはPractice sectionを表示しません。

このリポジトリの中心ゴールは、外部の公開Repositoryに存在するInteractive Featureを調査・選定・監査し、Atlasへ追跡可能な形で収録することです。正式採用に使えるrelationは `inspired-by` と `adapted-from` だけで、`original` は使用しません。監査記録は [`research/repository-audit.json`](./research/repository-audit.json) に保存し、未確認の候補へ参照元を後付けしません。

### Phase R2: Repository audit completion and provenance hardening

R2では89候補について、Git履歴・既存ドキュメント・過去のSource記録を先に確認しました。候補固有の外部Repository由来を裏付ける履歴は確認できなかったため、現在の監査結果は `Atlas候補 89 / verified 0 / needs-review 89 / pending 0` です。根拠のない参照元や新たに見つけたRepositoryの遡及的な帰属は登録していません。

`research/repository-audit.json` は候補の監査作業キューであり、Interactionの正規ID Registryではありません。Contentの描画ライブラリは `static/atlas/content-data.json` の `rendering.library` に置き、Repository、relation、License、evidenceは監査Registryだけを正本とします。詳細なゴールと受入条件は [`docs/PROJECT_GOAL.md`](./docs/PROJECT_GOAL.md)、UI契約は [`docs/atlas/DESIGN.md`](./docs/atlas/DESIGN.md)、R2チェック項目は [`docs/RELEASE_CHECKLIST.md`](./docs/RELEASE_CHECKLIST.md) を参照してください。

新しいInteractionは、`Repository Search → Feature確認 → License確認 → inspired-by / adapted-from判定 → Atlas登録` の順でのみ追加します。未確認のInteraction、架空のRepository URL、後付けの出典、`original` relationは許可しません。`needs-review` は根拠不足を隠さず示す状態であり、`verified` と同じ意味ではありません。将来は `Learning Requirements → Interaction検索 → Example再利用 → 不足Data生成 → Validator → Lesson構成` をAIで実行できる状態へ進めます。

ローカル検証は `npm run check`、`npm test`、`git diff --check` で実行します。GitHub ActionsのAtlas checksはpush / pull requestで実行します。GitHub PagesはRepository設定またはGitHubプランの制約により利用できない場合があるため、公開検証はローカル検証と分けて扱います。

`zukan.html` / `static/zukan/` は旧プロトタイプです。新規実装の正本は `atlas.html` / `static/atlas/` です。Legacy prototype. Do not add new features here.

### Phase R3: Canonical Interaction Library

R3の到達点は `Canonical Interaction 8 / External Repository 4 / Feature 8 / Category 6 / Runtime implemented 0` でした。R4では `MATH-INT-001〜003` を既存 `functionGraph` Engineへclean-room再実装し、`data/interaction-runtime-map.json` をRuntime状態の正本にします。既存の `Atlas 89 / Practice 0 / Interaction Engine 11 / audit needs-review 89` は変更しません。

### Phase R5: Evidence Completion and Coverage Map

R5では `MATH-INT-001〜003`のRuntimeを変更せず、007/008のEvidenceを固定SHA付きで補完します。外部Repositoryは6件、Featureは10件、Runtimeは `implemented 3 / planned 5 / blocked-evidence 0` とします。`data/candidate-canonical-map.json`で89候補をInteraction Behaviorに基づき `covered` / `partial` / `gap`へ分類し、Coverage gapと各Canonical Interactionの再利用数をR6のResearch優先順位へ引き渡します。R5では新規Canonical Interaction、Runtime、Engine、Practice、Legacy Candidateの監査status変更を行いません。

### Phase R6: Gap Behavior Research and Candidate Priorities

R6では、Coverage gap 56件をBehavior Signatureと8つの研究Clusterへ整理し、8件の `CAN-CAND-###` 候補と4件のShortlistを作成します。外部Repositoryは既存の稼働Registryへ追加せず、固定SHA付きResearch Leadとしてだけ記録します。生成されたResearch Indexはgap-onlyのSubject / Unit集計、候補のPrimary Gap影響、Partial二次機会、Engine適合、Evidence、Priorityを示します。稼働中のCanonical 8件、Runtime、Engine、Practice、89教材は変更しません。

### Phase R7: Canonical Promotion and Evidence Formalization

R7では、R6のShortlist 4件を全件昇格させず、独立した公開GitHub Repositoryを2件以上、各固定SHA・License・source path・観察挙動まで確認できた候補だけを昇格する。今回は `CAN-CAND-001 → MATH-INT-009` と `CAN-CAND-002 → MATH-INT-010` を正式化し、`CAN-CAND-003` / `004` はHoldとする。新CanonicalはすべてRuntime `planned` であり、既存3件のRuntime、11 Engine、Practice 0問、Legacy 89件は変更しない。

R7の正本は [`research/canonical-promotion-plan.json`](./research/canonical-promotion-plan.json)、[`research/canonical-promotion-evidence.json`](./research/canonical-promotion-evidence.json)、[`research/r7-coverage-delta.json`](./research/r7-coverage-delta.json) である。R6のResearch snapshotは書き換えず、Active Registryと生成Indexだけを昇格結果に合わせる。外部コードはコピー・移植せず、Evidenceは `behavioral-reference-only` として扱う。現在のCoverageは `covered 18 / partial 24 / gap 47` で、9件の個別遷移を記録している。

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

ブラウザで `http://localhost:8000/atlas.html` を開きます。KaTeXとJSXGraphは固定バージョンのCDNを使用します。監査JSONを読み込めない場合、画面には `Repository Audit unavailable` を表示します。
