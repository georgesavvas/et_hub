#!/usr/bin/bash
SRC=${REZ_BUILD_SOURCE_PATH}/source
DEST=${REZ_BUILD_INSTALL_PATH}

# Copy the files into place
cp -ruv ${SRC}/bin ${SRC}/src ${SRC}/public ${DEST}
cp -uv ${SRC}/package.json ${SRC}/package-lock.json ${DEST}

# change it's permissions
chmod +x ${DEST}/bin/*
