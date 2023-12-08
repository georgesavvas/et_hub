import os
import datetime

from hub_server import tools
from hub_server import volt
from .. import slack


LOGGER = tools.get_logger(__name__)


def cue_notify():

    def format_time(sec):
        sec = int(sec)
        hours = sec // 3600
        mins = (sec % 3600) // 60
        secs = (sec % 3600) % 60

        if hours:
            final = f"{hours}h {mins}m {secs}s"
        elif mins:
            final = f"{mins}m {secs}s"
        else:
            final = f"{secs}s"
        return final

    def get_layer(job, when, processed_layers):
        layers = [
            l for l in job["layers"]
            if not l["name"].startswith("cuenotify.")
        ]
        final_layer = layers[-1]
        if when == "whole_job":
            pref = ("img.", "nk.", "jpg.", "geo.", "ale.", "ass.")
            for p in pref:
                for layer in layers:
                    if layer["name"].startswith(p):
                        return layer, True
            return layers[0], True
        else:
            for layer in layers:
                if layer["runningFrames"] or layer["pendingFrames"]:
                    continue
                if layer["name"] in processed_layers:
                    continue
                if when == "each_layer":
                    return layer, layer == final_layer
                elif layer["name"].startswith("{}.".format(when)):
                    return layer, True
        return None, False

    def get_cpu_times(job, layer, final_layer):
        ignore = (
            "jpg.", "postprocess.", "mp4.", "cuenotify.", "register.",
            "publish.", "cleanup.", "metadata."
        )
        if not final_layer:
            layers = [layer]
        else:
            layers = job["layers"]
        data = {}
        for layer in layers:
            s = layer["name"].split(".")[0] + "."
            if s in ignore:
                continue
            runtime = 0
            frames = layer["frames"]
            lowest = 9999999999
            highest = 0
            for frame in frames:
                start_time = frame["startTime"]
                stop_time = frame["stopTime"]
                if not start_time or not stop_time:
                    continue
                cores = float(frame["resource"].split("/")[1])
                frame_runtime = (stop_time - start_time) * cores
                if frame_runtime < lowest:
                    lowest = frame_runtime
                if frame_runtime > highest:
                    highest = frame_runtime
                runtime += frame_runtime
            data[layer["name"]] = {
                "sum": runtime,
                "avg": runtime / len(frames),
                "lowest": lowest,
                "highest": highest
            }
        return data

    def get_running_time(job):
        start = job["startTime"]
        stop = job["stopTime"]
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
        layers = job["layers"]
        paths = []
        for layer in layers:
            paths += layer["outputPaths"]
        wav = None
        output_path = ""
        for path in paths:
            av = volt.volt_shell("find", {"uri_or_vri_or_path": os.path.dirname(path)}).get("data")
            if av:
                output_path = path
                break
        else:
            return {}
        wav = av["workareaversion"]
        data = {}
        data["shot"] = wav["shot"]["name"]
        data["vs"] = "v" + str(av["version"]).zfill(3)
        data["output_path"] = output_path
        return data

    def remove_job(doc):
        coll_active.delete_one({"_id": doc.get("_id")})

    coll_active = tools.get_collection("cuenotify_active")
    coll_history = tools.get_collection("cuenotify_history")
    docs = coll_active.find()
    now = datetime.datetime.now()
    now_ts = datetime.datetime.timestamp(now)

    farm_coll = tools.get_collection("store_farm")
    farm_data = farm_coll.find_one(sort=[("_id", -1)])["data"]
    running_jobs = [j["name"] for j in farm_data["jobs"]]
    renders_coll = tools.get_collection("store_renders")
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
        if job_name in running_jobs:
            LOGGER.info(
                f"Ignoring {job_name} cause it's not finished yet."
            )
            continue
        job = renders_coll.find_one({"name": job_name})
        if not job:
            LOGGER.error(f"Couldn't find {job_name} in database, ignoring...")
            # doc["success"] = False
            # inserted_id = coll_history.insert_one(doc).inserted_id
            # remove_job(doc)
            # LOGGER.info(f"Cached cuenotify history at {inserted_id}")
            continue
        if final_layer:
            then = job["stopTime"]
            mins = abs(now_ts - then) / 60
            if mins > 5:
                LOGGER.warning(
                    f"Ignoring {job['name']} as it finished long time ago ({mins} mins) "
                )
                doc["success"] = False
                inserted_id = coll_history.insert_one(doc).inserted_id
                remove_job(doc)
                LOGGER.info(f"Cached cuenotify history at {inserted_id}")
                continue

        processed_layers = data.get("processed_layers", [])
        layer, final_layer = get_layer(job, when, processed_layers)
        if not layer:
            if final_layer:
                LOGGER.error(
                    f"Issues (whole job/no layer) with {job_name}, "
                    "removing."
                )
                remove_job(doc)
            if job["state"] == 1:
                LOGGER.warning(
                    f"Issues (no layer/finished job) with {job_name}, "
                    "removing."
                )
                remove_job(doc)
            LOGGER.info(
                f"Ignoring {job['name']}, couldn't find a matching finished "
                "layer."
            )
            continue
        # print(f"processed_layers - {processed_layers}")
        # print(layer["name"], final_layer)
        layer_name = layer["name"]
        if not final_layer:
            coll_active.update_one(
                {"_id": doc.get("_id")},
                {"$addToSet": {"data.processed_layers": layer_name}}
            )

        targets = data.get("targets")
        if not targets:
            LOGGER.warning(
                f"Issues (no targets) with {job_name}, removing."
            )
            doc["success"] = False
            inserted_id = coll_history.insert_one(doc).inserted_id
            remove_job(doc)
            LOGGER.info(
                f"Cached cuenotify history at {inserted_id}"
            )
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
            LOGGER.info(
                f"Updated {entry} targets from {existing_targets} to "
                f"{new_targets}"
            )
            doc["success"] = True
            inserted_id = coll_history.insert_one(doc).inserted_id
            remove_job(doc)
            LOGGER.info(
                f"Cached cuenotify history at {inserted_id}"
            )
            continue

        path = (
            next(iter(layer["outputPaths"]), None) or
            data.get("output_path")
        )
        vri = get_vri(path)
        volt_info = data.get("volt_info") or get_volt_info(job, vri)

        job_data = {
            "targets": targets,
            "job": job,
            "job_name": job_name,
            "vri": vri,
            "layer_name": layer_name,
            "path": path,
            "range": layer["range"].split("x")[0],
            "dead": layer["deadFrames"],
            "running_time": get_running_time(job),
            "cpu_times": job["cpuTimes"],
            "scene_info": data.get("scene_info", {}),
            "volt_info": volt_info,
            "final_layer": final_layer
        }

        to_send[entry] = job_data

        if final_layer:
            doc["success"] = True
            inserted_id = coll_history.insert_one(doc).inserted_id
            remove_job(doc)
            LOGGER.info(
                f"Cached cuenotify history at {inserted_id}"
            )

    if not to_send:
        LOGGER.info("Nothing to send.")

    user_sections = {}
    for job_data in to_send.values():
        final_layer = job_data.get("final_layer", False)
        volt_info = job_data.get("volt_info")
        job_name = job_data.get("job")["name"]
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
            sections.append(
                f">{layer} - Sum: {cpu_time} | Avg: {avg} | "
                f"Lowest: {lowest} | Highest: {highest}"
            )
        sections.append("")

        for target in job_data.get("targets"):
            if target not in user_sections.keys():
                user_sections[target] = []
            user_sections[target] += sections

    for user, sections in user_sections.items():
        LOGGER.info(f"Sending slack message to {user}")
        text = "\n".join(sections)
        LOGGER.info(text)
        slack.send_message(service="cue", text=text, user=user)
