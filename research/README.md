# External Repository Audit

`repository-audit.json` は、Atlas候補教材と外部公開Repositoryの関係を記録するResearch用Registryです。教材実行時の `static/atlas/content-data.json` には監査情報を混在させません。

Phase R1の初期状態では、89候補教材をすべて `pending` として登録し、まだRepositoryを割り当てません。参照元を後付けで作らない方針を明示します。

Phase R1では、1候補につき1レコードを追加し、実際に確認したInteractive Feature、Repository URL、License、relation、aspect、evidenceを記録します。使用できるrelationは `inspired-by` と `adapted-from` だけです。未監査の候補は `pending`、確認に未解決点がある候補は `needs-review` とします。

`adapted-from` は、License確認済みであることに加え、固定した `ref` と元の `paths` を記録します。コードを利用していない場合は `inspired-by` とし、似ているだけのRepositoryを出典として登録しません。

89件の監査が完了するまで、候補数を正式採用数とみなしません。監査後に必要であれば、Atlas画面へ参考Repositoryを表示するかを別Phaseで判断します。`content-data.json` の候補ID集合と、このRegistryのID集合は常に完全一致させます。
