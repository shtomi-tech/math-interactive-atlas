# 数学インタラクティブ図鑑 — Project Goal

更新日: 2026-09-13

## 1. 最終ゴール

高校数学の重要概念を、次の流れで学べるインタラクティブな数学学習環境を作る。

```text
SEE → MOVE → NOTICE → BUILD → USE
見る → 動かす → 気づく → 組み立てる → 使う
```

公式を読むだけでなく、公式が成立する理由を自分で動かして発見できる教材を目指す。

短いProject Statementは次のとおり。

> 高校数学の公式や概念を、暗記する前に「触って理解」でき、その理解を問題演習・教材作成・学習記録まで一貫してつなげられる、インタラクティブな数学学習基盤を作る。

標語:

> 触って分かる高校数学。

## 2. Atlasの役割

Atlasは問題を解かせる場所だけではなく、数学概念の実験室として設計する。

- 数学的対象を視覚化する
- パラメータを動かして変化を見る
- 不変な関係を発見する
- 数式と図を対応させる
- 公式を暗記する前に意味を理解する

1教材では1つの数学的関係を主役にする。情報を詰め込みすぎず、例えば「二次関数 → 頂点」「判別式 → 共有点の個数」「信頼区間 → 区間を何度も作ったときの意味」のように焦点を絞る。

## 3. Practiceの役割

Atlasで理解した関係を、Practiceで実際に使えるか確認する。

```text
Atlas       概念を理解する
    ↓
Practice    自分で使えるか確認する
```

各Atlas教材に、基礎・標準・発展の3問を対応させる。現在の正本上は、89教材 × 3問 = 267問である。重要なのは問題数そのものではなく、Atlasで発見した数学的関係がPracticeで使える対応を成立させること。

## 4. 学習ループ

```text
図鑑を見る
↓
動かして理解する
↓
問題を解く
↓
正解 → 次へ
不正解 → 関連Atlasへ戻る
↓
再び問題を解く
↓
Progressへ記録
```

目指す循環は、理解 → 演習 → 間違い → 再理解 → 定着である。

## 5. 授業・教材作成での役割

生徒用アプリだけでなく、授業で使える教材基盤にする。

```text
Atlas
↓
問題を選ぶ
↓
Problem Setを作る
↓
Practiceとして使う / Worksheetとして印刷する
```

現在の学習面は次の5つである。

- Atlas: 概念理解
- Practice: 演習
- Problem Set: 教師による問題選択
- Worksheet: 印刷教材
- Progress: 学習状況

## 6. 現在の到達点

Phase 7B終了時点の基準値:

| 項目 | 現在値 |
| --- | ---: |
| Subjects | 数学I / 数学A / 数学II / 数学B |
| Atlas教材 | 89 |
| Practice問題 | 267 |
| Interaction Engine | 11 |
| Learning surfaces | Atlas / Practice / Problem Set / Worksheet / Progress |

数学I・Aだけの実験的プロトタイプから、高校数学I・A・II・Bを横断する学習システムへ移行した段階である。

## 7. Interaction Engineの原則

89教材を89個の独立アプリとして作らない。

```text
少数のInteraction Engine
        +
多数のContent Config / Scene
```

現在は11 Engineで89教材を再利用している。今後も「教材数の増加 ≠ Engine数の増加」を原則とし、同じ数学的操作はできるだけ同じEngineで表現する。

## 8. UIの原則

基本思想は「数学を見せる。UIは消える。」である。

- Light UI
- White Canvas
- Simple Controls
- Large Touch Targets
- Minimal Decoration

ゲーム的なXP・報酬・過剰なアニメーションを中心にしない。数学を主役にし、UIは理解を妨げない範囲に抑える。

## 9. AccessibilityとMobile

Dragだけに依存せず、同じ数学状態へ複数の経路で到達できるようにする。

- Pointer / Touch
- Keyboard
- Slider / Select / Button
- 色以外の状態表現
- 数値のテキスト表示
- 44px以上の主要操作領域
- `aria-label` / `aria-live`
- `:focus-visible`
- `prefers-reduced-motion`

基準viewportは1440px、1024px、768px、375px、320px。特に320pxを最低ラインとし、ページ全体の横スクロールは原則発生させない。

## 10. 数学的正確性

見た目の面白さより数学的な正しさを優先する。特に確率・統計・シミュレーション・仮説検定・微積分では、説明しているモデルと内部計算モデルを一致させる。「それらしく動く」実装は採用しない。

## 11. Pure Math Layer

数学計算はDOM・SVG・JSXGraph・UIから可能な限り分離する。

```text
Pure Math
    ↓
Interaction Engine
    ↓
UI
```

これにより、数学的正しさ・UI・教材内容を独立して検証できる状態を維持する。

## 12. Quality Gate

教材を追加できただけではPhase完了としない。最低限、次を満たすことを完了条件とする。

- 数学的正確性
- Pure Logic tests
- Contract tests
- Practice tests
- Browser tests
- Mobile
- Accessibility
- Regression

## 13. 品質保証基準: Phase 8A

Phase 7Bで範囲を広げた後、「広げるフェーズ」から「固めるフェーズ」へ移るための基準をPhase 8Aで定めた。

Phase 8Aでは次の数量を固定する。

```text
89教材
267問
11 Engine
```

新規教材・新規Practice ID・新規Engine・数学Cは追加しない。代わりに、次を品質保証する。

- 信頼区間の標本平均シミュレーションを正しい正規モデルへ修正
- z検定を標準正規分布で表示
- 不等式領域と円周上の点を実際に操作可能にする
- AlgebraLabの負号表示とSVGアクセシビリティを改善
- Practiceの難易度2/3の内容品質を監査・改善
- 320px / 375pxでの表示と操作を確認
- Browser E2E回帰テストを導入
- GitHub Actionsで動的構文検査とブラウザ検査を実行
- GitHub Pages公開後のSmoke Testを行う

Phase 8Aは単なるバグ修正ではなく、数学I・A・II・B版 v1.0の品質保証Phaseと位置づける。

## 14. Phase 8A完了後の拡張判断

品質基盤が完成した後、次の拡張方向を判断する。

- 数学Cへ拡張
- 数学IIIへ拡張
- Practice問題の質・量を拡張
- 教師向け教材作成機能を強化
- 学習履歴・弱点分析を強化

品質保証前に教材範囲をさらに広げない。

## 15. Phase 8B: 公開版と学習ループの完成

Phase 8Aで数学・操作・アクセシビリティの品質基盤を整えた後は、公開版での動作と学習の往復を完成させる。数量は引き続き次で固定する。

```text
89教材
267問
11 Engine
```

- 公開GitHub PagesのAtlas、Practice、Sets、Worksheet、Progressを実ブラウザで検証する
- `content-data.json` を正本に89教材を自動列挙し、全教材のmount・Reset・console/page errorを回帰確認する
- Atlasから対応するPracticeへ移動し、Practiceの不正解からAtlasへ戻り、同じ問題へ復帰できるようにする
- Practiceの結果をProgressへ保存し、再読み込み後も復習対象からAtlas/Practiceへ戻れるようにする
- 公開URLのasset version、主要DOM、JavaScript初期化をPages後段Smokeで確認する

Phase 8Bでも新規教材、新規Practice ID、新規Engine、数学C・数学III、Classroom Assignmentは追加しない。範囲の拡張ではなく、既存教材を実運用できる学習システムとして閉じることを優先する。

## 16. Phase 8C: 数学I・A・II・B版 v1.0 Release Certification

Phase 8Bで実装した学習ループを、GitHub Actionsと公開GitHub Pagesで最終受入できる状態へ固める。Phase 8Cは新機能追加Phaseではなく、次の数量を維持したまま公開品質を証明するリリースゲートである。

```text
Atlas: 89
Practice: 267
Interaction Engine: 11
Subjects: 数学I / 数学A / 数学II / 数学B
```

P0では、全89教材を独立Playwrightテストへ分割し、1教材の失敗で他教材の結果を失わないようにする。E2EのURLはlocalhostとGitHub Pagesのリポジトリサブパスで共通利用し、Pages workflowから厳密な`EXPECTED_ASSET_VERSION`を渡す。公開Pagesでは主要画面、全89教材、Atlas → Practice → Progress、console/page error、fallback、Reset、responsiveを実ブラウザで検証する。

P1では数学I・A・II・Bから既存問題を1ケースずつ使い、single-choiceとnumericの両回答形式を含む学習ループを回帰する。320px / 375pxではAtlas、Practice、Sets、Progressと代表教材の横スクロールなしを確認する。

P2では [`docs/RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) を公開品質の再利用可能なチェックリストとして維持する。

現時点の実装状態は、ローカルのPhase 8C回帰を通過したRelease candidateである。公開Pagesの実デプロイとGitHub Actionsの最終成功は、Pages workflowの手動実行後に確認する。完了後の表示は `数学I・A・II・B版 v1.0 / Status: Released / Quality Gate Passed` とする。

Phase 8Cでも新規教材、新規Practice ID、新規Engine、数学C・数学III、Classroom Assignment、既存Progressデータを破壊するschema変更は追加しない。

## 17. 長期的な完成像

高校数学全体を、次の面が一つにつながる学習基盤にする。

```text
高校数学
   │
   ├─ Atlas
   │    └─ 概念理解
   │
   ├─ Practice
   │    └─ 演習
   │
   ├─ Problem Set
   │    └─ 教師による問題選択
   │
   ├─ Worksheet
   │    └─ 印刷教材
   │
   └─ Progress
        └─ 学習状況
```

生徒が「分からない」と感じたとき、Atlasへ戻り、動かして理解し、Practiceでできるようになる体験を作る。

## 参照元

- Phase 7B実装基準: `1e4f0b7939978b8951fac3983e01377075f543c6`
- 現在の教材正本: [`static/atlas/content-data.json`](../static/atlas/content-data.json)
- 現在の問題正本: [`static/practice/problem-data.json`](../static/practice/problem-data.json)
- 設計正本: [`docs/atlas/DESIGN.md`](./atlas/DESIGN.md)
- 次Phaseの詳細指示: Web ChatGPTで確認した「Phase 8C：v1.0 Release Certification」
