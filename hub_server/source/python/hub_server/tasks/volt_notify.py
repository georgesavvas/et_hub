from hub_server import tools
import bots.api


LOGGER = tools.get_logger(__name__)


def volt_notify():
    divider_block = {
        "type": "divider"
    }

    coll = tools.get_collection("volt_notify")
    docs = coll.find()

    messages = {}
    for doc in docs:
        channel_id = doc.get("channel_id")
        assets = doc.get("blocks")
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
        LOGGER.info(
            f"Sending slack message with {int(len(blocks) * 0.5)} assets to "
            f"{channel_id}"
        )
        bots.api.send_slack_message(
            service="volt",
            text="Volt Notify",
            blocks=blocks,
            channel=channel_id
        )
