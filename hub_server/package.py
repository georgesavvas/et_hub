# -*- coding: utf-8 -*-

name = "hub_server"

version = open("VERSION").read().strip()

uuid = "83d7cf97-4eef-4d85-9307-07e7e38aa6fc"

description = ""

requires = [
    "volt_server_production",
    "volt_session",
    "volt_shell",
    "pycue",
    "python",
    "argparse",
    "imutils",
    "bots",
    "uvicorn",
    "fastapi",
    "redis",
    "rq_scheduler",
    "opencv_python",
    "timeago"
]

build_command = "{root}/build.sh"


def commands():
    env.PATH.append("{root}/bin")
    env.PYTHONPATH.append("{root}/python")
