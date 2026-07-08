"""Register helpers for Red Pitaya housekeeping I/O."""

from __future__ import annotations

from .modules import HkSettings
from .monitor_client import DummyClient, MonitorClient


HK_ADDR_BASE = 0x40000000
HK_LED_ADDR = HK_ADDR_BASE + 0x30
HK_P_READ_ADDR = HK_ADDR_BASE + 0x20
HK_P_WRITE_ADDR = HK_ADDR_BASE + 0x18
HK_P_DIRECTION_ADDR = HK_ADDR_BASE + 0x10
HK_N_READ_ADDR = HK_ADDR_BASE + 0x24
HK_N_WRITE_ADDR = HK_ADDR_BASE + 0x1C
HK_N_DIRECTION_ADDR = HK_ADDR_BASE + 0x14


def sync_hk_setting(client: MonitorClient | DummyClient, settings: HkSettings, attribute: str) -> None:
    if attribute == "led":
        _write_word(client, HK_LED_ADDR, settings.led)
        return
    parsed = _parse_expansion_attribute(attribute)
    if parsed is None:
        return
    sign, index, is_direction = parsed
    if is_direction:
        _write_expansion_direction(client, sign, index, bool(getattr(settings, attribute)))
    else:
        _write_expansion_value(client, sign, index, bool(getattr(settings, attribute)))


def sync_hk_settings(client: MonitorClient | DummyClient, settings: HkSettings) -> None:
    for attribute in settings.as_dict():
        sync_hk_setting(client, settings, attribute)


def read_hk_expansion(client: MonitorClient | DummyClient, settings: HkSettings) -> HkSettings:
    """Refresh expansion input values from the read registers."""

    for sign, read_addr in (("P", HK_P_READ_ADDR), ("N", HK_N_READ_ADDR)):
        word = int(client.reads(read_addr, 1)[0])
        for index in range(8):
            setattr(settings, f"expansion_{sign}{index}", bool((word >> index) & 1))
    return settings


def _parse_expansion_attribute(attribute: str) -> tuple[str, int, bool] | None:
    if not attribute.startswith("expansion_"):
        return None
    body = attribute.removeprefix("expansion_")
    is_direction = body.endswith("_output")
    if is_direction:
        body = body.removesuffix("_output")
    if len(body) != 2 or body[0] not in {"P", "N"} or not body[1].isdigit():
        return None
    index = int(body[1])
    if not 0 <= index <= 7:
        return None
    return body[0], index, is_direction


def _write_expansion_direction(client: MonitorClient | DummyClient, sign: str, index: int, output: bool) -> None:
    direction_addr = HK_P_DIRECTION_ADDR if sign == "P" else HK_N_DIRECTION_ADDR
    current = int(client.reads(direction_addr, 1)[0])
    if output:
        current |= 1 << index
    else:
        current &= ~(1 << index)
    _write_word(client, direction_addr, current)


def _write_expansion_value(client: MonitorClient | DummyClient, sign: str, index: int, value: bool) -> None:
    write_addr = HK_P_WRITE_ADDR if sign == "P" else HK_N_WRITE_ADDR
    current = int(client.reads(write_addr, 1)[0])
    if value:
        current |= 1 << index
    else:
        current &= ~(1 << index)
    _write_word(client, write_addr, current)


def _write_word(client: MonitorClient | DummyClient, addr: int, value: int) -> None:
    client.writes(addr, [int(value) & 0xFFFFFFFF])
