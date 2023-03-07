from tools import get_collection
import pymongo
import re


def get_render_records(name):
    coll = get_collection("store_renders")
    nameFormatted = re.sub(r"(_v\d{3}_)", r"_v\\d{3}_", name, count=1)
    nameFormatted = f"^{nameFormatted}$"
    data = coll.find(
        {"name": {"$regex": nameFormatted}},
        {"_id": False},
        limit=11,
        sort=[("name", pymongo.DESCENDING)]
    )
    return list(data)
