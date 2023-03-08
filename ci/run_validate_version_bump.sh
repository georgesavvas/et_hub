#!/usr/bin/env bash
export PYTHONUNBUFFERED=1
source /software/venv/ci_pipeline_py/bin/activate
git lfs install || true
git lfs pull
git lfs uninstall
ci/validate-package-version-bump
