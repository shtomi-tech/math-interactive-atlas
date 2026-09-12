# Math Interactive Atlas Release Checklist

数学I・A・II・B版 v1.0を公開する前に、数量・静的検査・実ブラウザ・公開Pagesを同じ基準で確認する。

## Fixed scope

- [ ] Atlas 89教材
- [ ] Practice 267問
- [ ] Interaction Engine 11種
- [ ] 数学I / 数学A / 数学II / 数学Bのみ

## Local quality gates

- [ ] `npm ci`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `node scripts/check-atlas-contract.js`
- [ ] `node scripts/check-practice-data.js`
- [ ] `node scripts/check-practice-links.js`
- [ ] `node scripts/check-practice-coverage.js`
- [ ] `node scripts/check-practice-quality.js`
- [ ] `node scripts/check-learning-state.js`
- [ ] `node scripts/check-learning-record.js`
- [ ] `node scripts/check-asset-version.js`
- [ ] `git diff --check`

## Browser gates

- [ ] 89教材を`content-data.json`から自動列挙し、タイトル・mount・fallbackなし・Reset・console/page errorなしを確認
- [ ] Atlas → Practice → 誤答 → Atlas → 同一Practice → 正答 → Progress → Atlas/Practiceを確認
- [ ] 数学I・A・II・Bからsingle-choiceとnumericを含む学習ループを確認
- [ ] 320px / 375px / 768px / 1440pxで横スクロールなしを確認
- [ ] accessibilityと既存regressionを確認

## Public Pages gates

- [ ] Pages deploy succeeds
- [ ] `EXPECTED_ASSET_VERSION`と公開`static/asset-version.txt`が一致
- [ ] Atlas / Practice / Sets / Worksheet / Progressの主要DOMとJavaScript初期化が成功
- [ ] 公開Pagesで89教材回帰が成功
- [ ] 公開Pagesでlearning loopが成功
- [ ] `console.error` / `pageerror` / fallback / Reset errorが0件
- [ ] `Status: Released / Quality Gate Passed`へ更新

## Forbidden in this release gate

- 新規Atlas教材、Practice ID、Interaction Engine
- 数学C、数学III、Classroom Assignment
- 既存Progressデータを破壊するschema変更
