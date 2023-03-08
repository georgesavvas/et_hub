
from hub_server import tools


def db_maintenance():
    db = tools.get_db()
    collections = db.collection_names()
    for coll_name in collections:
        coll = db[coll_name]
        indices = coll.index_information()
        if not indices.get("expires_1"):
            coll.create_index("expires", expireAfterSeconds=5 * 60)


def create_capped_collections():
    db = tools.get_db()
    existing_collections = db.list_collection_names()
    for coll in ["store_farm", "store_licenses"]:
        if coll not in existing_collections:
            db.create_collection(
                coll,
                capped=True,
                size=536870912,
                max=100
            )
