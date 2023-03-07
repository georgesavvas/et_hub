from collections import UserString
from logging import Formatter
import os
from concurrent.futures import ThreadPoolExecutor
from typing import NewType
import opencue.api as oc
import volt_shell as vs
import datetime
import requests
from hub_server import tools
from hub_server.studio_jobs import make_reels
from pprint import pprint
import re

import bots.api


LOGGER = tools.get_logger(__name__)

VERSION_PATTERN = re.compile(r"(_v\d{3}_)")


def get_cpu_times(job):
    layers = job.getLayers()
    data = {}
    for layer in layers:
        name = layer.name()
        s = name.split(".")[0] + "."
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


def hosts_snapshot():
    hosts = []
    for h in oc.getHosts():
        host = {
            "name": h.name(),
            "isUp": h.isUp(),
            "isNimbyEnabled": h.isNimbyEnabled(),
            "allocation": h.allocation(),
            "tags": list(h.tags()),
            "cores": h.cores(),
            "coresIdle": h.coresIdle(),
            "coresReserved": h.data.cores - h.data.idle_cores,
            "mem": h.mem(),
            "memFree": h.memFree(),
            "memIdle": h.memIdle(),
            "memReserved": h.memReserved(),
            "memUsed": h.memUsed(),
            "memTotal": h.memTotal(),
            "load": h.load(),
            "id": h.id(),
            "os": str(h.data.os),
            "state": h.state(),
            "isLocked": h.isLocked()
        }
        hosts.append(host)
    
    data = { "hosts": host }

    coll = tools.get_collection("store_hosts")
    now = datetime.datetime.utcnow()
    _id = coll.insert_one({
        "created": now,
        "expires": now + datetime.timedelta(days=5),
        "data": data
    }).inserted_id

    LOGGER.info("Cached hosts snapshot at {}".format(_id))


def fetch_licenses():
    url = "http://licensedesk.etc.com/api/v2/license-checkouts"
    data = requests.get(url).json()

    # pprint(data)

    coll = tools.get_collection("store_licenses")
    now = datetime.datetime.utcnow()
    _id = coll.insert_one({
        "created": now,
        "expires": now + datetime.timedelta(days=5),
        "data": data
    }).inserted_id

    LOGGER.info("Cached licenses at {}".format(_id))


def fetch_waiters():
    return
    now = datetime.datetime.utcnow()
    config = {
        "query": "gpfs_waiters_seconds",
        "instance": "etc-sn-001.london.etc",
        "start": int(datetime.datetime.timestamp(now - datetime.timedelta(seconds=30))),
        "end": int(datetime.datetime.timestamp(now)),
        "step": 10
    }
    url = "http://stat-vm01.london.etc:3000/api/datasources/proxy/5/api/v1/query_range?query={query}%7Binstance%3D~\"{instance}\"%7D&start={start}&end={end}&step={step}".format(
        **config
    )
    headers = {
        "Cookie": "grafana_session=5d351be1c2f543729ae7a66784b91b14"
    }
    data = requests.get(url, headers=headers).json()
    # pprint(data["data"]["result"])

    coll = tools.get_collection("store_waiters")
    _id = coll.insert_one({
        "created": now,
        "expires": now + datetime.timedelta(days=5),
        "data": data["data"]["result"]
    }).inserted_id

    LOGGER.info("Cached waiters at {}".format(_id))


def make_project_reels():
    reels = make_reels()

    now = datetime.datetime.utcnow()
    coll = tools.get_collection("store_reels")
    _id = coll.insert_one({
        "created": now,
        "expires": now + datetime.timedelta(days=5),
        "data": reels
    }).inserted_id

    LOGGER.info("Cached project reels at {}".format(_id))


def cuenotify_run():

    def format_time(sec):
        sec = int(sec)
        hours = sec // 3600
        mins = (sec % 3600) // 60
        secs = (sec % 3600) % 60

        if hours:
            final = "{}h {}m {}s".format(hours, mins, secs)
        elif mins:
            final = "{}m {}s".format(mins, secs)
        else:
            final = "{}s".format(secs)
        return final

    def get_layer(job, when, processed_layers):
        layers = [l for l in job.getLayers() if not l.name().startswith("cuenotify.")]
        final_layer = layers[-1]
        if when == "whole_job":
            pref = ("img.", "jpg.", "geo.", "ale.", "ass.")
            for layer in layers:
                for p in pref:
                    if layer.name().startswith(p):
                        return layer, True
            else:
                return layers[0], True
        else:
            for layer in layers:
                if layer.runningFrames() or layer.pendingFrames():
                    continue
                if layer.name() in processed_layers:
                    continue
                if when == "each_layer":
                    return layer, layer == final_layer
                elif layer.name().startswith("{}.".format(when)):
                    return layer, True
        return None, False

    def get_cpu_times(job, layer, final_layer):
        ignore = (
            "jpg.", "postprocess.", "mp4.", "cuenotify.", "register.", "publish.",
            "cleanup.", "metadata."
        )
        if not final_layer:
            layers = [layer]
        else:
            layers = job.getLayers()
        data = {}
        for layer in layers:
            s = layer.name().split(".")[0] + "."
            if s in ignore:
                continue
            runtime = 0
            frames = layer.getFrames()
            lowest = 9999999999
            highest = 0
            for frame in frames:
                start_time = frame.startTime()
                stop_time = frame.stopTime()
                if not start_time or not stop_time:
                    continue
                cores = float(frame.resource().split("/")[1])
                frame_runtime = (stop_time - start_time) * cores
                if frame_runtime < lowest:
                    lowest = frame_runtime
                if frame_runtime > highest:
                    highest = frame_runtime
                runtime += frame_runtime
            data[layer.name()] = {
                "sum": runtime,
                "avg": runtime / len(frames),
                "lowest": lowest,
                "highest": highest
            }
        return data

    def get_running_time(job):
        start = job.startTime()
        stop = job.stopTime()
        td = stop - start
        return td

    def get_vri(path):
        if not path or not path.startswith("/jobs"):
            return ""
        asset_dir = os.path.dirname(path)
        vri_path = os.path.join(asset_dir, ".vri")
        vri = ""
        if os.path.isfile(vri_path):
            with open(vri_path, "r") as f:
                vri = f.read()
        return vri

    def get_volt_info(job, vri=""):
        layers = job.getLayers()
        paths = []
        for layer in layers:
            paths += layer.getOutputPaths()
        wav = None
        output_path = ""
        for path in paths:
            av = vs.find(os.path.dirname(path))
            if av:
                output_path = path
                break
        else:
            return {}
        wav = av.workareaversion
        data = {}
        data["shot"] = wav.task.parent.name
        data["vs"] = "v" + str(av.version).zfill(3)
        data["output_path"] = output_path
        return data

    def remove_job(doc):
        coll_active.delete_one({"_id": doc.get("_id")})

    coll_active = tools.get_collection("cuenotify_active")
    coll_history = tools.get_collection("cuenotify_history")
    docs = coll_active.find()
    now = datetime.datetime.now()
    now_ts = datetime.datetime.timestamp(now)

    to_send = {}
    for doc in docs:
        data = doc.get("data")
        when = data.get("when")
        final_layer = when == "whole_job"
        job_name = data.get("job_name")
        if not job_name:
            LOGGER.error(f"Issues (no job name) with {job_name}, removing.")
            remove_job(doc)
            continue
        jobs = oc.getJobs(job=[job_name], include_finished=True)
        if jobs:
            job = jobs[0]
            if final_layer:
                if job.state() != 1:
                    LOGGER.info("Ignoring {} cause it's not finished yet.".format(job.name()))
                    continue
                then = job.stopTime()
                mins = abs(now_ts - then) / 60
                if mins > 5:
                    doc["success"] = False
                    inserted_id = coll_history.insert_one(doc).inserted_id
                    remove_job(doc)
                    LOGGER.info("Cached cuenotify history at {}".format(inserted_id))
                    LOGGER.warning("Ignoring {} as it finished long time ago ({} mins)...".format(job.name(), mins))
                    continue

            processed_layers = data.get("processed_layers", [])
            layer, final_layer = get_layer(job, when, processed_layers)
            if not layer:
                if final_layer:
                    LOGGER.error(f"Issues (whole job/no layer) with {job_name}, removing.")
                    remove_job(doc)
                if job.state() == 1:
                    LOGGER.warning(f"Issues (no layer/finished job) with {job_name}, removing.")
                    remove_job(doc)
                LOGGER.info("Ignoring {}, couldn't find a matching finished layer.".format(job.name()))
                continue
            print(f"processed_layers - {processed_layers}")
            print(layer.name(), final_layer)
            layer_name = layer.name()
            if not final_layer:
                coll_active.update_one(
                    {"_id": doc.get("_id")},
                    {"$addToSet": {"data.processed_layers": layer_name}}
                )

            targets = data.get("targets")
            if not targets:
                LOGGER.warning(f"Issues (no targets) with {job_name}, removing.")
                remove_job(doc)
                continue
            entry = f"{job_name}_{layer_name}"
            if entry in to_send.keys():
                existing_targets = to_send[entry]["targets"]
                new_targets = existing_targets
                for target in targets:
                    if target not in existing_targets:
                        new_targets.append(target)
                if existing_targets != new_targets:
                    to_send[entry]["targets"] = new_targets
                LOGGER.info(f"Updated {entry} targets from {existing_targets} to {new_targets}")
                continue

            path = next(iter(layer.getOutputPaths()), None) or data.get("output_path")
            vri = get_vri(path)
            volt_info = data.get("volt_info") or get_volt_info(job, vri)

            job_data = {
                "targets": targets,
                "job": job,
                "job_name": job_name,
                "vri": vri,
                "layer_name": layer_name,
                "path": path,
                "range": layer.range().split("x")[0],
                "dead": layer.deadFrames(),
                "running_time": get_running_time(job),
                "cpu_times": get_cpu_times(job, layer, final_layer),
                "scene_info": data.get("scene_info", {}),
                "volt_info": volt_info,
                "final_layer": final_layer
            }

            to_send[entry] = job_data

            if final_layer:
                doc["success"] = True
                inserted_id = coll_history.insert_one(doc).inserted_id
                remove_job(doc)
                LOGGER.info("Cached cuenotify history at {}".format(inserted_id))
        else:
            LOGGER.warning(f"No jobs found for {job_name}, removing...")
            remove_job(doc)

    if not to_send:
        LOGGER.info("Nothing to send.")

    user_sections = {}
    for name, job_data in to_send.items():
        final_layer = job_data.get("final_layer", False)
        volt_info = job_data.get("volt_info")
        job_name = job_data.get("job").name()
        shot = volt_info.get("shot")
        version = volt_info.get("vs")
        layer = job_data.get("layer_name").split(".")[-1]
        path = job_data.get("path")
        vri = job_data.get("vri")
        range = job_data.get("range")
        render_time = format_time(job_data.get("running_time"))
        cpu_times = job_data.get("cpu_times")

        sections = []
        sections.append(f">*{shot} {layer} {version} has finished.*")
        sections.append(f">_{job_name}_")
        if vri:
            sections.append(f">`{vri}`")
        if path:
            sections.append(f">`{path}`")
        sections.append(">")
        sections.append(f">Range: {range}")
        if final_layer:
            sections.append(f">Start-to-finish: {render_time}")
        sections.append(">")
        sections.append(">CPU Times:")
        for layer, times in cpu_times.items():
            cpu_time = format_time(times.get("sum"))
            avg = format_time(times.get("avg"))
            lowest = format_time(times.get("lowest"))
            highest = format_time(times.get("highest"))
            sections.append(f">{layer} - Sum: {cpu_time} | Avg: {avg} | Lowest: {lowest} | Highest: {highest}")
        sections.append("")

        for target in job_data.get("targets"):
            if target not in user_sections.keys():
                user_sections[target] = []
            user_sections[target] += sections

    for user, sections in user_sections.items():
        LOGGER.info("Sending slack message to {}".format(user))
        text = "\n".join(sections)
        LOGGER.info(text)
        bots.api.send_slack_message(service="cue", text=text, user=user)


def volt_notify():

    title_block = {
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": "Volt Notify"
        }
    }

    divider_block = {
        "type": "divider"
    }

    coll = tools.get_collection("volt_notify")
    docs = coll.find()

    messages = {}
    for doc in docs:
        channel_id = doc.get("channel_id")
        assets = doc.get("blocks")
        # blocks = [title_block]
        blocks = []
        for asset in assets:
            blocks.append(asset)
            blocks.append(divider_block)
        messages[channel_id] = blocks
    coll.delete_many({})

    if not messages:
        LOGGER.info("Volt Notify - Nothing to send.")
        return

    for channel_id, blocks in messages.items():
        if not channel_id:
            continue
        LOGGER.info("Sending slack message with {} assets to {}".format(
            int(len(blocks) * 0.5), channel_id
        ))
        bots.api.send_slack_message(service="volt", text="Volt Notify", blocks=blocks, channel=channel_id)


def db_maintenance():
    db = tools.get_db()
    collections = db.collection_names()
    for coll_name in collections:
        coll = db[coll_name]
        indices = coll.index_information()
        if not indices.get("expires_1"):
            coll.create_index("expires", expireAfterSeconds=5*60)
