#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
printf "\n夜色手作 v08 — http://127.0.0.1:8766\n三个夜间游戏快速试玩：http://127.0.0.1:8766/workshops.html\n保持此窗口开启，按 Ctrl-C 停止。\n"
exec python3 serve.py
