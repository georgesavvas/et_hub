import re
import os
import glob


def upversion_string(s):
    match = re.match(".*?([0-9]*)$", s)
    number = match.group(1)
    if not number:
        s += "2"
    else:
        len_orig = len(number)
        upped = str(int(number) + 1)
        if len(upped) < len_orig:
            upped = upped.zfill(len_orig)
        s = s.replace(number, upped)

    return s


def latest_from_path(path, pattern="*", name_only=False):
    if not os.path.isdir(path):
        return
    contents = sorted(glob.glob(os.path.join(path, pattern)))
    if contents:
        file = os.path.join(path, contents[-1])
    else:
        return
    if name_only and "/" in file:
        return file.split("/")[-1]
    else:
        return file
