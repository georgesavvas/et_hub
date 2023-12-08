from ..tools import get_logger, get_collection
import re

LOGGER = get_logger(__name__)


def format_job_name(name):
    return "_".join(name.split("_")[:-1])


def farm_data():
    coll = get_collection("store_farm")
    doc = coll.find_one(sort=[("_id", -1)])
    return doc["data"]


def get_render_records(name):
    coll = get_collection("store_renders")
    if "_comp_" in name:
        nameFormatted = re.sub(r"(_v\d{3}$)", r"_v\\d{3}$", name, count=1)
    else:
        nameFormatted = re.sub(r"(_v\d{3}_)", r"_v\\d{3}_", name, count=1)
    nameFormatted = f"^{nameFormatted}$"
    data = coll.find(
        {"name": {"$regex": nameFormatted}},
        {"_id": False},
        limit=9,
        sort=[("_id", -1)]
    )
    return list(data)


def get_core_seconds(jobs):
    if not jobs:
        return []
    coll = get_collection("store_renders")
    docs = coll.find(
        {"name": {"$in": jobs}},
        {"name": True, "cpuTimes": True, "_id": False}
    )
    return list(docs)
