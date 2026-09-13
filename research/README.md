# External Repository Audit

`repository-audit.json` は、Atlas候補教材と外部公開Repositoryの関係を記録するResearch用Registryです。教材実行時の `static/atlas/content-data.json` には監査情報を混在させません。

Phase R2では、89候補教材を1件ずつ確認しました。Git履歴、README・DESIGNの履歴、過去の `content-data.json` のSource記録、コミットメッセージ、Research文書を先に調べましたが、候補固有の外部Repository由来を裏付ける履歴は確認できませんでした。したがって、現在の結果は `verified: 0 / needs-review: 89 / pending: 0` です。これは未確認の帰属を作らないための正直な結果です。

このRegistryは、候補教材の外部Repository監査作業キューです。Interactionの正規ID Registryではなく、`contentId` は監査対象を既存Contentへ結びつけるキーとしてだけ使います。Contentの描画ライブラリは `static/atlas/content-data.json` の `rendering.library` にあり、Repository、relation、License、evidenceの正本はこのResearch Registryだけです。

使用できるrelationは `inspired-by` と `adapted-from` だけです。未監査の候補は `pending`、確認に未解決点がある候補は `needs-review` とします。R2完了時点では全件が `needs-review` です。R2中に新たに見つかったRepositoryを、過去の実装の由来として遡及登録してはいけません。

`verified` のReferenceは、正確なGitHub Repository URL、RepositoryとURLの一致、固定40文字コミットSHA、対象Path、aspect、evidence、License、License URL、`licenseReviewed: true`、`reviewedAt`、および `attributionRequired` を記録します。`adapted-from` はこれに加え、License確認済み、固定した `ref`、元の `paths` を必須とします。コードを利用していない場合は `inspired-by` とし、似ているだけのRepositoryを出典として登録しません。`needs-review` には理由を残します。

監査結果は `node scripts/report-repository-audit.js` でこのJSONから集計します。89件の監査が完了しても、`needs-review` を正式採用済みとはみなしません。Atlas画面では `verified` の場合だけRepository詳細を表示し、`pending` / `needs-review` は正式採用済みと誤認させない表示にします。監査JSONを読み込めない場合は、画面に `Repository Audit unavailable` を表示します。

## Phase R3: Canonical Interaction Library

R3の新規調査は、既存89候補の監査とは分離します。新たに確認した公開GitHub Repository、固定commit SHA、License、Feature Path、実際のBehavior Summaryは [`external-repositories.json`](./external-repositories.json) に保存し、既存候補の監査キューである [`repository-audit.json`](./repository-audit.json)へ遡及登録しません。

Interactionの正本は [`../data/interactions.json`](../data/interactions.json) です。各IDは `MATH-INT-###`、各Sourceは外部Featureを参照する `inspired-by` とします。Runtime状態は [`../data/interaction-runtime-map.json`](../data/interaction-runtime-map.json) に分離します。`contentId`への依存、`main` / `master`の可変証拠URL、コードのコピー・移植・`adapted-from`、外部証拠のない独自Interactionは登録しません。

最低条件はCanonical Interaction 8件以上、外部Repository 3件以上、Category 4種以上です。`dist/ai/interactions.json` は `node scripts/build-interaction-index.js` で生成し、正本へ手入力しません。`check-external-repositories.js`、`check-interaction-library.js`、`check-interaction-index.js`、`report-interaction-library.js`で、出典・schema・生成結果・実数を検査します。

## Phase R4: Canonical Runtime Pilot

`data/interaction-runtime-map.json` は8件のCanonical InteractionをExactly Onceで記録します。001〜003は既存 `functionGraph` のclean-room Runtime、004〜006は `planned`、007〜008は `blocked-evidence` です。R4では新しいInteraction、Repository、Feature、Practice、Engineを追加しません。

## Phase R5: Evidence Completion and Coverage

R5では新しいRuntimeを追加せず、`phetsims/area-model-common` と `phetsims/fractions-common` の固定SHA付きFeature EvidenceをそれぞれREPO-005-F001 / REPO-006-F001として記録します。007/008は、既存Repositoryと新規共通Repositoryの二つのEvidenceがそろった場合だけRuntime statusを `planned` に変更します。外部コードはコピー・移植せず、relationは `inspired-by`、`adapted-from` は0件を維持します。

`data/candidate-canonical-map.json` は既存89候補の歴史的監査とは別のCoverage分析です。全候補をExactly Once、`covered` / `partial` / `gap`と根拠付きmatchへ分類し、`scripts/check-candidate-canonical-map.js` と `scripts/report-candidate-canonical-coverage.js` で検証・集計します。`dist/ai/candidate-canonical-coverage.json` は `scripts/build-candidate-canonical-index.js` から生成し、既存Interaction Indexとは分離します。

## Phase R6: Gap behavior research

R6では、R5のCoverage `gap 56` だけを調査対象にします。 [`gap-behavior-analysis.json`](./gap-behavior-analysis.json) は各gapの学習者操作、操作対象、状態変化、フィードバック、制約、gap理由、既存Engine適合仮説をBehavior Clusterへ整理します。Covered 9件とPartial 24件はPrimary Gapへ混ぜません。

[`canonical-interaction-candidates.json`](./canonical-interaction-candidates.json) は `CAN-CAND-###` 形式の研究候補です。Shortlistは3〜5件に制限し、候補は `research-only` のまま、`MATH-INT-###`、Runtime、教材、Practiceへ自動昇格させません。Priorityの根拠、Primary Gap、Secondary Partial、Engine適合、Evidence状態を候補ごとに記録します。

[`canonical-candidate-repository-leads.json`](./canonical-candidate-repository-leads.json) は候補の挙動を考えるためのResearch Leadです。Qualified leadは公開Repository、固定40文字SHA、SHA付きsource path、LICENSE、License確認日、観察した挙動を持ちます。GPL / AGPLを含む場合も `behavioral-reference-only` に限定し、コードのコピー・移植や `adapted-from` は行いません。R6の生成Indexは [`../dist/ai/canonical-research-priorities.json`](../dist/ai/canonical-research-priorities.json) です。

## Phase R7: Canonical promotion

R7では、R6のShortlistを `research/canonical-promotion-plan.json` で全件Decision化し、昇格したCandidateの追加Evidenceだけを `research/canonical-promotion-evidence.json` に記録します。昇格には独立した公開GitHub Repository 2件以上、固定40文字SHA、SHA上のLICENSEとsource path、観察挙動、`inspired-by`、`behavioral-reference-only`、clean-room境界が必要です。Evidence URLは `/blob/<sha>/` に固定し、外部コードはコピー・移植しません。

R7で正式化したRepositoryとFeatureは [`external-repositories.json`](./external-repositories.json) へ既存schemaで追加し、Canonicalは `data/interactions.json`、Runtime状態は `data/interaction-runtime-map.json` へ分離します。新Canonicalは `planned` のままで、R7ではRuntime実装を行いません。`r7-coverage-delta.json` はCandidate単位の遷移を記録し、Cluster全体の自動mappingを禁止します。R6生成IndexはR6 snapshotとして保持し、R7昇格Indexは [`../dist/ai/canonical-promotion-decisions.json`](../dist/ai/canonical-promotion-decisions.json) に分離します。

## Phase R8: Runtime Pilot

R8では、R7で昇格した `MATH-INT-009` のみを既存 `geometryBoard` 上の `canonical-constrained-measure` modeへ実装します。EvidenceのPhET observedBehaviorはcoordinate probeのsource pathに合わせて補正し、`MATH-INT-010` は `planned` のまま残します。外部Repositoryは引き続き `behavioral-reference-only`、実装はclean-roomです。Coverage、Candidate Map、Legacy、Practice、外部Evidenceの帰属は変更しません。
