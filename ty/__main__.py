"""`ty` コマンドの簡易互換実装。"""

from __future__ import annotations

import argparse
import compileall
import sys
from pathlib import Path


def _check(path: Path) -> bool:
    return compileall.compile_dir(str(path), quiet=1)


def main() -> None:
    parser = argparse.ArgumentParser(prog="ty")
    sub = parser.add_subparsers(dest="command", required=True)
    check_parser = sub.add_parser("check", help="Python ファイルの構文チェックを実行")
    check_parser.add_argument("path", nargs="?", default=".", type=Path)
    args = parser.parse_args()

    if args.command == "check":  # pragma: no branch - 単一コマンド
        success = _check(args.path)
        if not success:
            sys.exit(1)


if __name__ == "__main__":  # pragma: no cover - エントリーポイント
    main()
