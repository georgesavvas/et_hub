from concurrent.futures import ThreadPoolExecutor
import re
import datetime

from hub_server import tools
from .. import cue


LOGGER = tools.get_logger(__name__)

VERSION_PATTERN = re.compile(r"(_v\d{3}_)")
COMP_VERSION_PATTERN = re.compile(r"(_v\d{3}$)")


def get_cpu_times(job):
    layers = job.getLayers()
    data = {}
    for layer in layers:
        name = layer.name()
        runtime = 0
        frames = layer.getFrames()
        lowest = -1
        highest = 0
        amount = len(frames)
        for frame in frames:
            start_time = frame.startTime()
            stop_time = frame.stopTime()
            if not start_time or not stop_time:
                amount -= 1
                continue
            cores = float(frame.resource().split("/")[1])
            frame_runtime = (stop_time - start_time) * cores
            if frame_runtime < lowest or lowest < 0:
                lowest = frame_runtime
            if frame_runtime > highest:
                highest = frame_runtime
            runtime += frame_runtime
        data[name.replace(".", "_")] = {
            "name": name,
            "sum": runtime,
            "avg": runtime / len(frames),
            "lowest": lowest,
            "highest": highest
        }
    return data


def process_job(job, coll):
    name = job.name()
    state = job.state()
    existing = coll.find_one({"finished.name": name}, {"_id": False})
    if existing and existing["state"] == "1":
        return existing
    data = {}
    data["name"] = name
    data["user"] = job.user()
    data["deadFrames"] = job.deadFrames()
    data["isPaused"] = job.isPaused()
    data["show"] = str(job.show())
    data["shot"] = str(job.shot())
    data["priority"] = job.priority()
    data["state"] = str(state)
    m = re.search(VERSION_PATTERN, name)
    if m:
        data["version"] = m.group()[1:-1]
    else:
        m = re.search(COMP_VERSION_PATTERN, name)
        data["version"] = m.group()[1:] if m else ""
    data["cpuTimes"] = get_cpu_times(job)
    layers = []
    for l in job.getLayers():
        layer = {}
        layer["name"] = l.name()
        services = l.data.services
        layer["service"] = services[0] if services else ""
        layer["totalFrames"] = l.totalFrames()
        layer["deadFrames"] = l.deadFrames()
        layer["succeededFrames"] = l.succeededFrames()
        layer["runningFrames"] = l.runningFrames()
        layer["pendingFrames"] = l.pendingFrames()
        layer["waitingFrames"] = l.waitingFrames()
        layer["succeededFrames"] = l.succeededFrames()
        layer["parent_paused"] = job.isPaused()
        layer["outputPaths"] = list(l.getOutputPaths())
        layer["percentCompleted"] = round(l.percentCompleted())
        layers.append(layer)
    data["layers"] = layers
    data["layerNames"] = [l["name"] for l in layers]
    _id = coll.replace_one({"name": name}, data, upsert=True)
    LOGGER.info(f"Cached render at {_id}")
    return data


def get_current_cores(layer):
    frames = layer.getFrames()
    total_cores = 0
    for frame in frames:
        if frame.state() != 2:
            continue
        host, cores, mem = frame.resource().split("/")
        total_cores += int(float(cores))
    return total_cores


def farm_snapshot():
    data = cue.get_jobs(include_finished=True)

    coll = tools.get_collection("store_farm")
    now = datetime.datetime.utcnow()
    _id = coll.insert_one({
        "created": now,
        "expires": now + datetime.timedelta(days=1),
        "data": data
    }).inserted_id

    coll = tools.get_collection("store_renders")
    for job in data["finished"]:
        coll.replace_one({"name": job["name"]}, job, upsert=True)
        LOGGER.info(f"Cached render {job['name']}")
    # for job in data["jobs"]:
    #     _id = coll.replace_one({"name": job["name"]}, job, upsert=True)
    #     LOGGER.info(f"Cached render at {_id}")

    LOGGER.info(datetime.datetime.now())
    LOGGER.info("Cached farm snapshot at {}".format(_id))


def farm_snapshot_extended():
    store_renders = tools.get_collection("store_renders")
    all_jobs = cue.get_jobs(include_finished=True)
    for job in all_jobs:
        process_job(job, store_renders)
    # job_amount = len(all_jobs)
    # store_renders_ = [store_renders] * job_amount
    # with ThreadPoolExecutor(max_workers=16) as executor:
    #     executor.map(process_job, all_jobs, store_renders_)
    LOGGER.info("Cached farm snapshot extended.")
