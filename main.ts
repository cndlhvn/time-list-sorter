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

        // ページ全体のリストソート用コマンドを追加
        this.addCommand({
            id: 'sort-all-lists-by-time',
            name: 'ページ内のすべてのリストを時刻順でソート',
            editorCallback: (editor: Editor) => {
                this.sortAllListsInPage(editor);
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

    private sortAllListsInPage(editor: Editor) {
        const fullText = editor.getValue();
        const lines = fullText.split('\n');

        // リストグループを検出
        const listGroups = this.detectListGroups(lines);

        if (listGroups.length === 0) {
            new Notice('ページ内にリスト項目が見つかりませんでした');
            return;
        }

        let totalSortedItems = 0;
        let processedLines = [...lines];

        // 各リストグループを逆順で処理（インデックスの変更を避けるため）
        for (let i = listGroups.length - 1; i >= 0; i--) {
            const group = listGroups[i];
            const groupLines = lines.slice(group.startIndex, group.endIndex + 1);

            // グループ内のリスト項目を抽出してソート
            const sortedGroup = this.processListGroup(groupLines);

            if (sortedGroup.sortedItems > 0) {
                // 元の行を置換
                processedLines.splice(group.startIndex, group.endIndex - group.startIndex + 1, ...sortedGroup.lines);
                totalSortedItems += sortedGroup.sortedItems;
            }
        }

        // ページ全体を更新
        editor.setValue(processedLines.join('\n'));

        new Notice(`${listGroups.length}個のリストグループで${totalSortedItems}個の項目を時刻順でソートしました`);
    }

    private detectListGroups(lines: string[]): Array<{ startIndex: number, endIndex: number }> {
        const groups: Array<{ startIndex: number, endIndex: number }> = [];
        let currentGroupStart: number | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (this.isListItem(line)) {
                // リスト項目を発見
                if (currentGroupStart === null) {
                    currentGroupStart = i; // 新しいグループの開始
                }
            } else {
                // リスト項目ではない行
                if (currentGroupStart !== null) {
                    // 現在のグループを終了
                    groups.push({
                        startIndex: currentGroupStart,
                        endIndex: i - 1
                    });
                    currentGroupStart = null;
                }
            }
        }

        // 最後のグループの処理
        if (currentGroupStart !== null) {
            groups.push({
                startIndex: currentGroupStart,
                endIndex: lines.length - 1
            });
        }

        return groups;
    }

    private processListGroup(groupLines: string[]): { lines: string[], sortedItems: number } {
        const listItems: ListItem[] = [];
        const nonListLines: string[] = [];

        groupLines.forEach((line, index) => {
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
            return { lines: groupLines, sortedItems: 0 };
        }

        // 時刻でソート（既存のロジックと同じ）
        listItems.sort((a, b) => {
            if (a.timeInMinutes === -1 && b.timeInMinutes === -1) {
                return a.originalIndex - b.originalIndex;
            }
            if (a.timeInMinutes === -1) return 1;
            if (b.timeInMinutes === -1) return -1;
            return a.timeInMinutes - b.timeInMinutes;
        });

        // ソートされたリスト項目を返す
        const sortedLines = listItems.map(item => item.line);

        return {
            lines: sortedLines,
            sortedItems: listItems.length
        };
    }
}
