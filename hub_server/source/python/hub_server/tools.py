from pprint import pprint
import os
import logging
import re
import glob
import json

import pymongo

from hub_server.log_formatter import LogFormatter


LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
ch.setFormatter(LogFormatter())
LOGGER.handlers = []
LOGGER.addHandler(ch)
LOGGER.propagate = False


def new_mongo_client():
    return pymongo.MongoClient(host=["slackbot"], port=27117)


MONGODB = new_mongo_client()
DB = MONGODB["et_hub"]

HOME = os.environ["HOME"]


def get_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    ch.setFormatter(LogFormatter())
    logger.handlers = []
    logger.addHandler(ch)
    logger.propagate = False
    return logger


async def process_request(request):
    cookies = json.loads(request.headers.get("cookies", {}))
    pprint(cookies)
    method = request.method
    if method == "GET":
        return
    return await request.json()


def upversion_string(s):
    match = re.match(".*?([0-9]*)$", s)
    number = match.group(1)
    if not number:
        s += "2"
    else:
        len_orig = len(number)
        upped = str(int(number) + 1)
        if len(upped) < len_orig:
            upped = upped.zfill(len_orig)
        s = s.replace(number, upped)
    return s


def latest_from_path(path, pattern="*", name_only=False):
    if not os.path.isdir(path):
        LOGGER.error("Invalid path.")
        return
    contents = sorted(glob.glob(os.path.join(path, pattern)))
    if contents:
        file = os.path.join(path, contents[-1])

    if name_only and "/" in file:
        return file.split("/")[-1]
    else:
        return file


def get_db():
    DB = MONGODB["et_hub"]
    return DB


def get_collection(name):
    DB = get_db()
    coll = DB[name]
    return coll


def get_mongo_client():
    return MONGODB
