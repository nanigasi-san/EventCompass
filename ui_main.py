"""アプリケーションのメインウィンドウ。"""

from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QTimer
from PyQt6.QtGui import QAction
from PyQt6.QtWidgets import (
    QApplication,
    QDialog,
    QFileDialog,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QStatusBar,
    QTabWidget,
    QTextEdit,
    QToolBar,
    QVBoxLayout,
    QWidget,
)

from controllers.event_controller import EventController
from controllers.item_controller import ItemController
from controllers.member_controller import MemberController
from io_manager import backup_json, load_json
from widgets.gantt_view import GanttChartView
from widgets.tag_filter import TagFilter


class EventCompassApp(QMainWindow):
    """EventCompass のメインウィンドウ。"""

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("EventCompass")
        self.member_ctrl = MemberController()
        self.event_ctrl = EventController()
        self.item_ctrl = ItemController()

        self.status_label = QLabel("準備完了")
        self.clock_label = QLabel("")

        self._build_ui()
        self._connect_signals()
        self._start_clock()

    # UI 構築 -----------------------------------------------------------
    def _build_ui(self) -> None:
        self._build_menu()
        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)

        member_tab = self._build_member_tab()
        self.tabs.addTab(member_tab, "運営管理")

        self.gantt_view = GanttChartView(self.event_ctrl)
        self.tabs.addTab(self.gantt_view, "ガント")

        self.tag_filter = TagFilter(self.item_ctrl)
        self.tabs.addTab(self.tag_filter, "資材フィルタ")

        status = QStatusBar(self)
        status.addPermanentWidget(self.clock_label)
        status.addWidget(self.status_label)
        self.setStatusBar(status)

    def _build_menu(self) -> None:
        toolbar = QToolBar("Main Toolbar")
        self.addToolBar(toolbar)

        self.action_open_act = QAction("開く", self)
        self.action_save_act = QAction("保存", self)
        self.action_exit_act = QAction("終了", self)

        toolbar.addAction(self.action_open_act)
        toolbar.addAction(self.action_save_act)
        toolbar.addAction(self.action_exit_act)

        menubar = self.menuBar()
        file_menu = menubar.addMenu("ファイル")
        file_menu.addAction(self.action_open_act)
        file_menu.addAction(self.action_save_act)
        file_menu.addSeparator()
        file_menu.addAction(self.action_exit_act)

    def _build_member_tab(self) -> QWidget:
        """運営管理タブを構築する。"""
        tab = QWidget()
        layout = QVBoxLayout(tab)

        # メンバー追加セクション
        add_section = QWidget()
        add_layout = QHBoxLayout(add_section)

        self.member_name_input = QLineEdit()
        self.member_name_input.setPlaceholderText("メンバー名を入力")
        add_layout.addWidget(QLabel("名前:"))
        add_layout.addWidget(self.member_name_input)

        self.member_role_input = QLineEdit()
        self.member_role_input.setPlaceholderText("役割を入力")
        add_layout.addWidget(QLabel("役割:"))
        add_layout.addWidget(self.member_role_input)

        self.add_member_btn = QPushButton("メンバー追加")
        add_layout.addWidget(self.add_member_btn)

        layout.addWidget(add_section)

        # メンバーリスト
        self.member_list = QListWidget()
        layout.addWidget(QLabel("メンバー一覧:"))
        layout.addWidget(self.member_list)

        # メンバーリストを更新
        self._refresh_member_list()

        return tab

    def _connect_signals(self) -> None:
        self.action_open_act.triggered.connect(self.action_open)  # type: ignore[arg-type]
        self.action_save_act.triggered.connect(self.action_save)  # type: ignore[arg-type]
        self.action_exit_act.triggered.connect(self.close)  # type: ignore[arg-type]
        self.add_member_btn.clicked.connect(self._add_member)  # type: ignore[arg-type]
        self.member_list.itemClicked.connect(self._show_member_details)  # type: ignore[arg-type]

    def _start_clock(self) -> None:
        timer = QTimer(self)
        timer.timeout.connect(self._update_clock)  # type: ignore[arg-type]
        timer.start(60_000)
        self._update_clock()
        self._clock_timer = timer

    # Actions -------------------------------------------------------------
    def action_open(self) -> None:
        path, _ = QFileDialog.getOpenFileName(
            self, "data ディレクトリ内の JSON", "data", "JSON Files (*.json)"
        )
        if not path:
            return
        target = Path(path)
        base_dir = target.parent
        members_path = base_dir / "members.json"
        events_path = base_dir / "events.json"
        items_path = base_dir / "items.json"
        if not (members_path.exists() and events_path.exists() and items_path.exists()):
            QMessageBox.warning(
                self,
                "読み込み失敗",
                "members.json / events.json / items.json が揃っていません。",
            )
            return
        self.member_ctrl.data = load_json(str(members_path))
        self.event_ctrl.data = load_json(str(events_path))
        self.item_ctrl.data = load_json(str(items_path))
        self.tag_filter.refresh()
        self.gantt_view.draw()
        self._refresh_member_list()
        self.status_label.setText(f"{base_dir} から読み込みました")

    def action_save(self) -> None:
        """3 つの JSON を保存する。"""
        for ctrl in (self.member_ctrl, self.event_ctrl, self.item_ctrl):
            backup_json(ctrl.filepath)
            ctrl.save()
        self.status_label.setText("保存しました")

    def _add_member(self) -> None:
        """メンバーを追加する。"""
        name = self.member_name_input.text().strip()
        role = self.member_role_input.text().strip()

        if not name:
            QMessageBox.warning(self, "入力エラー", "メンバー名を入力してください。")
            return

        if not role:
            QMessageBox.warning(self, "入力エラー", "役割を入力してください。")
            return

        try:
            member_data = {
                "name": name,
                "role": role,
                "status": "active",
                "schedule": [],
                "contacts": {"phone": "", "note": ""},
            }
            self.member_ctrl.add(member_data)
            self._refresh_member_list()
            self.member_name_input.clear()
            self.member_role_input.clear()
            self.status_label.setText(f"メンバー '{name}' を追加しました")
        except Exception as e:
            QMessageBox.critical(self, "エラー", f"メンバーの追加に失敗しました: {e}")

    def _refresh_member_list(self) -> None:
        """メンバーリストを更新する。"""
        self.member_list.clear()
        members = self.member_ctrl.list()
        for member in members:
            name = member.get("name", "")
            role = member.get("role", "")
            status = member.get("status", "active")
            status_text = "●" if status == "active" else "○"
            item_text = f"{status_text} {name}({role})"
            item = QListWidgetItem(item_text)
            item.setData(0, member.get("id"))  # IDを保存
            self.member_list.addItem(item)

    def _show_member_details(self, item: QListWidgetItem) -> None:
        """メンバーの詳細情報を表示する。"""
        member_id = item.data(0)
        if not member_id:
            QMessageBox.warning(self, "エラー", "メンバーIDが取得できませんでした。")
            return

        member = self.member_ctrl.get(member_id)
        if not member:
            QMessageBox.warning(
                self, "エラー", f"ID {member_id} のメンバーが見つかりません。"
            )
            return

        # デバッグ情報を追加
        print(f"Debug - Member data: {member}")

        dialog = QDialog(self)
        dialog.setWindowTitle(f"メンバー詳細 - {member.get('name', '不明')}")
        dialog.setModal(True)
        dialog.resize(400, 300)

        layout = QVBoxLayout(dialog)

        # 基本情報
        info_text = QTextEdit()
        info_text.setReadOnly(True)

        details = []
        details.append(f"ID: {member.get('id', '不明')}")
        details.append(f"名前: {member.get('name', '不明')}")
        details.append(f"役割: {member.get('role', '不明')}")
        details.append(f"ステータス: {member.get('status', '不明')}")

        # 連絡先情報
        contacts = member.get("contacts", {})
        if contacts.get("phone"):
            details.append(f"電話: {contacts.get('phone', '')}")
        if contacts.get("note"):
            details.append(f"備考: {contacts.get('note', '')}")

        # スケジュール情報
        schedule = member.get("schedule", [])
        if schedule:
            details.append("\nスケジュール:")
            for sched in schedule:
                start_time = sched.get("start", "")
                end_time = sched.get("end", "")
                task = sched.get("task", "")
                details.append(f"  {start_time}-{end_time}: {task}")
        else:
            details.append("\nスケジュール: 未設定")

        # デバッグ情報も表示
        details.append(f"\n[デバッグ] 全データ: {member}")

        info_text.setPlainText("\n".join(details))
        layout.addWidget(info_text)

        # 閉じるボタン
        close_btn = QPushButton("閉じる")
        close_btn.clicked.connect(dialog.accept)  # type: ignore[arg-type]
        layout.addWidget(close_btn)

        dialog.exec()

    # Utilities -----------------------------------------------------------
    def _update_clock(self) -> None:
        from datetime import datetime

        self.clock_label.setText(datetime.now().strftime("%H:%M"))


def run() -> None:
    app = QApplication([])
    window = EventCompassApp()
    window.show()
    app.exec()


if __name__ == "__main__":
    run()
