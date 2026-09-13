# Math Interactive Atlas R1 Checklist

Phase R1では、既存のオリジナルPractice問題を外し、外部Repository監査とAI検索用Interaction metadataへ移るための基盤を確認する。候補教材の正式採用と公開Releaseは、Phase R2の監査完了後に判定する。

## Current scope

- [ ] Atlas候補 89教材
- [ ] Practice 0問
- [ ] Interaction Engine 11種
- [ ] 数学I / 数学A / 数学II / 数学Bのみ
- [ ] `research/repository-audit.json` は89候補を全件 `pending` で保持する

## Data and static gates

- [ ] `static/practice/problem-data.json` が `[]`
- [ ] `npm ci`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `node scripts/check-atlas-contract.js`
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

- [ ] `research/README.md` が監査方針を説明している
- [ ] R0で外部Repositoryを未確認のまま割り当てていない
- [ ] 監査のrelationは `inspired-by` / `adapted-from` の2種類だけにする
- [ ] `adapted-from` はLicense、`ref`、`paths`、Attribution要件を記録する
- [ ] 参照元の後付け、削除問題のRepository内バックアップ、仮Referenceを作成していない

## Public Pages note

Pagesの公開検証はローカル検証とは別に扱う。Repositoryの公開設定またはGitHubプランでPagesを有効化できない場合は、公開ゲートを未確認として記録し、成功とは宣言しない。

## Forbidden in R0

- 新規Practice問題、Atlas教材、Interaction Engine
- 削除したPractice問題の別JSON・legacy・disabled保存
- 外部Repository未確認のInteractive Feature
- 数学C、数学III、Classroom Assignment
- 既存Progress保存形式や安定IDを破壊する変更

## Next gate: R2

89候補教材を1件ずつ監査し、Repository、Interactive Feature、relation、License、aspect、evidenceを `research/repository-audit.json` に固定する。`auditStatus: verified` と有効なReferenceがそろったものだけを正式Atlas教材として扱う。
