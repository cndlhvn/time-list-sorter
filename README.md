# Time List Sorter Plugin for Obsidian

選択されたリストを時刻順でソートするObsidianプラグインです。

## 機能

- **選択範囲のリストソート**: 選択したリスト項目を時刻順でソート
- **ページ全体のリストソート**: ページ内のすべてのリストを一括で時刻順でソート
- リスト項目を時刻（HH:MM形式）でソート
- チェックボックス付きリストに対応
- 時刻が見つからない項目は最後に配置
- 元のフォーマット（チェック状態、インデント等）を維持
- 複数のリストグループを個別に処理

## 使用方法

### 選択範囲のソート
1. ソートしたいリストを選択
2. コマンドパレット（Ctrl/Cmd + P）から「選択したリストを時刻順でソート」を実行
3. または、リボンの時計アイコンをクリック

### ページ全体のソート（新機能！）
1. コマンドパレット（Ctrl/Cmd + P）から「ページ内のすべてのリストを時刻順でソート」を実行
2. ページ内のすべてのリストグループが自動的に時刻順でソートされます
3. 空行や見出しで区切られたリストは別々のグループとして処理されます

## サンプル

### ソート前
```
- [x] 13:20 - 14:10 打ち合わせ
- [x] 07:40 - 08:40 朝の散歩
- [ ] 21:00 - 22:30 読書
- [ ] 09:50 - 11:00 資料作成
- [ ] 19:00 - 19:30 夕食
```

### ソート後
```
- [x] 07:40 - 08:40 朝の散歩
- [ ] 09:50 - 11:00 資料作成
- [x] 13:20 - 14:10 打ち合わせ
- [ ] 19:00 - 19:30 夕食
- [ ] 21:00 - 22:30 読書
```

## インストール方法

### Git cloneから（最も簡単）

1. Obsidianのプラグインフォルダに直接cloneする:
   ```bash
   # プラグインフォルダに移動
   cd "[ボルトフォルダ]/.obsidian/plugins"
   
   # releaseブランチをclone
   git clone -b release https://github.com/cndlhvn/time-list-sorter.git
   ```

2. Obsidianを再起動してプラグインを有効化

### GitHub Releasesから

1. [Releases](https://github.com/cndlhvn/time-list-sorter/releases) ページから最新版をダウンロード
2. リリースページから `main.js` と `manifest.json` をダウンロード
3. Obsidianプラグインフォルダにインストール:
   
   **手順**:
   - Obsidianでボルト（ノートが保存されているフォルダ）を開く
   - ボルトフォルダ内の `.obsidian` フォルダを表示（隠しフォルダの場合があります）
   - `.obsidian` フォルダ内に `plugins` フォルダを作成（存在しない場合）
   - `plugins` フォルダ内に `time-list-sorter` フォルダを作成
   
   **参考パス例**:
   - Windows: `C:\Users\[ユーザー名]\Documents\[ボルト名]\.obsidian\plugins\time-list-sorter\`
   - macOS: `~/Documents/[ボルト名]/.obsidian/plugins/time-list-sorter/`
   - Linux: `~/Documents/[ボルト名]/.obsidian/plugins/time-list-sorter/`

4. ダウンロードした `main.js` と `manifest.json` を `time-list-sorter` フォルダにコピー
5. Obsidianを再起動してプラグインを有効化

### 手動ビルド（開発者向け）

1. このプロジェクトをクローンまたはダウンロード
2. `npm install` で依存関係をインストール
3. `npm run build` でプラグインをビルド
4. 生成された `main.js` と `manifest.json` をObsidianのプラグインフォルダにコピー
5. Obsidianでプラグインを有効化

### 開発者向け

```bash
# 依存関係のインストール
npm install

# 開発モード（ファイル変更を監視）
npm run dev

# プロダクションビルド
npm run build
```

## サポートされる時刻形式

- `HH:MM` （例：09:30, 14:15）
- 24時間形式
- 各行の最初に見つかった時刻を使用

## 対応リスト形式

- `- [ ] タスク` （チェックボックス付き）
- `- [x] タスク` （完了済み）
- `- タスク` （通常のリスト）
- `* タスク` （アスタリスク）
- `+ タスク` （プラス）
- `1. タスク` （番号付きリスト）

## ライセンス

MIT License
