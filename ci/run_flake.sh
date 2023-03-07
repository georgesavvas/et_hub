#!/usr/bin/env bash
export PYTHONUNBUFFERED=1
source /software/venv/ci_pipeline/bin/activate
git lfs install || true
git lfs pull
git lfs uninstall
export PYFLAKES_NODOCTEST="true"
flake8
