import opencue.api as oc
import volt_shell as vs
from datetime import datetime
from datetime import timezone
from pprint import pprint
import os
import stat
import cv2
import clique
import imutils
import shutil
import random
import math
import multiprocessing
import subprocess
from pathlib import PurePath, Path
from concurrent.futures import ThreadPoolExecutor
from hub_server.filesystem import (
    upversion_string,
    latest_from_path
)
from hub_server import tools

LOGGER = tools.get_logger(__name__)

EXTS = ("jpg", "jpeg", "png", "tif", "tiff")

TASK_ORDER = ["matchmove", "layout", "animate", "fx", "light", "comp"]

def copy_file(src, dest):
    shutil.copy2(src, dest)
    os.chmod(dest, stat.S_IRWXU)
    os.system(f"mogrify -resize 1280x720 {dest}")

def get_frame(path):
    path_split = list(reversed(path.split(".")))
    for section in path_split:
        if section.isnumeric():
            frame = int(section)
            return frame

def get_active_projects():
    jobs = oc.getJobs(include_finished=True)
    unique_shows = list(set([j.show() for j in jobs]))
    # unique_shows = ("skrillex_butterflies_promo_e004436",)
    unique_shows = [show for show in unique_shows if show]
    return unique_shows

def get_project_renders(project_name):
    project = vs.get_project_by_name(project_name)
    if not project:
        LOGGER.warning("Couldn't find {} on volt, ignoring.".format(project_name))
        return {}

    layer_assets = vs.find_assets(kind_name="layer", project_or_uri=project)
    renders = []
    uris = []
    for la in layer_assets:
        av = la.latest_published
        if not av:
            continue

        task = la.task
        shot = task.parent
        sequence = shot.parent
        dt = av.created_date.astimezone(timezone.utc)
        today = datetime.today().astimezone(timezone.utc)
        days_old = (today - dt).days
        if days_old > 7:
            continue
        
        uri = la.task.uri
        uri_short = uri.split("/{}/".format(project_name))[1].replace("sequence/", "")
        # r = parse("{sequence}/{shot}/{task}", uri_short)
        
        renders.append(av)
        # render_info.append(r.named)
        uris.append(uri_short)

    struct = {}
    for render, uri in zip(renders, uris):
        parts = uri.split('/')
        branch = struct
        for part in parts[:-1]:
            branch = branch.setdefault(part, {})
        branch[parts[-1]] = [render] + branch.get(parts[-1], [])
    # pprint(struct)
    return struct

def filter_renders(renders):
    interesting = {}
    uris_comps = {}
    primary = ["layout", "animate", "comp", "fx", "light"]
    only_primary = False
    original = 0
    rejected = 0
    final = 0
    for sequence, shots in renders.items():
        for shot, tasks in shots.items():
            for t in primary:
                if t in tasks:
                    only_primary = True
                    break
            
            for task, renders in tasks.items():
                if only_primary and task not in primary:
                    continue
                _renders = list(renders)
                original += len(_renders)
                illegal = (
                    "shadow", "denoise", "matte", "cleanup", "bg_prep",
                    "prerender", "setcontact", "techgrade", "crypto"
                )
                for render in renders[:]:
                    comp = get_component(render)
                    if not comp:
                        _renders.remove(render)
                        rejected += 1
                        continue
                    for i in illegal:
                        if i in render.name.lower():
                            _renders.remove(render)
                            rejected += 1
                            break
                    else:
                        uris_comps[render.uri] = comp
                        final += 1
                if not _renders:
                    continue
                if not interesting.get(sequence):
                    interesting[sequence] = {}
                if not interesting[sequence].get(shot):
                    interesting[sequence][shot] = {}
                interesting[sequence][shot][task] = _renders
    LOGGER.info(f"Total renders: {original} | Eligible: {final} | Rejected: {rejected}")
    return interesting, uris_comps

def analyse_sequence(sequence, min_frames=0, max_frames=0):
    # LOGGER.info("Analysing " + str(sequence))
    have_movement = {}
    previous_f = []
    indices = sequence.indexes
    good_streak = 0
    bad_streak = 0
    reset = 0
    first_frame = None
    first_index = None
    for frame, index in zip(sequence, indices):
        if max_frames and len(have_movement) == max_frames:
            return have_movement
        f = cv2.imread(frame)
        fp = imutils.resize(f, width=360)
        fp = cv2.cvtColor(fp, cv2.COLOR_BGR2GRAY)
        fp = cv2.GaussianBlur(fp, (5, 5), 0)
        if not len(previous_f):
            previous_f = fp
            first_frame = frame
            first_index = index
            continue
        frameDelta = cv2.absdiff(previous_f, fp)
        thresh = cv2.threshold(frameDelta, 5, 255, cv2.THRESH_BINARY)[1]
        if cv2.countNonZero(thresh):
            if first_frame:
                have_movement[str(first_index)] = first_frame
                first_frame = None
            have_movement[str(index)] = frame
            good_streak += 1
            bad_streak = 0
        elif bad_streak == 10:
            have_movement = {}
            good_streak = 0
            reset += 1
        else:
            bad_streak += 1
            good_streak = 0
        first_frame = None
        previous_f = fp
    # LOGGER.info("Done. Total frames: {}. Moving frames: {}. Good streak: {}. Bad streak: {}. Streak reset {} times.".format(
    #     len(indices),
    #     len(have_movement),
    #     good_streak,
    #     bad_streak,
    #     reset
    # ))
    return have_movement

def encode_mp4(input_path, output_path):
    cmd = f"ffmpeg -start_number 1001 -pattern_type glob -i {input_path} -c:v libx264 -r 25 -vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:color=black {output_path}"
    # os.system(cmd)
    subprocess.check_call(
        cmd.split(),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

def is_comp_valid(comp):
    path = comp.path
    if not comp.is_sequence:
        return
    if not "[" in path:
        return
    if not "-" in path.split("[")[1]:
        return
    _range = path.split("[")[1].split(",")[0].split("]")[0]
    if _range.startswith("1-"):
        return
    return True

def get_component(av):
    comp = av.get_component("view")
    if not comp or not is_comp_valid(comp):
        comps = av.components
        for c in comps:
            if not is_comp_valid(c):
                continue
            name = c.name
            path = c.path
            if path.split(" ")[0].split(".")[-1] in EXTS:
                # LOGGER.warning(f"{av.vri} has no view comp, but found {name}")
                comp = c
                break
        else:
            # LOGGER.warning(f"Couldn't find suitable component for {av.vri}")
            # for c in comps:
            #     r = c.path.split(" ")[1] if " " in c.path else "static"
            #     LOGGER.warning(f"{c.name} {r}")
            return
    return comp.path

def get_component_range(name, comp, shot_meta, task_amount, task_index, av_amount, av_index, max_frames):
    _range = comp.split("[")[1].split(",")[0].split("]")[0]
    _range = _range.split("-")
    head_in = shot_meta.get("head_in")
    tail_out = shot_meta.get("tail_out")
    cut_in = shot_meta.get("cut_in")
    cut_out = shot_meta.get("cut_out")
    start = int(cut_in or head_in)
    end = int(cut_out or tail_out)
    shot_length = end - start + 1
    if shot_length > max_frames:
        shot_length = max_frames
    task_budget = int(shot_length / task_amount)
    av_budget = int(task_budget / av_amount)
    ideal_start = int(start + task_budget * task_index + av_budget * av_index)
    ideal_end = int(ideal_start + av_budget)
    LOGGER.info(" " * 15 + f"{name} {_range[0]}-{_range[1]} -> {ideal_start}-{ideal_end}")
    return [ideal_start, ideal_end]

def get_shot_range_from_avs(tasks_ordered, tasks, uris_comps):
    avs = tasks[tasks_ordered[-1]]
    longest = 0
    longest_range = None
    for av in avs:
        uri = av.uri
        comp = uris_comps[uri]
        _range = comp.split("[")[1].split(",")[0].split("]")[0]
        _range = _range.split("-")
        duration = int(_range[1]) - int(_range[0])
        if not longest_range or longest < duration:
            longest = duration
            longest_range = _range
    return [int(i) for i in longest_range]

def uris_durations_from_filtered(renders, uris_comps):
    sandbox_uris = []
    build_uris = []
    shot_uris = []
    uri_order = []
    uris_ranges = {}
    for sequence, shots in sorted(renders.items()):
        LOGGER.info(sequence)
        for shot, tasks in sorted(shots.items()):
            tasks_ordered = [t for t in TASK_ORDER if t in tasks]
            for t in tasks:
                if t not in tasks_ordered:
                    tasks_ordered.insert(0, t)
            # print(f"Tasks for {sequence}/{shot}")
            # print("Unordered", list(tasks.keys()))
            # print("Ordered", tasks_ordered)
            primary_comp = None
            max_frames = 100
            if sequence in ("sandbox", "build"):
                max_frames = 50
            av = list(tasks.values())[0][0]
            shot_meta = av.workareaversion.parent.parent.parent.metadata
            head_in = shot_meta.get("head_in")
            tail_out = shot_meta.get("tail_out")
            cut_in = shot_meta.get("cut_in")
            cut_out = shot_meta.get("cut_out")
            start = int(cut_in or head_in or 0)
            end = int(cut_out or tail_out or 0)
            if not start or not end:
                start, end = get_shot_range_from_avs(tasks_ordered, tasks, uris_comps)
                shot_meta["head_in"] = start
                shot_meta["tail_out"] = end
            shot_length = end - start + 1
            task_amount = len(tasks)
            task_budget = shot_length / task_amount
            LOGGER.info(" " * 5 + f"{shot} {shot_length} / {task_amount} ({start}-{end})")
            final_av_index = 0
            for task_index, task in enumerate(tasks_ordered):
                avs = tasks[task]
                av_amount = len(avs)
                max_avs = int(math.ceil(task_budget / 10))
                remove = av_amount - max_avs
                final_amount = min(av_amount, max_avs)
                to_remove = [random.randrange(remove) for i in range(remove)]
                LOGGER.info(" " * 10 + f"{task} / {final_amount} (originally {av_amount})")
                for av_index, av in enumerate(avs):
                    if av_index in to_remove:
                        LOGGER.info(" " * 15 + f"{av.name} (randomly removed)")
                    uri = av.uri
                    comp = uris_comps[uri]
                    if not comp:
                        continue
                    _range = get_component_range(
                        av.name,
                        comp,
                        shot_meta,
                        task_amount,
                        task_index,
                        final_amount,
                        final_av_index,
                        max_frames
                    )
                    uris_ranges[uri] = _range
                    if sequence == "sandbox":
                        sandbox_uris.append(uri)
                    elif sequence == "build":
                        build_uris.append(uri)
                    else:
                        shot_uris.append(uri)
                    final_av_index += 1
    uri_order = sandbox_uris + build_uris + shot_uris
    return uris_ranges, uri_order

def make_project_reel(work_dir, project):
    LOGGER.info("")
    LOGGER.info("Creating reel for {}".format(project))
    version = "v001"
    output_dir = work_dir / project
    if not os.path.isdir(output_dir):
        os.makedirs(output_dir)
    latest = latest_from_path(output_dir, name_only=True)
    if latest:
        version = upversion_string(latest)
    output_dir /= version
    os.makedirs(output_dir)

    renders = get_project_renders(project)

    filtered, uris_comps = filter_renders(renders)
    if not filtered:
        LOGGER.warning(f"Nothing found for {project}")
        return
    uris_ranges, uri_order = uris_durations_from_filtered(filtered, uris_comps)
    frame_sequences = []
    to_analyse = {}
    seqs = {}
    ANALYSED_RENDERS = tools.get_collection("analysed_renders")
    for uri, comp in uris_comps.items():
        existing = ANALYSED_RENDERS.find_one({"uri": uri})
        if existing:
            # LOGGER.info("{} already analysed, fetching from DB.".format(uri))
            seqs[uri] = existing["frames"]
        else:
            to_analyse[uri] = clique.parse(comp)

    if to_analyse:
        uris_to_analyse = to_analyse.keys()
        seqs_to_analyse = to_analyse.values()
        with multiprocessing.Pool(8) as pool:
            processed = pool.map(analyse_sequence, seqs_to_analyse)
        for uri, seq in zip(uris_to_analyse, processed):
            m_id = ANALYSED_RENDERS.insert_one({
                "uri": uri,
                "frames": seq
            }).inserted_id
            # LOGGER.info("Cached {} at {}".format(uri, m_id))
            seqs[uri] = seq

    # for seq in seqs:
    #     if len(seq) >= 15:
    #         frame_sequences.append(seq)
    # max_frames = round(750 / len(filtered))
    # all_frames = []
    # previous_last_frame = 0
    # for sequence in frame_sequences:
    #     seq_len = len(sequence)
    #     if max_frames >= seq_len:
    #         all_frames += sequence
    #         previous_last_frame = get_frame(sequence[-1])
    #     else:
    #         start = get_frame(sequence[0])
    #         end = get_frame(sequence[-1])
    #         if start > previous_last_frame:
    #             all_frames += sequence[:max_frames]
    #             previous_last_frame = previous_last_frame = end
    #         elif end - previous_last_frame >= max_frames:
    #             i = previous_last_frame-start
    #             all_frames += sequence[i:i+max_frames]
    #             previous_last_frame = end
    #         else:
    #             all_frames += sequence[:max_frames]
    #             previous_last_frame = 0

    all_frames = []
    all_duration = 0
    actual_duration = 0
    for uri in uri_order:
        if uri not in seqs:
            LOGGER.warning(f"{uri} was not found in analysed.")
            continue
        frames = seqs[uri]
        indices = sorted(list(frames.keys()))
        if not indices:
            LOGGER.warning(f"{uri} has weird analysed results.")
            continue
        first_index = indices[0]
        last_index = indices[-1]
        _range = uris_ranges[uri]
        start = str(_range[0])
        end = str(_range[1])
        ideal_duration = _range[1] - _range[0]
        if ideal_duration < 3:
            LOGGER.warning(f"{uri} is too short ({ideal_duration} frames), skipping")
            continue
        all_duration += ideal_duration
        needs_fixing = False
        dodgy_start = False
        if start in frames and end in frames:
            real_start = start
            real_end = end
        else:
            if start in frames:
                real_start = start
            elif str(_range[0] + 1) in frames:
                real_start = str(_range[0] + 1)
            else:
                needs_fixing = True
                dodgy_start = True
                real_start = first_index
            if end in frames:
                real_end = end
            else:
                needs_fixing = True
                real_end = last_index
                possible_start = str(int(real_end) - ideal_duration)
                if dodgy_start and possible_start in frames:
                    real_start = possible_start
        new_duration = int(real_end) - int(real_start)
        offset = abs(_range[0] - int(real_start))
        duration_diff = abs(new_duration - ideal_duration)
        # print(uri, ideal_duration)
        if duration_diff < 15 and offset < 1500:
            needs_fixing = False
        if needs_fixing:
            LOGGER.warning(f"{start}-{end} ({ideal_duration})   ({offset})->   {real_start}-{real_end} ({new_duration})     {uri}")
            continue
        to_append = []
        for i in range(int(real_start), int(real_end) + 1):
            if not str(i) in frames:
                previous_frame = i - 1
                next_frame = i + 1
                if previous_frame >= int(real_start) - 1 and str(previous_frame) in frames:
                    to_append.append(frames[str(previous_frame)])
                    continue
                if next_frame <= int(real_end) + 1 and str(next_frame) in frames:
                    to_append.append(frames[str(next_frame)])
                    continue
                LOGGER.error(f"{i} didn't make it through... ({project})")
                # LOGGER.error(indices)
                continue
            to_append.append(frames[str(i)])
        else:
            actual_duration += new_duration
            all_frames += to_append

    if not all_frames:
        LOGGER.warning("Not much to work with on {}, ignoring.".format(project))
        return

    export_pairs = {
        frame: output_dir / f"reel.{1001 + i}.jpg"
        for i, frame in enumerate(all_frames)
    }
    LOGGER.info(f"Copying {len(all_frames)} frames...")
    with ThreadPoolExecutor(16) as executor:
        _ = [executor.submit(copy_file, src, dest) for src, dest in export_pairs.items()]

    output_mp4 = output_dir / f"{project}.mp4"
    LOGGER.info("Encoding...")
    encode_mp4((output_dir / "reel.*.jpg").as_posix(), output_mp4)
    LOGGER.info(f"Exported to {output_dir}")
    return output_mp4

def make_reels():
    root_dir = Path("/transfer/hub/reels")
    date_dir = root_dir / datetime.now().strftime("%d_%m_%Y")
    work_dir = date_dir / "work"

    projects = get_active_projects()
    for project in projects:
        # if "nda" in project.lower():
        #     LOGGER.warning("Working on NDA project {}".format(project))
            # LOGGER.warning("Ignoring NDA project {}".format(project))
            # continue
        output_path = make_project_reel(work_dir, project)
        if output_path and output_path.is_file():
            clone = date_dir / f"{project}.mp4"
            shutil.copy2(output_path, clone)
    
    LOGGER.info("All done.")
    latest_dir = Path(root_dir / "latest")
    if not latest_dir.exists() or latest_dir.resolve() != date_dir:
        if latest_dir.exists():
            latest_dir.unlink()
        latest_dir.symlink_to(date_dir, target_is_directory=True)
    for file in latest_dir.iterdir():
        LOGGER.info(file)
