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

カタログは数学Iの単元見出しごとにグループ化し、単元順はCatalog側の定義で安定させる。カードには、タイトル、一言説明、Interaction Typeだけを表示する。未実装の数学Aは非操作の「準備中」として扱う。

## インタラクション

`static/atlas/interactions/index.js` のInteraction Engine Registryを入口とする。ViewerはRegistryだけを呼び、`interaction.engine` に応じて `functionGraph`、`rangeGraph`、または `geometryBoard` をmountする。すべてのEngineは `reset()`、`destroy()`、`getState()` を返し、パラメータ型Engineは `setParameter()` も返す。

`static/atlas/interactions/function-graph.js` は軸、グリッド、関数グラフ、点、補助線、動的ラベル、パラメータ更新、Reset、Destroyを提供する。`range-graph.js` はこれを使って関数全体、定義域内の強調曲線、左右端の44pxドラッグハンドル、最大・最小候補を表示する。

`geometry-board.js` は動的図形の共通入口である。図形はドラッグで動かせるようにし、動点と固定点を視覚的に区別する。円の教材では `keepAspectRatio: true` を使い、座標・角度・長さはCanvas外でも確認できるようにする。今回の `unit-circle` modeは、点P、OP、射影線、角度、sin・cosの座標関係を表示する。

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
- カードと関連教材はbuttonとしてキーボード操作できるようにする
- `:focus-visible` は `2px solid #6366f1` と offset 2pxを維持する
- `prefers-reduced-motion: reduce` では遷移を抑制する

## URL

- `/atlas.html` — カタログ
- `/atlas.html?content=quadratic-basic` — 教材Viewer
- `/atlas.html?content=quadratic-range` — 最大・最小と定義域の教材Viewer
- `/atlas.html?content=unit-circle` — 単位円でsin・cosを見る教材Viewer
- `/atlas.html?subject=math1&unit=quadratic` — 単元指定カタログ

不正な `content` はエラー画面を作らず、履歴を置き換えて図鑑トップへ戻す。Viewer切り替え時は前のInteraction Engineを必ずDestroyする。
