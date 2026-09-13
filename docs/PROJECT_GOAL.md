# 数学インタラクティブ図鑑プロジェクト

## 1. プロジェクトの目的

高校数学学習に役立つインタラクティブなUI・機能・教材表現を、外部の公開Repositoryから収集・調査・整理し、実際に操作して確認できる

# 「数学インタラクティブ図鑑」

を構築する。

この図鑑は、単なるGitHub Repositoryのリンク集ではない。

最終的な目的は、

```text
優れた数学Interactionを外部Repositoryから研究する
        ↓
学習機能として整理する
        ↓
再利用可能なComponent / Engineとして統合する
        ↓
AIが検索しやすいMetadataとして蓄積する
        ↓
ユーザーが提供する数学解説・教材と組み合わせる
        ↓
AIがインタラクティブ数学教材を生成する
```

という教材制作基盤を作ることである。

---

## 2. 最終ゴール

最終的には数学教材を、

```text
教材
=
数学コンテンツ
+
Interaction
```

として構築できる状態を目指す。

それぞれの責務を明確に分ける。

```text
数学コンテンツ
        ↓
ユーザーが提供する
解説・参考書・授業プリント・PDF等

Interaction
        ↓
数学インタラクティブ図鑑
```

AIがこの2つを組み合わせる。

最終フロー：

```text
ユーザーが数学教材・解説を渡す
        ↓
AIが数学内容と学習目標を抽出
        ↓
Learning Requirementsへ変換
        ↓
Math Interaction Atlasを検索
        ↓
適切なInteractionを選択
        ↓
既存Problem / Exampleを検索
        ↓
不足データだけ生成
        ↓
Validatorで確認
        ↓
Lessonを構成
        ↓
インタラクティブ数学教材完成
```

---

## 3. 「何を教えるか」と「どう学ばせるか」を分離する

### 数学コンテンツ

数学的内容は、教材作成時にユーザーが提供する資料を基準とする。

例：

* 教科書
* 参考書
* 授業プリント
* PDF
* Markdown
* 問題集
* ユーザー独自の解説

ここから、

```text
定義
公式
定理
考え方
例題
注意点
学習順序
```

を取得する。

### Interaction

Math Interaction Atlasは、

```text
何を動かすか
何を選択するか
何を変化させるか
何を比較するか
何を可視化するか
何に気づかせるか
```

を提供する。

つまり、

```text
Math Reference
↓
何を教えるか

Interaction Atlas
↓
どう学ばせるか
```

という関係にする。

---

## 4. Interaction Atlasは数学辞典ではない

Atlasの主目的は、

```text
数学知識そのものを保存すること
```

ではない。

主目的は、

```text
数学概念を
どのような学習操作へ変換できるか
```

を蓄積することである。

例えば、

```text
y = ax²
```

という数学内容そのものをAtlasの中心データにはしない。

代わりに、

```text
係数をSliderで変化させる

頂点をDragする

2つのグラフをCompareする

図形を動かして不変量を見る

標本をSimulateする
```

といったInteractionを蓄積する。

---

## 5. Atlasの基本単位

AtlasはRepository単位でも数学単元単位でもなく、

# Interaction単位

で管理する。

悪い例：

```text
JSXGraph
Seeing Theory
GeoGebra
Mathigon
```

良い例：

```text
MATH-INT-001 Parameter Graph Explorer
MATH-INT-002 Draggable Geometry Point
MATH-INT-003 Region Selector
MATH-INT-004 Distribution Simulator
MATH-INT-005 Sequence Visualizer
```

外部Repositoryは各Interactionの、

```text
参考元
UI参考
実装参考
コード流用元
```

として紐づける。

---

## 6. 外部Repository由来を必須とする

Math Interaction Atlasへ登録するInteractionには、

**必ず確認済みの外部公開Repositoryを紐づける。**

許可する関係は、

```text
inspired-by
adapted-from
```

の2種類だけとする。

### inspired-by

外部Repositoryに実在するInteractionを研究し、

* UI
* 操作方法
* 可視化方法
* 学習フロー
* Feedback
* Interaction pattern

を参考にAtlas用として再実装したもの。

### adapted-from

外部Repositoryのコードや実装構造を実際に移植・改変したもの。

必ず、

```text
Repository
URL
Commit / Tag
Source Path
License
Attribution
```

を記録する。

---

## 7. Original Interactionは禁止

以下は禁止する。

```text
外部Repositoryを確認せず
Interactionを独自に考案する

ChatGPTが新しいInteractionを
ゼロから提案してそのまま実装する

完成後に似たRepositoryを探して
出典として後付けする
```

新しいInteractionが必要になった場合は、

```text
既存Atlasを検索
↓
該当なし
↓
外部Repositoryを検索
↓
Interactionを発見
↓
調査
↓
inspired-by / adapted-from
↓
Atlasへ登録
```

という順序を必須とする。

---

## 8. Interaction Metadata

各Interactionには最低限、

```text
id
title
category
description

learningGoal
learnerAction
changingElement
feedbackType

capabilities
learningPatterns
bestFor
notBestFor

implementationDifficulty
reusability

repository
relation
license
reusePolicy
```

を持たせる。

特にAI検索では、

```text
数学単元名
```

だけではなく、

```text
グラフの変化に気づかせたい

図形の不変量を発見させたい

複数ケースを比較させたい

確率分布を試行で理解させたい

式と図を対応させたい
```

のような**学習者に行わせたい認知活動**から検索できるようにする。

---

## 9. Interaction Category

数学版では、例えば次のカテゴリで整理する。

```text
Build
Move
Select
Transform
Visualize
Compare
Simulate
Generate
Measure
Construct
```

カテゴリそのものより、

```text
何を触るか
何が変わるか
何に気づくか
```

を重要視する。

---

## 10. Reusable Component

Interactionは可能な限り再利用可能にする。

例えば、

```text
FunctionGraph
```

というComponentが、

```text
二次関数
指数関数
対数関数
三角関数
微分
モデル化
```

で再利用できるようにする。

問題や数学内容をComponent内部へハードコードしない。

```text
Component
+
Content Data
=
Interactive Demo
```

とする。

---

## 11. Problem Data

ProblemはInteractionと分離する。

```text
Interaction
= どう操作するか

Problem Data
= そのInteractionへ何を渡すか
```

とする。

既存Problemは単なる問題集ではなく、

> Interactionの使い方をAIへ示すfew-shot example

として扱う。

ただし現在のオリジナル267問はいったん削除し、今後必要になったProblem Dataを改めて整備する。

---

## 12. AI Retrieval

将来的にはAIが、

```text
Learning Requirement
↓
Interaction検索
↓
既存Example検索
↓
再利用可能ならReuse
↓
不足データだけGenerate
```

できる状態を作る。

基本思想は、

```text
Search
↓
Reuse
↓
Adapt
↓
Generate
```

である。

---

## 13. Repository Research

今後のInteraction追加では、ImplementationよりResearchを先に行う。

```text
Repository Search
↓
Interactive Feature発見
↓
実際のDemo / Code確認
↓
教育的価値を分析
↓
License確認
↓
inspired-by / adapted-from 判定
↓
Atlas登録
↓
Demo統合
```

これを標準フローとする。

---

## 14. 現在の89教材

現在の89教材は、

```text
完成済み正式Atlas
```

とは扱わない。

新しいProject Goalでは、

# 89 Interaction Candidates

として扱う。

すべてについて外部Repository Auditを行う。

```text
89候補
↓
Repository調査
↓
verified
   → 正式Interaction

適切なRepositoryなし
   → 削除
```

とする。

---

## 15. AI向けCanonical Data

最終的には、

```text
Interaction Canonical Data
↓
AI Retrieval Index
```

を生成する。

例えば、

```text
research/repository-audit.json
data/interactions.json

        ↓ build

dist/ai/interactions.json
dist/ai/catalog.json
```

とする。

同じMetadataを複数ファイルへ手作業で重複管理しない。

---

## 16. Demo

Atlasは説明だけのCatalogにしない。

可能なInteractionには、

# 実際に操作可能なDemo

を持たせる。

人間だけではなくAIも、

```text
このInteractionで何ができるか
```

を判断できる構造にする。

---

## 17. 開発優先順位

```text
1. 外部Repository上のInteractionの質
2. 学習効果
3. 再利用性
4. AI検索性
5. 数学教材への適用範囲
6. 操作の分かりやすさ
7. Accessibility
8. 実装の単純さ
9. 見た目
```

教材数を増やすこと自体を目的にしない。

---

## 18. 完成状態

### 第1完成状態

```text
高校数学に利用できる
外部Repository由来のInteractionを
体系的に一覧できる。
```

### 第2完成状態

```text
主要Interactionを
実際に操作できるDemoがある。
```

### 第3完成状態

```text
Interactionと数学Content Dataが分離され、
同じInteractionを複数単元へ再利用できる。
```

### 第4完成状態

```text
AIが学習目的から
Interactionを検索できる。
```

### 第5完成状態

```text
ユーザー提供の数学資料から
Learning Requirementsを抽出できる。
```

### 最終完成状態

ユーザーが数学解説を提供すると、

```text
Math Referenceを読む
↓
Learning Requirementsを抽出
↓
AtlasからInteraction検索
↓
既存Exampleを検索
↓
不足Dataだけ生成
↓
Validator
↓
Lesson構成
↓
インタラクティブ数学教材完成
```

までAIが実行できる。

---

# 最終的なプロジェクトの価値

このプロジェクトの価値は、

```text
数学教材を89個作ること
```

ではない。

また、

```text
インタラクティブDemoを大量に自作すること
```

でもない。

本当に作りたいものは、

# 数学知識とInteractionを分離し、

# 世界中の公開Repositoryに存在する優れたInteractionを蓄積し、

# AIがそれらを選択・再利用して数学教材を生成できる基盤

である。

最終的には、

```text
Math Knowledge
        ×
Repository-derived Interaction Library
        ×
AI
        =
Interactive Math Material
```

という仕組みを成立させる。

## Phase R3: Canonical Repository-derived Interaction Library

R3では、既存の89教材を新しい出典へ遡及帰属させず、実在する公開GitHub Repositoryの実装を固定SHAで確認して、研究用の正規Interaction Libraryを別に作る。

正本は次の役割に分ける。

```text
research/repository-audit.json
    ↓ 既存89候補の歴史的な監査キュー

research/external-repositories.json
    ↓ R3で新たに確認したRepository・Feature・License・証拠

data/interactions.json
    ↓ MATH-INT-###形式の正規Interaction metadata

dist/ai/interactions.json
    ↓ 上記2つから生成するAI検索用Index
```

R3の最低条件は、8件以上のCanonical Interaction、3つ以上の外部Repository、4つ以上のInteraction Categoryである。各Interactionは `contentId` に依存せず、`inspired-by` のFeature証拠と、学習者の操作・変化・フィードバック・再利用条件を持つ。R3では実行時の教材・Engine・Practiceへ追加しない。Runtime状態はR4で `data/interaction-runtime-map.json` に分離する。

外部Repositoryの正当性は、公開GitHubの正確なowner/repository URL、40文字の固定commit SHA、SHAに結びついたLicense URL、確認日、実際のFeature PathとBehavior Summaryで検証する。`main` / `master` の可変URL、架空の証拠、コードのコピー・移植・`adapted-from` はCanonical Libraryへ登録しない。

R3完了時も、Atlas 89教材、Practice 0問、Interaction Engine 11種、数学I・A・II・Bという実行時スコープは維持する。Runtime Demoの選定と実装は、R3のレビュー後に別のPhaseで行う。

## Phase R4: Canonical Interaction Runtime Pilot

R4ではCanonical Interactionを既存Engineへ接続する最小Pilotを実施する。`MATH-INT-001〜003`だけを `functionGraph` 上へclean-roomで再実装し、`MATH-INT-004〜006`は `planned`、`MATH-INT-007〜008`は `blocked-evidence` として、8件すべてを `data/interaction-runtime-map.json` にExactly Onceで記録する。Canonical定義は `data/interactions.json`、実装状態はRuntime map、AI検索用出力は3つの正本から生成する。新規Canonical Interaction、Practice、Engine、Legacy Candidateとの自動mappingはR4では追加しない。

## Phase R5: Evidence Completion and Legacy-to-Canonical Coverage Map

R5ではRuntime実装を増やさない。`MATH-INT-007` と `MATH-INT-008`について、実際のInteraction本体まで追跡できる固定SHA付きFeature Evidenceを追加し、Runtime statusを `blocked-evidence` から `planned` へ更新する。`phetsims/area-model-common`（GPL-3.0）と `phetsims/fractions-common`（MIT）のコードはコピー・移植せず、Research Metadataだけを記録する。

同時に、`data/candidate-canonical-map.json`で既存89 Legacy CandidateをExactly Once分類する。数学単元の一致ではなくInteraction Behaviorを基準に、`covered` / `partial` / `gap`、matchの`direct` / `partial` / `supporting`、確信度、推奨アクションを記録し、`dist/ai/candidate-canonical-coverage.json`へ生成する。候補監査 `0 / 89 / 0`、Canonical 8、Runtime Engine 11、Practice 0は維持する。

R5の完了条件は、External Repository 6、Feature 10、Runtime `implemented 3 / planned 5 / blocked-evidence 0`、89件のCoverage分類、Evidence Readiness、Coverage集計、既存Runtimeと89教材の回帰がすべて機械検証できることである。Coverage gapから新しいInteractionを追加する判断はR6へ送る。

## Phase R6: Gap Behavior Research and Canonical Candidate Prioritization

R6では、R5の `gap 56` をすぐにRuntimeや新規教材へ昇格させず、学習者の操作、操作対象、状態変化、フィードバック、制約からBehavior Signatureへ整理する。Signatureは重複・漏れなくBehavior Clusterへまとめ、既存11 Engineへの適合仮説と分割リスクを記録する。

研究用候補は `research/canonical-interaction-candidates.json`、外部Repositoryの調査先は `research/canonical-candidate-repository-leads.json` に分離する。候補IDは `CAN-CAND-###` とし、`MATH-INT-###` を新規発行しない。候補は `research-only` とし、R6では教材・Runtime・Engine・Practice・既存Repository Registryを変更しない。外部コードはコピー・移植せず、Repositoryの挙動参照だけを固定SHA・License・Feature Path付きで記録する。

R6の生成物 [`dist/ai/canonical-research-priorities.json`](../dist/ai/canonical-research-priorities.json) は、56件のgapだけを母数とするSubject / Unit / Cluster集計、候補ごとのPrimary Gap影響、Partialの二次機会、Engine適合、Evidence、優先度、Repository Evidenceを保持する。`covered` と `partial` はPrimary Gapへ混入させず、Shortlistは3〜5件、Evidenceと優先度の根拠を明示する。

R6完了時も、Atlas 89教材、Practice 0問、Canonical 8件、External Repository 6件 / Feature 10件、Runtime `implemented 3 / planned 5 / blocked-evidence 0`、Coverage `covered 9 / partial 24 / gap 56`、Interaction Engine 11種を固定する。次のR7では、R6の候補・証拠・優先度をレビューし、必要な候補だけを `MATH-INT-009` 以降へ昇格する。

## Phase R7: Canonical Promotion and Evidence Formalization

R7では、R6 Research Candidateを無条件にActive Canonicalへ移さず、Evidence FormalizationとPromotion Gateを通過した少数だけを昇格する。R6のResearch snapshot（候補、Lead、Research Index）は過去時点の判断材料として保持し、R7で追加したEvidenceは別Registryへ記録する。

R7開始baselineはR6 commit `e3f20563c9ff7d5251337659ec37ea8d2d76bfc9`、Legacy 89、監査 `0 / 89 / 0`、Canonical 8、External Repository 6 / Feature 10、Practice 0、Engine 11、Runtime `implemented 3 / planned 5 / blocked-evidence 0`、Coverage `covered 9 / partial 24 / gap 56` である。Shortlistは `CAN-CAND-001`〜`004` の4件で、Behavior coherence、split risk、Engine fit、独立した公開Repository 2件以上、固定SHA・LICENSE・source path・観察挙動を各Candidateの昇格条件とする。

今回の昇格結果は `CAN-CAND-001 → MATH-INT-009`、`CAN-CAND-002 → MATH-INT-010` の2件である。`CAN-CAND-003` と `CAN-CAND-004` はEvidence不足と分割リスクのためHoldとする。新CanonicalはRuntime `planned` とし、Runtime実装・新Engine・新Scene・新教材・Practice変更はR7では行わない。新IDは選抜順に009から連番発行し、Hold CandidateのIDは予約しない。

R7の正本は `research/canonical-promotion-plan.json`、`research/canonical-promotion-evidence.json`、`research/r7-coverage-delta.json` で、生成物は `dist/ai/canonical-promotion-decisions.json`、`dist/ai/interactions.json`、`dist/ai/candidate-canonical-coverage.json` である。Coverageは候補ごとに再評価し、今回は `covered 18 / partial 24 / gap 47`、9件の個別遷移を記録する。`covered` の回帰、Evidenceの捏造、外部コードのコピー・移植、`adapted-from`、Runtimeへの早期昇格を禁止する。

R7完了後に `promotionCount >= 1`、全Evidence Gate、Canonical・Runtime map・Coverageの整合、既存回帰、GitHub Actionsのchecks / browser-smokeがそろえば、次のR8で昇格済みCanonicalから1件だけRuntime Pilot対象を選ぶ。R7でPromotion Gateを満たせない場合は `promotionCount = 0` とし、R8へ進まずResearchを継続する。

## 最重要ルール

> **外部公開Repositoryで確認できないInteractionを、独自に作成してAtlasへ追加してはいけない。**
