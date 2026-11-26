#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
printf "\nNight Workshops v08 — http://127.0.0.1:8766\nTry the three night workshops: http://127.0.0.1:8766/workshops.html\nKeep this window open. Press Ctrl-C to stop.\n"
exec python3 serve.py
