"""タグフィルタを提供するウィジェット。"""
from __future__ import annotations

from typing import List

from PyQt6.QtWidgets import QCheckBox, QGridLayout, QLabel, QPushButton, QVBoxLayout, QWidget

from controllers.item_controller import ItemController


class TagFilter(QWidget):
    """タグを複数選択するための簡易フィルタ。"""

    def __init__(self, item_ctrl: ItemController) -> None:
        super().__init__()
        self.ctrl = item_ctrl
        self._tag_boxes: List[QCheckBox] = []
        self._grid = QGridLayout()
        self._build()
        self.refresh()

    def _build(self) -> None:
        layout = QVBoxLayout(self)
        header = QLabel("タグフィルタ")
        layout.addWidget(header)

        layout.addLayout(self._grid)

        refresh = QPushButton("更新")
        refresh.clicked.connect(self.refresh)  # type: ignore[arg-type]
        layout.addWidget(refresh)
        layout.addStretch(1)

    def refresh(self) -> None:
        """コントローラからタグ一覧を再構築する。"""
        while self._grid.count():
            item = self._grid.takeAt(0)
            widget = item.widget()
            if widget is not None:
                widget.deleteLater()
        self._tag_boxes.clear()
        for index, tag in enumerate(self.ctrl.all_tags()):
            box = QCheckBox(tag)
            self._tag_boxes.append(box)
            self._grid.addWidget(box, index // 2, index % 2)

    def selected_tags(self) -> List[str]:
        return [box.text() for box in self._tag_boxes if box.isChecked()]
