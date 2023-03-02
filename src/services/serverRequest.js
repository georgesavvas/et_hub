import fetch from "./fetch";

const address = "192.168.11.20:8085";

async function serverRequest(method, data=undefined) {
  // console.log("Server request:", address, method, data);
  return await request(address, method, data);
}

async function request(address, method, data, attempt=0) {
  try {
    const resp = await fetch(`http://${address}/${method}`, {
      method: !data ? "GET" : "POST",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const resp2 = await resp.json();
    // console.log(`Server response (${attempt}):`, method, resp2);
    return resp2;
  } catch (error) {
    if (error === "timeout") {
      return {ok: false, msg: "Could not connect to ET Hub server..."};
    }
    return {ok: false, msg: "Something went wrong..."};
  }
}

export default serverRequest;
