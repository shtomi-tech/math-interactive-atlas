# 高校数学インタラクティブ図鑑 Design Contract

Version: 1.0
Scope: `atlas.html`、`practice.html`、`static/atlas/`、`static/practice/` の学習UI。数学I・A・Ⅱ・Bの89候補教材を対象とし、正式採用はExternal Repository Audit後に決める。

## 原則

```text
Good Design = Invisible UI + Visible Mathematics + Meaningful Interaction
```

- 数学をUIより目立たせる
- 明るい背景と白いInteractive Canvasを使う
- 色は数学的な意味を補助し、色だけで状態を伝えない
- 「触る → 観察 → 気づく」を中心にし、正誤判定やゲーム的な報酬を置かない
- 操作対象は標準コントロールと44px以上のタップ領域で提供する
- `prefers-reduced-motion` を尊重する

## トークン

図鑑専用のCSS変数は、既存アプリとの衝突を避けるため `--atlas-*` 名前空間を使う。

| 役割 | 値 |
| --- | --- |
| 背景 | `#f8f9fb` |
| Canvas | `#ffffff` |
| 本文 | `#1f2937` |
| 補助文字 | `#6b7280` |
| 境界線 | `#e5e7eb` |
| 操作アクセント | `#4f46e5` |
| 数学の主対象 | `#2563eb` |
| 数学の副対象 | `#e11d48` |
| 数学の補助線 | `#64748b` / `#94a3b8` |
| ハイライト | `#f59e0b` |

グラデーション、常時アニメーション、過剰な影、ガラス表現は使わない。カードの影は `0 1px 3px rgba(15, 23, 42, .06)` 程度に限定する。

## ページ構造

1. 図鑑ヘッダーと数学演習への戻りリンク
2. カタログまたはパンくず付きViewer
3. タイトルと短い説明
4. 独立した数式ブロック
5. Interactive Canvas
6. Controls と現在値
7. 発見ポイント
8. 関連する概念
9. Repository Audit status
10. Rendering information

カタログは `SUBJECT_ORDER` とSubjectごとの単元順で科目・単元見出しを安定させる。科目未指定時は利用可能な全科目、`subject` 指定時はその科目だけを表示する。カードには、タイトル、一言説明、Interaction Type、外部Repository監査状態を表示する。数学I・数学A・数学Ⅱ・数学Bを表示し、未実装の将来単元は空の見出しを保つ。

### Interaction Unit

Atlasの基本単位はRepositoryや数学単元ではなくInteractionとする。例えば、Parameter Graph Explorer、Draggable Geometry Point、Region Selector、Distribution Simulatorのように、「何を動かし、何が変わり、何に気づくか」を一つの再利用可能な単位として扱う。数学Contentは `content-data.json`、Interactionの共通実装はEngine、外部Repositoryの由来は `research/repository-audit.json` に分離する。

### Interaction Metadata

AIが数学単元名だけでなく、学習者に行わせたい認知活動から検索できるよう、Canonical metadataは `data/interactions.json` に保持する。Runtime実装状態は `data/interaction-runtime-map.json` に分離し、Interaction定義とEngine実装の責務を混ぜない。

```text
capabilities / learningPatterns / learnerActions / changes
feedbackCapabilities / bestFor / notBestFor / supports
```

同じMetadataを複数の正本へ手作業で重複させない。Repository、relation、Licenseは監査Registryを正本とする。

### Catalog Discovery

89候補教材を一覧から探せるよう、検索語、科目、単元、Interaction Typeのフィルタをカタログに置く。結果件数と空状態を表示し、条件は `q`、`subject`、`unit`、`type` のURLパラメータへ同期する。検索は日本語・英語のタイトル、説明、単元名、タグ相当の本文を対象にする。

### Learning Navigation

Viewerのパンくずには同一科目内の位置を表示し、教材末尾には前後の教材への導線を置く。順序は `curriculum.js` の正本に従い、単元をまたいでも同一科目内に限定する。関連教材は別の入口として残し、一本道にはしない。

### Learning Loop

External Repository Auditが完了するまで、Practiceは準備状態とする。将来の導線は `SEE → MOVE → NOTICE → USE → REVIEW` とするが、Practice問題が0件の間はPractice、Problem Set、Worksheetが明示的な空状態を表示し、ViewerはPractice sectionを生成しない。

- `SEE`: Atlasの候補教材を選び、動かして観察する
- `MOVE`: 対応する検証済み教材だけをPracticeへつなぐ
- `NOTICE`: 図鑑では正誤や点数を出さず、発見ポイントと変化を確認する
- `USE`: 監査済みの理解確認問題で学ぶ
- `REVIEW`: 将来の誤答時は該当教材へ戻す。ProgressはAtlasの閲覧・お気に入りを維持し、現在存在しない問題履歴を表示しない

## Classroom Use

```text
Atlas
↓
Practice Bank
↓
Problem Set
↓
Worksheet / Web Practice
```

問題セットは、問題が存在する段階では一覧から最大30問を教師指定の順番で選び、タイトルと説明を付けて保存する。現在のPractice問題は0件のため、Problem SetとWorksheetは選択可能な問題がないことを明示し、古い保存IDは無視してページを壊さない。セットはブラウザのlocalStorageへ保存し、共有リンクとJSONはログインやサーバー保存を使わず、問題IDと教材上の文章だけを扱う。

問題プリントはA4の紙面を正本とし、画面上の操作部は印刷時に隠す。問題ごとの途中式を書く余白と `break-inside: avoid` を確保し、解答付き版では問題の後に解答・解説を続ける。学習レポートは閲覧教材、問題の現在状態、単元別集計、最近の活動を示す。記録のJSON復元は結合せず、現在の記録をバックアップしたうえで明示確認して置き換える。

### Print UI note

印刷導線は問題セット編集画面の「問題プリントを開く」「解答付きプリントを開く」から開始する。Worksheet単体には図鑑・Practice・問題セットへの常設ナビゲーションを置かず、紙面の見出しと氏名・日付欄を優先する。

お気に入り・閲覧・Practiceの結果は `static/atlas/storage.js` の同一状態へ保存する。保存先はこのブラウザのlocalStorageだけで、ログイン、バックエンド、個人情報、XPやゲーム的報酬は導入しない。PracticeのUIは共有トークンを使い、クラス名は `practice-*` 名前空間に限定する。

## インタラクション

`static/atlas/interactions/index.js` のInteraction Engine Registryを入口とする。ViewerはRegistryだけを呼び、`interaction.engine` に応じて11種類のEngineをmountする。すべてのEngineは `reset()`、`destroy()`、`getState()` を返し、パラメータ型Engineは `setParameter()` も返す。

現時点ではInteraction Engineは11種類、Atlas候補教材は89種類である。External Repository Auditで正式採用を確認するまでは、新しいInteractive Featureを追加しない。将来の実装でも、連続的な変化はFunctionGraph / GeometryBoard / RangeGraph、数列のような離散的な変化はSequenceLabへ寄せる。FunctionGraphとGeometryBoardのScene実装は共通ContextとRegistryから分離し、教材固有の描画分岐を入口へ戻さない。

`static/atlas/interactions/function-graph.js` は軸、グリッド、関数グラフ、点、補助線、動的ラベル、パラメータ更新、Reset、Destroyを提供する。`range-graph.js` はこれを使って関数全体、定義域内の強調曲線、左右端の44pxドラッグハンドル、最大・最小候補を表示する。

### Continuous Mathematics

連続量の教材は、値を連続的に変えたときの形・変化率・蓄積を同じ学習順序で見せる。

```text
入力を連続的に変える
↓
関数の形が変わる
↓
変化率を観察する
↓
面積を蓄積する
```

指数・対数と三角関数は定義域と周期を明示し、微分は割線から接線、積分は符号付き面積へ接続する。`calculus.js` の多項式係数は低次から並べる `[a0, a1, a2, a3]` を正本とする。

### Discrete Mathematics

数列は連続曲線として補間せず、`SequenceLab` の離散点・項の表・部分和で表示する。等差・等比・漸化式を同じ表構造で比較し、点と点を線で結ばない。操作は初項、公差、公比、漸化式の係数、表示項数へ分ける。

`geometry-board.js` は動的図形の共通入口である。図形はドラッグで動かせるようにし、動点と固定点を視覚的に区別する。円の教材では `keepAspectRatio: true` を使い、座標・角度・長さはCanvas外でも確認できるようにする。`unit-circle` modeは点P、OP、射影線、角度、sin・cosの座標関係を表示し、`triangle-area-sine` modeは固定辺 `a = 3`、`b = 4` と動く角Cから高さ・sin C・面積を表示する。

`region-selector.js` はSVGとVanilla JavaScriptのRegionSelector RegistryでSceneを切り替える。`set-regions` は全体集合U、集合A・B、4つの原子的領域を表示し、領域クリックと4つのtoggle buttonが同じ `selectedMask` を更新する。集合論のbit mask、プレーンテキスト、KaTeX式は `static/atlas/math/set-regions.js` に分離する。`necessary-sufficient` はP・Qの包含関係を4状態で表示し、ボタン、SVG、包含関係、命題、必要条件・十分条件を同じ `relation` stateから更新する。`event-regions` は同じ4領域を使い、事象buttonで式を選ぶと対応するmaskを自動で塗る。`conditional-probability` はU→B→A∩B→公式の4段階をbuttonで進み、確率値ではなく「分母の世界がBへ変わる」ことを表示する。関係・事象・条件付き確率の計算はDOMに依存しない `static/atlas/math/set-relations.js` / `static/atlas/math/event-regions.js` / `static/atlas/math/conditional-probability.js` に置く。SVGは表示中心とし、操作はbuttonに集約する。

### Combinatorics Visualization

`combinatorics-viewer.js` は `tree-count`、`permutations`、`combinations` のSceneを共通Engine契約で提供する。数を先に固定表示するのではなく、樹形図や並べた結果、組へのグループ化からパターンを観察し、その後に階乗・順列・組合せの公式へ接続する。順列一覧はPhase 3Aの上限を5!までとし、組合せSceneの大きな順列一覧は表示上限を設けてモバイルの可読性を保つ。純粋な階乗・個数・列挙処理は `static/atlas/math/combinatorics.js` に置き、View層へ持ち込まない。

### Data Visualization

`data-lab.js` は `mean-median`、`variance-distance`、`boxplot`、`correlation` のSceneを共通Engine契約で提供する。数値を表へ並べるだけでなく、数値 → 位置 → 関係の順に、数直線・箱ひげ図・散布図へ変換して表示する。統計計算はDOMに依存しない `static/atlas/math/statistics.js` に置く。分散は高校数学Iの母分散 `1/n Σ(xi−x̄)²`、四分位数は奇数個の中央値を上下半分から除く方式、箱ひげ図は最小値・Q1・中央値・Q3・最大値の五数要約を使い、Tukey式の外れ値判定は行わない。

### Simulation

`simulation-lab.js` は理論値と1回ごとのシミュレーション結果を別の表示領域で扱う。`hypothesis-coin` では公平なコイン `p = 0.5`、20回試行、観測値以上の上側確率を使い、純粋な二項分布計算は `static/atlas/math/probability.js`、仮説検定の表示用事実は `static/atlas/math/hypothesis-test.js` に分離する。乱数結果を正確なp値や公式の証明として扱わない。

GeometryBoardの共通ContextはBoard生成、座標変換、複数の44pxタッチ領域、Resize、Reset、Destroyだけを担当し、数値状態と作図は10個のSceneが所有する。補助線は主図形より細く淡くし、注目する辺・角・中心だけに強調色を使う。座標計算は純粋関数へ分離し、退化三角形では中心を描かない。

SimulationLabはモードRegistryで教材を分ける。理論分布と実験分布は色と凡例の両方で区別し、有意水準は確率分布の高さとして描かず、計算した確率との数値比較として示す。

### Statistical Inference

統計的な推測は、理論値と乱数実験を混同させず、次の順序で表示する。

```text
標本
↓
分布
↓
推定
↓
判断
```

標本平均のばらつき、信頼区間、仮説検定は数値と前提を併記する。「帰無仮説が正しい確率」のような誤解を招く表現は使わず、観測結果が仮定した分布のもとでどれほど極端かを示す。`statistical-inference.js` と `sampling.js` はDOMや乱数表示に依存しない純粋計算を担当する。

### External Repository Audit

正式採用するInteractive Featureは、確認済みの外部公開Repositoryに由来しなければならない。関係は `inspired-by` または `adapted-from` の2種類だけとし、`original` は採用しない。監査記録は実行時payloadと分離した `research/repository-audit.json` に置く。89候補には1件ずつ `pending` / `verified` / `needs-review` を付ける。このRegistryは候補の監査作業キューであり、Interactionの正規ID Registryではない。未確認の候補へ後付けの参照元を作らない。R2では全件を確認し、現在は `verified: 0 / needs-review: 89 / pending: 0` とする。`adapted-from` はLicense、固定40文字コミットSHA、`paths`を必須とする。

CatalogとViewerでは監査状態を控えめなBadgeで表示する。`verified` の場合だけRepository、Relation、LicenseをDetailsへ表示し、`pending` と `needs-review` は正式採用済みと誤認させない。監査JSONをHTTPエラー、JSONエラー、または不正なversion・payloadで読み込めない場合は、`Repository Audit unavailable` を表示し、`pending` として扱わない。

### Phase R0: Practice curation reset

現在の状態は次のとおりである。

```text
Atlas候補: 89
Practice: 0
Interaction Engine: 11
Subjects: 数学I / 数学A / 数学II / 数学B
```

R0では既存のオリジナルPractice問題を正本から削除し、Practice / Problem Set / Worksheet / Progressの基盤と保存形式は維持する。空状態では、Practiceは登録なし、Problem Setは選択不可、Worksheetは追加不可、Progressは問題0問を表示する。Atlasの閲覧・お気に入りと安定IDは維持し、古いPractice履歴はUI集計から除外する。

R0の品質ゲートは、再帰的JavaScript構文検査、静的契約検査、主要画面のPlaywright smoke / 89候補教材回帰 / レスポンシブ / アクセシビリティ検査、`git diff --check`で構成する。GitHub Pages設定が利用できない場合、公開検証は未確認として扱い、ローカル検証の成功と混同しない。

### Phase R2: Repository audit completion and provenance hardening

R2では89候補教材をInteraction単位の監査作業キューとして管理し、schema・relation・License条件をCheckerで固定する。候補固有の歴史的な外部Repository由来は確認できなかったため、全件を `needs-review` とし、参照元を捏造しない。`auditStatus = verified` かつ有効なReferenceを持つものだけを正式な外部由来教材として扱う。監査RegistryのIDはInteraction metadataの正規IDとは別管理とする。

### Phase R3: Research-only Interaction Library

`Legacy Candidate`、`Canonical Interaction`、`Runtime Engine`は別の概念として扱う。既存89候補の監査キューは `research/repository-audit.json`、R3で新たに確認した公開RepositoryとFeatureは `research/external-repositories.json`、Interactionの正規metadataは `data/interactions.json`を正本とする。旧 `static/atlas/interaction-metadata.json` はR4で廃止し、Canonical Interactionの手入力Registryを二重に持たない。

R3のInteractionは `MATH-INT-###` ID、`inspired-by` のFeature証拠、固定commit SHA、License確認、学習者の操作・変化・フィードバック・再利用条件を持つ。`contentId`を持たせない。R4以降のRuntime状態は `data/interaction-runtime-map.json` で管理し、AI向けの `dist/ai/interactions.json` は3つの正本から生成し、手で編集しない。

R3ではRuntimeを凍結する。既存89教材、11 Engine、Practice 0問、数学I・A・II・Bの範囲を維持し、新しい教材、Engine、Mode、Practice、数学C・数学III、Classroom機能は追加しない。外部Repositoryのコードをコピー・移植せず、次のRuntime実装候補はR3レビュー後に別Phaseで選定する。

### Phase R4: Canonical Runtime Pilot

R4ではCanonical InteractionとRuntime実装状態を分離し、`MATH-INT-001〜003`だけを既存の `functionGraph` Engine上へclean-roomで再実装する。`MATH-INT-004〜006`は `planned`、`MATH-INT-007〜008`は `blocked-evidence` とし、8件すべてを `data/interaction-runtime-map.json` に一度ずつ登録する。新規Engine、Practice、Canonical Interaction、Legacy Candidateとのmappingは追加しない。

### Phase R5: Evidence and Coverage

R5では `data/interaction-runtime-map.json` の001〜003の実装を変更せず、007/008の固定SHA付き外部Feature Evidenceだけを補完する。`data/interactions.json` の007/008はEvidenceに沿って二つのRepository Featureを参照し、Runtime状態は `planned` とする。GPL-3.0を含む外部コードはAtlasへコピー・移植しない。

既存89候補とCanonical Interactionの関係は `data/candidate-canonical-map.json` で分離して管理する。これはCandidate AuditではなくCoverage分析であり、候補IDをExactly Once、`covered` / `partial` / `gap`と根拠付きmatchで記録する。生成済みの `dist/ai/candidate-canonical-coverage.json` は専用Build Scriptからのみ作成し、既存の3-source Interaction Indexとは混ぜない。

### Phase R6: Gap research and candidate prioritization

R6の研究データはRuntimeの正本と分離する。`research/gap-behavior-analysis.json` はR5の56 gapをExactly OnceでBehavior SignatureとClusterへ整理し、`research/canonical-interaction-candidates.json` は昇格前の研究候補、`research/canonical-candidate-repository-leads.json` は固定SHAで確認した挙動参照先を保持する。これらは `MATH-INT-###`、`content-data.json`、Runtime map、外部Repositoryの稼働Registryへ追加しない。

候補のPriorityはPrimary Gap影響、対象Subject / Unit数、既存Engine適合、Evidenceの順で比較する。Shortlistは3〜5件、Primary Gapはgapだけ、Secondary Opportunityはpartialだけとし、同じPrimary Gapを複数Shortlistへ割り当てない。R6では操作状態の設計と証拠の不足を明示し、教材の見た目やコードの移植を先行させない。

### AI Retrieval Foundation

将来的な教材生成は `Math Reference → Learning Requirements → Interaction検索 → Example再利用 → 不足Data生成 → Validator → Lesson構成` の順で行う。Atlasは数学知識そのものを置き換えず、「どう学ばせるか」を検索可能なInteraction Libraryとして提供する。

### Modeling

数学と社会生活の教材は、現実を単純化してモデル化する過程と、モデルの限界を同じ画面で扱う。

```text
現実
↓
単純化・理想化
↓
モデル
↓
計算
↓
解釈
↓
モデル評価
```

モデル比較では残差やRMSEを表示し、複雑な式が常によいとは限らないことを明示する。意思決定では入力値を動かしたとき結論が変わる境界を示し、予測を事実として断定しない。

### Algebra Visualization

記号 → 部品 → 組み立て → 式の順に表示する。面積図では正の長さで構造を見せ、負の数を含む式の一般性は短い注記で補う。BUILD教材は前へ・次へ・最初からをbuttonとして提供する。

### Number Line Visualization

数 → 位置 → 距離 / 範囲の順に変換する。平方根は前後の平方数、絶対値は2点間の距離、不等式は開点・閉点と塗る向きで表す。

### Algorithm Visualization

結果を先に見せず、各stepで状態がどう縮約されるかを見せる。ユークリッド互除法では割り算の式と余りを段階ごとに表示し、最後に最大公約数へ接続する。

Discovery Pointは結論ではなく観察の問いにする。利用者が値を動かして関係を見つけられるよう、教材の発見ポイントへ答えを先に固定表示しない。

コンテンツ固有の違いは `content-data.json` の `interaction.engine`、`interaction.mode`、初期値、パラメータ定義へ寄せる。Viewerへ教材固有の描画分岐を追加しない。

グラフは主対象を青、副対象を赤、補助線をグレー、注目値をアンバーで描く。`a = 0` などの定義域外状態は、NaN・Infinity・誤った交点数を表示せず、短い説明で状態を示す。最大・最小では、定義域全体を薄い線、定義域内だけを主色で示し、端点と頂点の候補から値を計算する。

## 数式と出典

数式はKaTeXで描画し、失敗時はJSONのプレーンテキストを残す。JSXGraphとKaTeXのCDN URLは必ず固定バージョンを使う。描画ライブラリは `content-data.json` の `rendering.library` に表示する。Repository、relation、License、evidenceは `research/repository-audit.json` だけを正本とし、描画ライブラリの利用情報を候補固有の外部Repository由来として扱わない。

## Responsive / Accessibility

- 1440px、1024px、768px、375px、320pxを基準にする
- MobileはCanvas → Controls → Discoveryの順に縦積みする
- ページ全体に横スクロールを出さない
- Sliderにはラベルと現在値を表示する
- Resetはbuttonとして提供する
- DataLabのドラッグ教材には、同じstateへ到達できるスライダーまたは選択中データのキーボード操作を用意する
- カードと関連教材はbuttonとしてキーボード操作できるようにする
- `:focus-visible` は `2px solid #6366f1` と offset 2pxを維持する
- `prefers-reduced-motion: reduce` では遷移を抑制する

## URL

- `/atlas.html` — カタログ
- `/atlas.html?content=quadratic-basic` — 教材Viewer
- `/atlas.html?content=completing-square` — 平方完成をアニメーションする教材Viewer
- `/atlas.html?content=three-point-parabola` — 3点から放物線を作る教材Viewer
- `/atlas.html?content=quadratic-inequality` — 二次不等式を塗る教材Viewer
- `/atlas.html?content=parameter-intersections` — パラメータと共有点の教材Viewer
- `/atlas.html?content=quadratic-range` — 最大・最小と定義域の教材Viewer
- `/atlas.html?content=unit-circle` — 単位円でsin・cosを見る教材Viewer
- `/atlas.html?content=right-triangle-trig` — 直角三角形と三角比の教材Viewer
- `/atlas.html?content=trig-relations` — 三角比の相互関係の教材Viewer
- `/atlas.html?content=triangle-area-sine` — 三角形の面積とsinの教材Viewer
- `/atlas.html?content=set-regions` — 集合を塗って式を作る教材Viewer
- `/atlas.html?content=necessary-sufficient` — 必要条件・十分条件を集合で見る教材Viewer
- `/atlas.html?content=event-regions` — 余事象・和事象を塗る教材Viewer
- `/atlas.html?content=conditional-probability` — 条件付き確率で世界を絞る教材Viewer
- `/atlas.html?content=counting-tree` — 数え上げの樹形図教材Viewer
- `/atlas.html?content=permutations-all` — 順列を全部並べる教材Viewer
- `/atlas.html?content=combinations-order` — 組合せは順序を無視する教材Viewer
- `/atlas.html?content=mean-median-outlier` — 平均と中央値を壊してみる教材Viewer
- `/atlas.html?content=variance-distance` — 分散を距離として見る教材Viewer
- `/atlas.html?content=boxplot-drag` — 箱ひげ図を動かす教材Viewer
- `/atlas.html?content=correlation-builder` — 相関係数を作る教材Viewer
- `/atlas.html?content=hypothesis-test-coin` — 仮説検定をシミュレーションする教材Viewer
- `/atlas.html?subject=math1` — 数学Iだけのカタログ
- `/atlas.html?subject=mathA` — 数学Aだけのカタログ
- `/atlas.html?subject=math1&unit=quadratic` — 単元指定カタログ

不正な `content` はエラー画面を作らず、履歴を置き換えて図鑑トップへ戻す。Viewer切り替え時は前のInteraction Engineを必ずDestroyする。
