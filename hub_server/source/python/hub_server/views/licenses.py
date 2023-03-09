from hub_server import tools

LOGGER = tools.get_logger(__name__)


def format_licenses():
    coll = tools.get_collection("store_licenses")
    doc = coll.find_one(sort=[("_id", -1)])
    data = doc["data"]["data"]

    data_formatted = []
    for d in data:
        vendor, app, ws, user, checkout, site, num = d
        used, total = num.split("/")
        used = int(used)
        total = int(total)
        lic = {
            "app": app,
            "user": user,
            "ws": ws,
            "free": total - used,
            "total": total
        }
        data_formatted.append(lic)

    return data_formatted
