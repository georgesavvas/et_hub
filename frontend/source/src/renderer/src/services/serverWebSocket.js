import Sockette from "sockette";

const address = "0ace-212-115-157-45.ngrok-free.app";

export async function serverSocket(endpoint, sessionID, address) {
  const ws = new WebSocket(
    `ws://${address}/api/v1/ws/${endpoint}/${sessionID}`
  );
  return ws;
}

export const longSocket = (endpoint, user, host, sessionID, websocketConfig={}) => {
  const ws = new Sockette(
    `ws://${address}/ws/${endpoint}/${user}/${host}/${sessionID}`,
    websocketConfig,
  );
  return ws;
};
