# Math Interactive Atlas R2 Checklist

Phase R2では、89候補の外部Repository監査を完了し、由来の正本・失敗時表示・Checker・集計・E2Eを確認する。根拠がない候補は `needs-review` として残し、`verified` と偽装しない。

## Current scope

- [ ] Atlas候補 89教材
- [ ] Practice 0問
- [ ] Interaction Engine 11種
- [ ] 数学I / 数学A / 数学II / 数学Bのみ
- [ ] `research/repository-audit.json` は89候補を保持し、`verified 0 / needs-review 89 / pending 0` である
- [ ] 監査Registryは候補監査キューであり、Interaction metadataの正規ID Registryとは分離されている
- [ ] Contentの描画情報は `rendering.library`、Repository由来情報は監査Registryだけにある

## Data and static gates

- [ ] `static/practice/problem-data.json` が `[]`
- [ ] `npm ci`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `node scripts/check-atlas-contract.js`
- [ ] `node scripts/check-repository-audit.js --require-complete`
- [ ] `node scripts/report-repository-audit.js`
- [ ] Practice data / links / coverage / quality checkerが0件を許可
- [ ] Practice session checkerが空データと合成fixtureの両方を確認
- [ ] Problem Setが削除済みIDを無視する
- [ ] Worksheet modelが空データで安全に動作する
- [ ] Progress summaryが古いPractice履歴を除外し、Atlas閲覧を維持する
- [ ] `node scripts/check-asset-version.js`
- [ ] `git diff --check`

## Browser gates

- [ ] Practiceが「現在、Practice問題は登録されていません。」を表示する
- [ ] Setsが「現在、選択できる問題はありません。」を表示する
- [ ] Worksheetが「プリントに追加できる問題がありません。」を表示する
- [ ] Progressが問題0問とPractice準備状態を表示する
- [ ] Atlasの全89候補教材がmount・Resetでき、fallback・console error・pageerrorがない
- [ ] Practice問題がないAtlasでPractice sectionが表示されない
- [ ] 320px / 375px / 768px / 1440pxで横スクロールがない
- [ ] Keyboard操作、focus表示、aria状態を確認する

## Provenance preparation

- [ ] `research/README.md` がR2監査方針と実績を説明している
- [ ] Git履歴・既存ドキュメント・過去Source記録を先に確認した
- [ ] 根拠のないRepository、架空のURL/SHA/Path、R2で新規発見したRepositoryの遡及帰属を登録していない
- [ ] 監査のrelationは `inspired-by` / `adapted-from` の2種類だけにする
- [ ] `verified` は正確なGitHub URL、owner/repository一致、40文字SHA、Path、aspect、evidence、License、License URL、License確認日を記録する
- [ ] `adapted-from` はLicense、`ref`、`paths`、Attribution要件を記録する
- [ ] `needs-review` は理由を記録する

## Public Pages note

Pagesの公開検証はローカル検証とは別に扱う。Repositoryの公開設定またはGitHubプランでPagesを有効化できない場合は、公開ゲートを未確認として記録し、成功とは宣言しない。

## Forbidden in R2

- 新規Practice問題、Atlas教材、Interaction Engine
- 削除したPractice問題の別JSON・legacy・disabled保存
- 外部Repository未確認のInteractive Featureを `verified` として登録すること
- Content dataへRepository provenanceを重複保存すること
- 監査JSONの読み込み失敗を `pending` として表示すること
- 新規発見Repositoryを過去実装の由来として遡及帰属すること
- 数学C、数学III、Classroom Assignment
- 既存Progress保存形式や安定IDを破壊する変更

## Next gate: post-R2 review

Web ChatGPTによるR2レビュー後、指摘された次の実装指示だけを対象に進める。現行受入条件は、Practice 0問、Interaction Engine 11種、既存89教材の実装維持、監査 `pending 0`、`npm run check`、全テスト、GitHub Actionsのchecks/browser-smoke成功である。
