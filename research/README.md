# External Repository Audit

`repository-audit.json` は、Atlas候補教材と外部公開Repositoryの関係を記録するResearch用Registryです。教材実行時の `static/atlas/content-data.json` には監査情報を混在させません。

Phase R2では、89候補教材を1件ずつ確認しました。Git履歴、README・DESIGNの履歴、過去の `content-data.json` のSource記録、コミットメッセージ、Research文書を先に調べましたが、候補固有の外部Repository由来を裏付ける履歴は確認できませんでした。したがって、現在の結果は `verified: 0 / needs-review: 89 / pending: 0` です。これは未確認の帰属を作らないための正直な結果です。

このRegistryは、候補教材の外部Repository監査作業キューです。Interactionの正規ID Registryではなく、`contentId` は監査対象を既存Contentへ結びつけるキーとしてだけ使います。Contentの描画ライブラリは `static/atlas/content-data.json` の `rendering.library` にあり、Repository、relation、License、evidenceの正本はこのResearch Registryだけです。

使用できるrelationは `inspired-by` と `adapted-from` だけです。未監査の候補は `pending`、確認に未解決点がある候補は `needs-review` とします。R2完了時点では全件が `needs-review` です。R2中に新たに見つかったRepositoryを、過去の実装の由来として遡及登録してはいけません。

`verified` のReferenceは、正確なGitHub Repository URL、RepositoryとURLの一致、固定40文字コミットSHA、対象Path、aspect、evidence、License、License URL、`licenseReviewed: true`、`reviewedAt`、および `attributionRequired` を記録します。`adapted-from` はこれに加え、License確認済み、固定した `ref`、元の `paths` を必須とします。コードを利用していない場合は `inspired-by` とし、似ているだけのRepositoryを出典として登録しません。`needs-review` には理由を残します。

監査結果は `node scripts/report-repository-audit.js` でこのJSONから集計します。89件の監査が完了しても、`needs-review` を正式採用済みとはみなしません。Atlas画面では `verified` の場合だけRepository詳細を表示し、`pending` / `needs-review` は正式採用済みと誤認させない表示にします。監査JSONを読み込めない場合は、画面に `Repository Audit unavailable` を表示します。
