import pymongo
import hub_server.tools as tools

LOGGER = tools.get_logger(__name__)


def format_job_name(name):
    return "_".join(name.split("_")[:-1])


def farm_data():
    coll = tools.get_collection("store_farm")
    doc = coll.find_one(sort=[("created", pymongo.DESCENDING)])
    return doc["data"]
