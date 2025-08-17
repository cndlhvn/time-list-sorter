import { Plugin, Editor, MarkdownView, Notice } from 'obsidian';

interface ListItem {
    line: string;
    timeInMinutes: number;
    originalIndex: number;
}

export default class TimeListSorterPlugin extends Plugin {

    async onload() {
        console.log('Loading Time List Sorter plugin');

        // コマンドパレットにコマンドを追加
        this.addCommand({
            id: 'sort-list-by-time',
            name: '選択したリストを時刻順でソート',
            editorCallback: (editor: Editor) => {
                this.sortSelectedListByTime(editor);
            }
        });

        // リボンアイコンを追加
        this.addRibbonIcon('clock', '時刻順でリストをソート', () => {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                this.sortSelectedListByTime(activeView.editor);
            }
        });
    }

    onunload() {
        console.log('Unloading Time List Sorter plugin');
    }

    private sortSelectedListByTime(editor: Editor) {
        if (!editor.somethingSelected()) {
            new Notice('リストをソートするにはテキストを選択してください');
            return;
        }

        const selectedText = editor.getSelection();
        const lines = selectedText.split('\n');

        // リスト項目のみを抽出し、解析
        const listItems: ListItem[] = [];
        const nonListLines: string[] = [];

        lines.forEach((line, index) => {
            if (this.isListItem(line)) {
                const timeInMinutes = this.extractTimeInMinutes(line);
                listItems.push({
                    line: line,
                    timeInMinutes: timeInMinutes,
                    originalIndex: index
                });
            } else {
                nonListLines.push(line);
            }
        });

        if (listItems.length === 0) {
            new Notice('選択範囲にリスト項目が見つかりませんでした');
            return;
        }

        // 時刻でソート（時刻が見つからない項目は最後に配置）
        listItems.sort((a, b) => {
            if (a.timeInMinutes === -1 && b.timeInMinutes === -1) {
                return a.originalIndex - b.originalIndex; // 元の順序を保持
            }
            if (a.timeInMinutes === -1) return 1;
            if (b.timeInMinutes === -1) return -1;
            return a.timeInMinutes - b.timeInMinutes;
        });

        // ソートされたリストを再構築
        const sortedLines = listItems.map(item => item.line);

        // 非リスト行がある場合は警告
        if (nonListLines.length > 0) {
            new Notice(`${listItems.length}個のリスト項目をソートしました（非リスト行は除外されました）`);
        } else {
            new Notice(`${listItems.length}個のリスト項目を時刻順でソートしました`);
        }

        // エディタの選択範囲を置換
        editor.replaceSelection(sortedLines.join('\n'));
    }

    private isListItem(line: string): boolean {
        // リスト項目かどうかを判定（-, *, +, 数字.、チェックボックス付きなど）
        const listPattern = /^\s*[-*+]\s*(\[[ x]\]\s*)?/;
        const numberedListPattern = /^\s*\d+\.\s*/;
        return listPattern.test(line) || numberedListPattern.test(line);
    }

    private extractTimeInMinutes(text: string): number {
        // HH:MM形式の時刻を探す（最初に見つかった時刻を使用）
        const timePattern = /(\d{1,2}):(\d{2})/;
        const match = text.match(timePattern);

        if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);

            // 時刻の妥当性チェック
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                return hours * 60 + minutes;
            }
        }

        return -1; // 時刻が見つからない場合
    }
}
