# 高校数学インタラクティブ図鑑 Design Contract

Version: 1.0
Scope: `atlas.html` と `static/atlas/` の図鑑UI

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
9. Source / License

カタログは `SUBJECT_ORDER` とSubjectごとの単元順で科目・単元見出しを安定させる。科目未指定時は利用可能な全科目、`subject` 指定時はその科目だけを表示する。カードには、タイトル、一言説明、Interaction Typeだけを表示する。数学Iと数学Aの教材を表示し、数学Aは「場合の数と確率」から始める。

## インタラクション

`static/atlas/interactions/index.js` のInteraction Engine Registryを入口とする。ViewerはRegistryだけを呼び、`interaction.engine` に応じて10種類のEngineをmountする。すべてのEngineは `reset()`、`destroy()`、`getState()` を返し、パラメータ型Engineは `setParameter()` も返す。

`static/atlas/interactions/function-graph.js` は軸、グリッド、関数グラフ、点、補助線、動的ラベル、パラメータ更新、Reset、Destroyを提供する。`range-graph.js` はこれを使って関数全体、定義域内の強調曲線、左右端の44pxドラッグハンドル、最大・最小候補を表示する。

`geometry-board.js` は動的図形の共通入口である。図形はドラッグで動かせるようにし、動点と固定点を視覚的に区別する。円の教材では `keepAspectRatio: true` を使い、座標・角度・長さはCanvas外でも確認できるようにする。`unit-circle` modeは点P、OP、射影線、角度、sin・cosの座標関係を表示し、`triangle-area-sine` modeは固定辺 `a = 3`、`b = 4` と動く角Cから高さ・sin C・面積を表示する。

`region-selector.js` はSVGとVanilla JavaScriptのRegionSelector RegistryでSceneを切り替える。`set-regions` は全体集合U、集合A・B、4つの原子的領域を表示し、領域クリックと4つのtoggle buttonが同じ `selectedMask` を更新する。集合論のbit mask、プレーンテキスト、KaTeX式は `static/atlas/math/set-regions.js` に分離する。`necessary-sufficient` はP・Qの包含関係を4状態で表示し、ボタン、SVG、包含関係、命題、必要条件・十分条件を同じ `relation` stateから更新する。`event-regions` は同じ4領域を使い、事象buttonで式を選ぶと対応するmaskを自動で塗る。`conditional-probability` はU→B→A∩B→公式の4段階をbuttonで進み、確率値ではなく「分母の世界がBへ変わる」ことを表示する。関係・事象・条件付き確率の計算はDOMに依存しない `static/atlas/math/set-relations.js` / `static/atlas/math/event-regions.js` / `static/atlas/math/conditional-probability.js` に置く。SVGは表示中心とし、操作はbuttonに集約する。

### Combinatorics Visualization

`combinatorics-viewer.js` は `tree-count`、`permutations`、`combinations` のSceneを共通Engine契約で提供する。数を先に固定表示するのではなく、樹形図や並べた結果、組へのグループ化からパターンを観察し、その後に階乗・順列・組合せの公式へ接続する。順列一覧はPhase 3Aの上限を5!までとし、組合せSceneの大きな順列一覧は表示上限を設けてモバイルの可読性を保つ。純粋な階乗・個数・列挙処理は `static/atlas/math/combinatorics.js` に置き、View層へ持ち込まない。

### Data Visualization

`data-lab.js` は `mean-median`、`variance-distance`、`boxplot`、`correlation` のSceneを共通Engine契約で提供する。数値を表へ並べるだけでなく、数値 → 位置 → 関係の順に、数直線・箱ひげ図・散布図へ変換して表示する。統計計算はDOMに依存しない `static/atlas/math/statistics.js` に置く。分散は高校数学Iの母分散 `1/n Σ(xi−x̄)²`、四分位数は奇数個の中央値を上下半分から除く方式、箱ひげ図は最小値・Q1・中央値・Q3・最大値の五数要約を使い、Tukey式の外れ値判定は行わない。

### Simulation

`simulation-lab.js` は理論値と1回ごとのシミュレーション結果を別の表示領域で扱う。`hypothesis-coin` では公平なコイン `p = 0.5`、20回試行、観測値以上の上側確率を使い、純粋な二項分布計算は `static/atlas/math/probability.js`、仮説検定の表示用事実は `static/atlas/math/hypothesis-test.js` に分離する。乱数結果を正確なp値や公式の証明として扱わない。

GeometryBoardの共通ContextはBoard生成、座標変換、複数の44pxタッチ領域、Resize、Reset、Destroyだけを担当し、数値状態と作図は8つのSceneが所有する。補助線は主図形より細く淡くし、注目する辺・角・中心だけに強調色を使う。座標計算は純粋関数へ分離し、退化三角形では中心を描かない。

SimulationLabはモードRegistryで教材を分ける。理論分布と実験分布は色と凡例の両方で区別し、有意水準は確率分布の高さとして描かず、計算した確率との数値比較として示す。

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

数式はKaTeXで描画し、失敗時はJSONのプレーンテキストを残す。JSXGraphとKaTeXのCDN URLは必ず固定バージョンを使う。JSXGraphはMITまたはLGPL-3.0-or-laterのデュアルライセンスであるため、各コンテンツのSourceに利用バージョンとライセンスを表示する。

## Responsive / Accessibility

- 1280px、768px、375px、320pxを基準にする
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
- `/atlas.html?content=quadratic-range` — 最大・最小と定義域の教材Viewer
- `/atlas.html?content=unit-circle` — 単位円でsin・cosを見る教材Viewer
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
