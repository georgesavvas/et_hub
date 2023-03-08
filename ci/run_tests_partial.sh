#!/usr/bin/env bash
export PYTHONUNBUFFERED=1
source /software/env/etc_base_rez.env
git lfs install || true
git lfs pull
git lfs uninstall
export NO_BAFFLE=1
export REZ_CONFIG_FILE=$PWD/ci/rezconfig.py
export VOLT_DISABLE_FS_OPTIMISATIONS=$($PWD/ci/disable_fs_optimisations)
ci/rez-build-test-packages --build --partial
