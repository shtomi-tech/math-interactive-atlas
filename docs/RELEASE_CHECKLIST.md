# Math Interactive Atlas R5 Checklist

Phase R5では、R4のRuntime Pilotと89候補監査を維持したまま、007/008のEvidenceを補完し、89候補とCanonical InteractionのCoverageを分類する。Runtime実装は増やさず、根拠がない候補は `needs-review` として残し、`verified` と偽装しない。

## Current scope

- [ ] Atlas候補 89教材
- [ ] Practice 0問
- [ ] Interaction Engine 11種
- [ ] 数学I / 数学A / 数学II / 数学Bのみ
- [ ] `research/repository-audit.json` は89候補を保持し、`verified 0 / needs-review 89 / pending 0` である
- [ ] 監査Registryは候補監査キューであり、Interaction metadataの正規ID Registryとは分離されている
- [ ] Contentの描画情報は `rendering.library`、Repository由来情報は監査Registryだけにある
- [ ] Canonical Interaction 8件、外部Repository 6件、Feature 10件、Category 4種以上
- [ ] R3の正本は `data/interactions.json` と `research/external-repositories.json`で、`dist/ai/interactions.json`は生成物である
- [ ] Canonical Interactionは `contentId` に依存せず、Runtime状態を別のmappingで管理する

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
- [ ] `node scripts/check-r3-scope.js`
- [ ] `node scripts/check-external-repositories.js`
- [ ] `node scripts/check-interaction-library.js`
- [ ] `node scripts/build-interaction-index.js --check`
- [ ] `node scripts/check-interaction-index.js`
- [ ] `node scripts/report-interaction-library.js`
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
- [ ] 外部Repositoryは公開GitHubの正確なURL、固定40文字SHA、SHAに結びついたLicense URL、Feature Path、Behavior Summaryを持つ
- [ ] R3の証拠URLに `main` / `master` を使わない
- [ ] R3のRelationは `inspired-by` のみで、コードのコピー・移植・`adapted-from`を行わない

## Public Pages note

Pagesの公開検証はローカル検証とは別に扱う。Repositoryの公開設定またはGitHubプランでPagesを有効化できない場合は、公開ゲートを未確認として記録し、成功とは宣言しない。

## R4 gates

- [ ] Runtime mapping 8件、implemented 3件、planned 3件、blocked-evidence 2件
- [ ] `interactions.html` が8件を表示し、001〜003だけDemoをmountする
- [ ] `data/interactions.json`にRuntime状態を重複保持しない
- [ ] 旧 `static/atlas/interaction-metadata.json`をCanonical Sourceとして参照しない

## R5 gates

- [ ] Runtime mapping 8件、implemented 3件、planned 5件、blocked-evidence 0件
- [ ] REPO-005 / REPO-006の固定SHA、License、Feature Evidenceを確認する
- [ ] `MATH-INT-007` / `MATH-INT-008`が二つのRepository Featureを参照する
- [ ] `data/candidate-canonical-map.json`が89候補をExactly Onceで分類する
- [ ] `covered` / `partial` / `gap`の機械的整合性とrationaleを検査する
- [ ] `dist/ai/candidate-canonical-coverage.json`をBuild Scriptから生成する
- [ ] Coverage gapを新規Canonical InteractionやRuntimeへ自動昇格させない

## R6 gates

- [ ] R5の固定状態（Legacy 89 / audit 0-89-0 / Canonical 8 / repositories 6 / features 10 / Practice 0 / Engines 11 / runtime 3-5-0）を維持する
- [ ] `research/gap-behavior-analysis.json` がR5の56 gapをExactly OnceでSignature / Cluster化する
- [ ] `research/canonical-interaction-candidates.json` がPrimary gapだけを候補へ割り当て、Shortlistを3〜5件にする
- [ ] `secondaryPartialOpportunityIds` がPartial 24件だけを参照し、Coveredを含めない
- [ ] Repository Leadが固定SHA、公開状態、License、source path、観察挙動を持ち、`adapted-from`を使わない
- [ ] `dist/ai/canonical-research-priorities.json` をBuild Scriptから生成し、`--check`でstaleを拒否する
- [ ] R6候補を `data/interactions.json`、Runtime map、`dist/ai/interactions.json`、教材、Practiceへ追加しない
- [ ] R6の6チェッカー、既存検査、`npm test`、GitHub Actions checks / browser-smokeが成功する

## R7 gates

- [ ] R6 baseline commit `e3f20563c9ff7d5251337659ec37ea8d2d76bfc9` とR6 Research snapshotを保持する
- [ ] Shortlist 4件をPromotion PlanでExactly Once decision化し、promoteは最大3件、hold理由を記録する
- [ ] Promoteごとに独立した公開Repository 2件以上、固定SHA、LICENSE、source path、観察挙動をLive確認する
- [ ] Evidenceのrelationは `inspired-by`、implementation boundaryは `behavioral-reference-only`、`adapted-from` は0件である
- [ ] 今回のPromotionは `CAN-CAND-001 → MATH-INT-009`、`CAN-CAND-002 → MATH-INT-010`、新Runtimeはplannedである
- [ ] Coverage DeltaがCandidate単位で遷移を記録し、total 89、既存covered regression 0、gap reductionを満たす
- [ ] `dist/ai/canonical-promotion-decisions.json`、Active Interaction Index、Coverage IndexをBuild Scriptから生成する
- [ ] R7 ScopeでCanonical 10 / Repository 9 / Feature 13 / Runtime `3 implemented / 7 planned / 0 blocked` / Coverage `18 / 24 / 47` を確認する
- [ ] R4/R5/R6 checker、既存数学検査、`npm run check`、`npm test`、GitHub Actions checks / browser-smokeが成功する

## Forbidden in R4

- 新規Practice問題、Atlas教材、Interaction Engine
- 削除したPractice問題の別JSON・legacy・disabled保存
- 外部Repository未確認のInteractive Featureを `verified` として登録すること
- Content dataへRepository provenanceを重複保存すること
- 監査JSONの読み込み失敗を `pending` として表示すること
- 新規発見Repositoryを過去実装の由来として遡及帰属すること
- 数学C、数学III、Classroom Assignment
- 既存Progress保存形式や安定IDを破壊する変更
- R3での新規Atlas教材、Interaction Engine、Mode、Practice問題
- `research/external-repositories.json`のFeatureを既存89候補の過去の由来として登録すること
- `data/interactions.json`への`contentId`追加、可変Branch URL、外部証拠のないInteraction追加

## Next gate: post-R3 review

Web ChatGPTによるR3レビュー後、R4の3件Pilotだけを対象に進める。現行受入条件は、Canonical Interaction 8件、外部Repository 4件、Feature 8件、Practice 0問、Interaction Engine 11種、既存89教材の実装維持、監査 `0 / 89 / 0`、R4 Checker、全テスト、GitHub Actionsのchecks/browser-smoke成功である。
