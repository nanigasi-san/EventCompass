"""イベントをガントチャートとして描画するビュー。"""
from __future__ import annotations

from typing import Dict

from PyQt6.QtCore import QLineF, QPointF, Qt
from PyQt6.QtGui import QBrush, QColor, QPen
from PyQt6.QtWidgets import QGraphicsRectItem, QGraphicsScene, QGraphicsView

from controllers.event_controller import EventController


class GanttChartView(QGraphicsView):
    """イベントデータを簡易表示するガントビュー。"""

    HOUR_WIDTH = 80
    ROW_HEIGHT = 30

    def __init__(self, event_ctrl: EventController) -> None:
        super().__init__()
        self.ctrl = event_ctrl
        self.scene = QGraphicsScene(self)
        self.setScene(self.scene)
        self.setRenderHint(self.RenderHint.Antialiasing)

    def draw(self) -> None:
        """イベント群を矩形として描画し直す。"""
        self.scene.clear()
        events = self.ctrl.list()
        for row, event in enumerate(events):
            start = self.ctrl.normalize_time(event.get("start", "00:00"))
            end = self.ctrl.normalize_time(event.get("end", "00:00"))
            rect = self._create_rect(row, start, end, event)
            self.scene.addItem(rect)
        self.draw_now_line()

    def draw_now_line(self) -> None:
        """現在時刻ラインを描画する（ダミー実装）。"""
        self.scene.addLine(QLineF(QPointF(0, 0), QPointF(0, max(1, self.scene.height()))), QPen(Qt.GlobalColor.red))

    def on_drag_move(self, event_id: int, new_start: str, new_end: str) -> None:
        """ドラッグ操作による時間更新を反映する。"""
        self.ctrl.update(event_id, {"start": new_start, "end": new_end})
        self.draw()

    # ------------------------------------------------------------------
    def _create_rect(self, row: int, start: int, end: int, event: Dict[str, object]) -> QGraphicsRectItem:
        width = (end - start) / 60 * self.HOUR_WIDTH
        x = (start / 60) * self.HOUR_WIDTH
        y = row * self.ROW_HEIGHT
        rect_item = QGraphicsRectItem(x, y, width, self.ROW_HEIGHT - 4)
        rect_item.setBrush(QBrush(QColor(70, 130, 180, 180)))
        rect_item.setPen(QPen(Qt.GlobalColor.black))
        rect_item.setToolTip(event.get("title", "(untitled)"))
        rect_item.setData(0, event.get("id"))
        rect_item.setFlag(QGraphicsRectItem.GraphicsItemFlag.ItemIsMovable, True)
        rect_item.setFlag(QGraphicsRectItem.GraphicsItemFlag.ItemSendsGeometryChanges, True)
        return rect_item
