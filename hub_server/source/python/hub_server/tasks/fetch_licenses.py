import datetime
import requests

from hub_server import tools


LOGGER = tools.get_logger(__name__)


def fetch_licenses():
    url = "http://licensedesk.etc.com/api/v2/license-checkouts"
    data = requests.get(url).json()

    coll = tools.get_collection("store_licenses")
    now = datetime.datetime.utcnow()
    _id = coll.insert_one({
        "created": now,
        "expires": now + datetime.timedelta(days=5),
        "data": data
    }).inserted_id

    LOGGER.info("Cached licenses at {}".format(_id))
