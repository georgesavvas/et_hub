from concurrent.futures import ThreadPoolExecutor
import re
import datetime

from hub_server import tools
import opencue.api as oc


LOGGER = tools.get_logger(__name__)

VERSION_PATTERN = re.compile(r"(_v\d{3}_)")


def get_cpu_times(job):
    layers = job.getLayers()
    data = {}
    for layer in layers:
        name = layer.name()
        runtime = 0
        frames = layer.getFrames()
        lowest = 9999999999
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
            if frame_runtime < lowest:
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
    existing = coll.find_one({"name": name}, {"_id": False})
    if existing and existing["state"] == 1:
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
    data["version"] = m.group()[1:-1] if m else ""
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


def farm_snapshot():
    jobs = []
    finished = []
    for job in oc.getJobs(include_finished=True):
        name = job.name()
        state = job.state()
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
        data["version"] = m.group()[1:-1] if m else ""
        if state == 1:
            finished.append(data)
            continue
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
        jobs.append(data)

    data = {
        "jobs": jobs,
        "finished": finished
    }

    coll = tools.get_collection("store_farm")
    now = datetime.datetime.utcnow()
    _id = coll.insert_one({
        "created": now,
        "expires": now + datetime.timedelta(days=1),
        "data": data
    }).inserted_id

    LOGGER.info("Cached farm snapshot at {}".format(_id))


def farm_snapshot_extended():
    store_renders = tools.get_collection("store_renders")
    all_jobs = oc.getJobs(include_finished=True)
    job_amount = len(all_jobs)
    store_renders_ = [store_renders] * job_amount
    with ThreadPoolExecutor(max_workers=16) as executor:
        executor.map(process_job, all_jobs, store_renders_)
    LOGGER.info("Cached farm snapshot extended.")
