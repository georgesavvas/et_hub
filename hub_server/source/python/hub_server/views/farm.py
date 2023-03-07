import opencue.api as oc
import pymongo
import hub_server.tools as tools

LOGGER = tools.get_logger(__name__)


def format_job_name(name):
    return "_".join(name.split("_")[:-1])


def farm_data():
    coll = tools.get_collection("store_farm")
    doc = coll.find_one(sort=[("created", pymongo.DESCENDING)])
    return doc["data"]


def usage_by_show():

    def format_show(show, frames):
        formatted = {
            "name": show,
            "color": "hsl(249, 70%, 50%)",
            "children": format_frames(frames)
        }
        return formatted

    def format_frames(frames):
        formatted = []
        for key, value in frames.items():
            formatted.append(
                {
                    "name": key,
                    "color": "hsl(290, 70%, 50%)",
                    "loc": value
                }
            )
        return formatted

    coll = tools.get_collection("store_farm")
    doc = coll.find_one(sort=[("created", pymongo.DESCENDING)])
    jobs = doc["data"]["jobs"]

    data = {}
    shows = [format_job_name(job["show"]) for job in jobs]
    for show in shows:
        data[show] = {
                "waiting": 0,
                "running": 0,
                "dead": 0
            }

    for job in jobs:
        show = format_job_name(job["show"])
        for layer in job["layers"]:
            data[show]["waiting"] += layer["pendingFrames"]
            data[show]["running"] += layer["runningFrames"]
            data[show]["dead"] += layer["deadFrames"]

    data_formatted = {
        "name": "",
        "color": "hsl(46, 70%, 50%)",
        "children": [format_show(show, frames) for show, frames in data.items()]
    }

    return data_formatted


def usage_by_show_shot():

    def format_show(show, shots):
        formatted = {
            "name": show,
            "color": "hsl(249, 70%, 50%)",
            "children": format_shots(shots)
        }
        return formatted

    def format_shots(shots):
        formatted = []
        for key, value in shots.items():
            formatted.append(
                {
                    "name": key,
                    "color": "hsl(290, 70%, 50%)",
                    "loc": value
                }
            )
        return formatted

    coll = tools.get_collection("store_farm")
    doc = coll.find_one(sort=[("created", pymongo.DESCENDING)])
    jobs = doc["jobs"]

    data = {}
    for job in jobs:
        show = format_job_name(job["show"])
        shot = job["shot"]
        if not data.get(show):
            data[show] = {}
        if not data[show].get(shot):
            data[show][shot] = 0
        for layer in job["layers"]:
            data[show][shot] += layer["pendingFrames"] + layer["runningFrames"]

    data_formatted = {
        "name": "",
        "color": "hsl(46, 70%, 50%)",
        "children": [format_show(show, shots) for show, shots in data.items()]
    }

    return data_formatted


def usage_by_service():

    def format_service(service, frames):
        data = {
            "name": service,
            "color": "hsl(290, 70%, 50%)",
            "loc": frames
        }
        return data

    coll = tools.get_collection("store_farm")
    doc = coll.find_one(sort=[("created", pymongo.DESCENDING)])
    jobs = doc["data"]["jobs"]

    data = {}
    for job in jobs:
        for layer in job["layers"]:
            service = layer["service"]
            if not data.get(service):
                data[service] = 0
            data[service] += layer["pendingFrames"] + layer["runningFrames"]

    data_formatted = {
        "name": "",
        "color": "hsl(46, 70%, 50%)",
        "children": [format_service(service, frames) for service, frames in data.items()]
    }

    return data_formatted


def usage_by_job_type():
    def format_layers(layer, frames):
        data = {
            "name": layer,
            "color": "hsl(290, 70%, 50%)",
            "loc": frames
        }
        return data

    coll = tools.get_collection("store_farm")
    doc = coll.find_one(sort=[("created", pymongo.DESCENDING)])
    jobs = doc["data"]["jobs"]

    data = {}
    for job in jobs:
        for layer in job["layers"]:
            name = layer["name"]
            job_type = name.split(".")[0] if "." in name else "other"
            if not data.get(job_type):
                data[job_type] = 0
            data[job_type] += layer["pendingFrames"] + layer["runningFrames"]

    data_formatted = {
        "name": "",
        "color": "hsl(46, 70%, 50%)",
        "children": [format_layers(layer, frames) for layer, frames in data.items()]
    }

    return data_formatted


def host_status():

    def format_parent(name, children):
        formatted = {
            "name": name,
            "color": "hsl(249, 70%, 50%)",
            "children": children
        }
        return formatted

    def format_child(name, value):
        formatted = {
            "name": name,
            "color": "hsl(290, 70%, 50%)",
            "loc": value
        }
        return formatted

    coll = tools.get_collection("store_hosts")
    doc = coll.find_one(sort=[("created", pymongo.DESCENDING)])
    hosts = doc["data"]["hosts"]

    allocations = {
        "local.farm": "farm",
        "local.nuke": "farm",
        "local.workstation": "workstations",
        "local.houdini": "farm",
        "local.gpu": "farm",
        "local.unassigned": "other",
        "local.cloud": "cloud",
        "local.cloud_gpu": "cloud"
    }

    farm_down = 0
    farm_available = 0
    farm_locked = 0
    cloud = 0
    ws_locked = 0
    ws_available = 0
    ws_down = 0
    for host in hosts:
        allocation = allocations.get(host["allocation"], "other")
        nimby = host["isNimbyLocked"]
        up = host["isUp"]
        locked = host["isLocked"]
        if allocation == "farm":
            if not up:
                farm_down += 1
            elif locked:
                farm_locked += 1
            else:
                farm_available += 1
        elif allocation == "workstations":
            if nimby:
                ws_locked += 1
            elif up:
                ws_available += 1
            elif not up:
                ws_down += 1
        elif allocation == "cloud":
            if up and not locked:
                cloud += 1

    f_farm_down = format_child("Down", farm_down)
    f_farm_available = format_child("Up", farm_available)
    f_farm_locked = format_child("Disabled", farm_locked)
    f_cloud = format_child("Cloud", cloud)
    f_ws_locked = format_child("Nimby locked", ws_locked)
    f_ws_available = format_child("Up", ws_available)
    f_ws_down = format_child("Down", ws_down)

    f_farm = format_parent("farm", (f_farm_down, f_farm_available, f_farm_locked))
    f_cloud = format_parent("cloud", (cloud,))
    f_ws = format_parent("workstations", (f_ws_locked, f_ws_available, f_ws_down))

    data_formatted = {
        format_parent("hosts", (f_farm, f_cloud, f_ws_down))
    }

    return data_formatted