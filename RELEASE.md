# リリースガイド

このドキュメントは、Time List Sorterプラグインの新しいバージョンをリリースする手順を説明します。

## リリースプロセス

### 1. バージョンの更新

新しいリリースを作成する前に、以下のファイルでバージョン番号を更新してください：

- `package.json`
- `manifest.json`
- `versions.json`

例：バージョン1.2.0をリリースする場合

```json
// package.json
{
  "version": "1.2.0"
}

// manifest.json
{
  "version": "1.2.0"
}

// versions.json
{
  "1.0.0": "0.15.0",
  "1.1.0": "0.15.0",
  "1.2.0": "0.15.0"
}
```

### 2. 変更の確認とテスト

```bash
# 依存関係のインストール
npm install

# ビルドテスト
npm run build

# ビルド成果物の確認
ls -la main.js manifest.json
```

### 3. 変更をコミット

```bash
git add .
git commit -m "feat: バージョン1.2.0 - 新機能の説明"
```

### 4. タグの作成とプッシュ

```bash
# タグを作成
git tag v1.2.0

# タグとコミットをプッシュ
git push origin main
git push origin v1.2.0
```

### 5. 自動リリース

タグがプッシュされると、GitHub Actionsが自動的に：

1. プロジェクトをビルド
2. `main.js`と`manifest.json`を生成
3. GitHubのReleasesページに新しいリリースを作成
4. ビルド済みファイルをリリースに添付

## リリース後の確認

1. [Releases](https://github.com/cndlhvn/time-list-sorter/releases)ページで新しいリリースが作成されていることを確認
2. ダウンロードできるファイルが正しく添付されていることを確認：
   - `main.js`
   - `manifest.json`
3. ファイルサイズが適切であることを確認

## トラブルシューティング

### ビルドが失敗した場合

1. [Actions](https://github.com/cndlhvn/time-list-sorter/actions)タブでエラーログを確認
2. ローカルで`npm run build`を実行してエラーを再現
3. 問題を修正してから再度タグをプッシュ

### リリースが作成されない場合

1. タグが`v`で始まっていることを確認（例：`v1.2.0`）
2. GitHub Actionsが有効になっていることを確認
3. `GITHUB_TOKEN`権限が適切に設定されていることを確認

## バージョニング

このプロジェクトは[Semantic Versioning](https://semver.org/)に従います：

- **MAJOR** (X.0.0): 互換性のない変更
- **MINOR** (0.X.0): 後方互換性のある新機能
- **PATCH** (0.0.X): 後方互換性のあるバグ修正
