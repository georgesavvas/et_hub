import pymongo
from hub_server import tools
from pathlib import Path

LOGGER = tools.get_logger(__name__)


def project_reels():

    def format_name(name):
        split = name.split("_")
        return " ".join(split[:-1])

    path = Path("/transfer/hub/reels/latest")
    data = sorted([f.as_posix() for f in path.glob("*.mp4")])

    return data
