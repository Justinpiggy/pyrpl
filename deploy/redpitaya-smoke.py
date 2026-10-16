"""Read-only HTTP, static-asset, WebSocket, and FPGA connectivity smoke test."""

import json
import re
import socket
import sys
import urllib.request

from wsproto import ConnectionType, WSConnection
from wsproto.events import AcceptConnection, CloseConnection, Request, TextMessage


def websocket_json(port, path, message=None):
    protocol = WSConnection(ConnectionType.CLIENT)
    with socket.create_connection(("127.0.0.1", port), timeout=15) as connection:
        connection.sendall(protocol.send(Request(host=f"127.0.0.1:{port}", target=path)))
        parts = []
        while True:
            data = connection.recv(65536)
            if not data:
                raise RuntimeError(f"WebSocket closed before its response: {path}")
            protocol.receive_data(data)
            for event in protocol.events():
                if isinstance(event, AcceptConnection) and message is not None:
                    connection.sendall(protocol.send(TextMessage(data=json.dumps(message))))
                elif isinstance(event, TextMessage):
                    parts.append(event.data)
                    if event.message_finished:
                        connection.sendall(protocol.send(CloseConnection(code=1000)))
                        return json.loads("".join(parts))
                elif isinstance(event, CloseConnection):
                    raise RuntimeError(f"WebSocket rejected: {event}")


def main():
    port = int(sys.argv[1])
    base = f"http://127.0.0.1:{port}"

    def get(path):
        with urllib.request.urlopen(base + path, timeout=15) as response:
            return response.read()

    assert json.loads(get("/api/health"))["ok"]
    session = json.loads(get("/api/session"))
    assert session["fake"] is False
    assert session["settings"]["hostname"] == "127.0.0.1"
    html = get("/").decode()
    scripts = re.findall(r'src="(/assets/[^\"]+\.js)"', html)
    assert scripts, "Built frontend is missing"
    for script in scripts:
        assert get(script), "Empty frontend bundle"
    assert websocket_json(port, "/ws/events")["type"] == "events.ready"
    registers = websocket_json(port, "/ws/control", {
        "id": "deployment-smoke", "type": "register.read", "addr": 0x40100014, "length": 1,
    })
    assert registers["ok"] and len(registers["values"]) == 1, registers
    print("PASS: board HTTP, built frontend, event/control WebSockets, and real FPGA register read")


if __name__ == "__main__":
    main()
