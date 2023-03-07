#!/usr/bin/env bash
export PYTHONUNBUFFERED=1
set -e
set -x

source /software/env/etc_base_rez.env
REPO=$(echo $CI_REPOSITORY_URL | sed -e 's/.*@/git@/g' -e 's/.com\//.com:/g')
git remote set-url origin $REPO
git checkout -B "$CI_COMMIT_REF_NAME" "$CI_COMMIT_SHA"
git lfs install || true
git lfs pull
git lfs uninstall
export REZ_CONFIG_FILE=$PWD/ci/rezconfig.py
inv release --force