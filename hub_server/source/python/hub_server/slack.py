import os
import requests


ENV = os.environ
VOLT_API_URL = ENV.get("VOLT_API_URL")
API_VERSION = "v1"


def request(method, data):
    url = f"http://slackbot.london.etc:8081/api/{method}"
    if not data:
        resp = requests.get(url)
    else:
        headers = {"Content-Type": "application/json"}
        resp = requests.post(url, headers=headers, json=data)
    return resp


def send_message(**kwargs):
    return request("send_slack_message", kwargs)
