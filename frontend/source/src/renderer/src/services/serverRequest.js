import fetch from "./fetch";

const address = "0ace-212-115-157-45.ngrok-free.app";
// const address = "ws-vm02:8085";

async function serverRequest(method, data=undefined) {
  // console.log("Server request:", address, method, data);
  return await request(address, method, data);
}

export function formatURL(method) {
  return `http://${address}/${method}`;
}

async function request(address, method, data) {
  const cookie = {user: "host"};
  if (window.services) {
    const user = await window.services.get_env("USER");
    const host = await window.services.get_env("HOSTNAME");
    cookie.user = user;
    cookie.host = host;
  }
  try {
    const resp = await fetch(`http://${address}/api/v1/${method}`, {
      method: !data ? "GET" : "POST",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Cookies": JSON.stringify(cookie)
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
