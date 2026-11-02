"""Read-only PC example: python examples/http_client_status.py 10.0.5.118.

Install this checkout first, or put the standalone http_client.py next to this file.
Optional HTTP authentication is read from PYRPL_HTTP_TOKEN.
"""
import argparse
import csv
import json
import os

try:
    from pyrpl_websocket.http_client import RedPitayaClient
except ModuleNotFoundError:
    from http_client import RedPitayaClient


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("address", help="Board hostname/IP or http://host:port")
    parser.add_argument("--csv", help="Save latest Scope channels to this CSV file")
    parser.add_argument("--timeout", type=float, default=10.0)
    args = parser.parse_args()
    rp = RedPitayaClient(args.address, token=os.environ.get("PYRPL_HTTP_TOKEN"), timeout=args.timeout)
    print(json.dumps({"health": rp.health(), "lockbox": rp.lock_status(),
                      "scope": rp.module_state("scope")["state"]}, indent=2))
    frame = rp.scope_frame()
    if frame is None:
        print("No cached Scope trace is available. No acquisition was started.")
        return
    print(f"Scope sequence {frame.sequence}: {frame.sample_count} samples, {frame.channel_count} channels")
    if args.csv:
        with open(args.csv, "w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["sample", *(f"ch{index+1}_V" for index in range(frame.channel_count))])
            writer.writerows((index, *values) for index, values in enumerate(zip(*frame.channels)))
        print(f"Saved {args.csv}; the first column is sample index, not time.")


if __name__ == "__main__":
    main()
