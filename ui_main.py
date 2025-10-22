"""アプリケーションのメインウィンドウ。"""
from __future__ import annotations

from pathlib import Path

from PyQt6.QtCore import QTimer
from PyQt6.QtGui import QAction
from PyQt6.QtWidgets import (
    QApplication,
    QFileDialog,
    QLabel,
    QMainWindow,
    QMessageBox,
    QStatusBar,
    QTabWidget,
    QToolBar,
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

        member_tab = QWidget()
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

    def _connect_signals(self) -> None:
        self.action_open_act.triggered.connect(self.action_open)  # type: ignore[arg-type]
        self.action_save_act.triggered.connect(self.action_save)  # type: ignore[arg-type]
        self.action_exit_act.triggered.connect(self.close)  # type: ignore[arg-type]

    def _start_clock(self) -> None:
        timer = QTimer(self)
        timer.timeout.connect(self._update_clock)  # type: ignore[arg-type]
        timer.start(60_000)
        self._update_clock()
        self._clock_timer = timer

    # Actions -------------------------------------------------------------
    def action_open(self) -> None:
        path, _ = QFileDialog.getOpenFileName(self, "data ディレクトリ内の JSON", "data", "JSON Files (*.json)")
        if not path:
            return
        target = Path(path)
        base_dir = target.parent
        members_path = base_dir / "members.json"
        events_path = base_dir / "events.json"
        items_path = base_dir / "items.json"
        if not (members_path.exists() and events_path.exists() and items_path.exists()):
            QMessageBox.warning(self, "読み込み失敗", "members.json / events.json / items.json が揃っていません。")
            return
        self.member_ctrl.data = load_json(str(members_path))
        self.event_ctrl.data = load_json(str(events_path))
        self.item_ctrl.data = load_json(str(items_path))
        self.tag_filter.refresh()
        self.gantt_view.draw()
        self.status_label.setText(f"{base_dir} から読み込みました")

    def action_save(self) -> None:
        """3 つの JSON を保存する。"""
        for ctrl in (self.member_ctrl, self.event_ctrl, self.item_ctrl):
            backup_json(ctrl.filepath)
            ctrl.save()
        self.status_label.setText("保存しました")

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
