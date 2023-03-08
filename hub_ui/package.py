# -*- coding: utf-8 -*-

name = "hub_ui"

version = open("VERSION").read().strip()

uuid = "ddd1def2-e73f-4177-87eb-24aa176b36c8"

description = ""

requires = [
]

build_command = "{root}/build.sh"


def commands():
    env.PATH.append("{root}/bin")
