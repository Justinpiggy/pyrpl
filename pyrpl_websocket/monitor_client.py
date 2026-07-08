"""Monitor-server client compatible with PyRPL's Red Pitaya protocol.

This module intentionally copies only the transport protocol needed by the web
prototype. It does not import Qt or the legacy PyRPL GUI layer, so it can run on
the Red Pitaya ARM CPU with a small dependency footprint.
"""

from __future__ import annotations

import logging
import socket
from dataclasses import dataclass
from typing import Callable, Iterable

def _np():
    import numpy as np

    return np


LOGGER = logging.getLogger(__name__)
MAX_WORDS = 65535
ASG_ADDR_BASE = 0x40200000
ASG_DATA_LENGTH = 2**14


def make_header(command: bytes, addr: int = 0, length: int = 0) -> bytes:
    """Return the 8-byte monitor-server command header."""

    if len(command) != 1:
        raise ValueError("command must be exactly one byte")
    if length < 0:
        raise ValueError("length must be non-negative")
    return command + bytes(
        bytearray(
            [
                0,
                length & 0xFF,
                (length >> 8) & 0xFF,
                addr & 0xFF,
                (addr >> 8) & 0xFF,
                (addr >> 16) & 0xFF,
                (addr >> 24) & 0xFF,
            ]
        )
    )


@dataclass
class MonitorStats:
    reads: int = 0
    writes: int = 0


class MonitorClient:
    """TCP client for the C monitor_server running on Red Pitaya."""

    def __init__(
        self,
        hostname: str,
        port: int = 2222,
        restart_server: Callable[[], int] | None = None,
        timeout: float = 1.0,
    ):
        self.hostname = hostname
        self.port = port
        self.restart_server = restart_server
        self.timeout = timeout
        self.stats = MonitorStats()
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._connect()

    def _connect(self) -> None:
        for attempt in range(5):
            try:
                self.socket.connect((self.hostname, self.port))
            except socket.error:
                LOGGER.warning("Socket error during connection attempt %s.", attempt)
                if self.restart_server is None:
                    raise
                self.port = self.restart_server()
            else:
                self.socket.settimeout(self.timeout)
                return
        raise ConnectionError("Unable to connect to monitor_server")

    def close(self) -> None:
        try:
            self.socket.send(make_header(b"c"))
        except socket.error:
            pass
        finally:
            self.socket.close()

    def reads(self, addr: int, length: int):
        self.stats.reads += 1
        return self._try_n_times(self._reads, addr, length)

    def writes(self, addr: int, values: Iterable[int]) -> bool:
        self.stats.writes += 1
        return self._try_n_times(self._writes, addr, list(values))

    def _reads(self, addr: int, length: int):
        if length > MAX_WORDS:
            length = MAX_WORDS
            LOGGER.warning("Maximum read length is %d", length)
        header = make_header(b"r", addr=addr, length=length)
        self.socket.send(header)
        data = self._recv_exact(length * 4 + 8)
        if data[:8] != header:
            self.emptybuffer()
            raise RuntimeError("Wrong control sequence from server")
        np = _np()
        return np.frombuffer(data[8:], dtype=np.uint32)

    def _writes(self, addr: int, values: list[int]) -> bool:
        values = values[: MAX_WORDS - 2]
        header = make_header(b"w", addr=addr, length=len(values))
        np = _np()
        payload = np.array(values, dtype=np.uint32).tobytes()
        self.socket.send(header + payload)
        if self._recv_exact(8) != header:
            self.emptybuffer()
            raise RuntimeError("Wrong write acknowledgement from server")
        return True

    def _recv_exact(self, size: int) -> bytes:
        chunks = []
        remaining = size
        while remaining:
            chunk = self.socket.recv(remaining)
            if not chunk:
                raise ConnectionError("Socket closed while receiving data")
            chunks.append(chunk)
            remaining -= len(chunk)
        return b"".join(chunks)

    def emptybuffer(self) -> None:
        for _ in range(100):
            data = self.socket.recv(16384)
            if not data:
                return

    def _try_n_times(self, function, addr, value, n: int = 5):
        last_error = None
        for attempt in range(n):
            try:
                return function(addr, value)
            except (socket.timeout, socket.error, ConnectionError, RuntimeError) as exc:
                last_error = exc
                LOGGER.error(
                    "Monitor operation failed on attempt %s at addr %s via %s",
                    attempt,
                    hex(addr),
                    function.__name__,
                )
                if self.restart_server is not None:
                    self.restart()
        raise RuntimeError("Monitor operation failed after retries") from last_error

    def restart(self) -> None:
        self.close()
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        if self.restart_server is not None:
            self.port = self.restart_server()
        self._connect()


class DummyClient:
    """Small fake monitor client for local web UI development."""

    def __init__(self):
        self.stats = MonitorStats()
        self.fpgamemory: dict[int, int] = {
            0x40100014: 1,
            0x40380000: 10,
            0x40390000: 11,
        }
        self.phase = 0

    def reads(self, addr: int, length: int):
        self.stats.reads += 1
        np = _np()
        return np.array([self._read_word(addr + 4 * i) for i in range(length)], dtype=np.uint32)

    def writes(self, addr: int, values: Iterable[int]) -> bool:
        self.stats.writes += 1
        for index, value in enumerate(values):
            self.fpgamemory[addr + 4 * index] = int(value)
        return True

    def close(self) -> None:
        return None

    def advance_scope_phase(self, sample_count: int) -> None:
        """Advance the fake waveform once a complete scope frame has been read."""

        self.phase = (self.phase + max(1, int(sample_count) // 128)) % 65536

    def _read_word(self, addr: int) -> int:
        if 0x40110000 <= addr < 0x40120000:
            return self._scope_sample(addr, channel=0)
        if 0x40120000 <= addr < 0x40130000:
            return self._scope_sample(addr, channel=1)
        return self.fpgamemory.get(addr, 0)

    def _scope_sample(self, addr: int, channel: int) -> int:
        sample_index = ((addr & 0xFFFF) // 4) & 0x3FFF
        signal = self.fpgamemory.get(0x40380000 if channel == 0 else 0x40390000, 10 + channel)
        value = self._fake_signal_value(signal, sample_index)
        if value < 0:
            value += 2**14
        return value & (2**14 - 1)

    def _fake_signal_value(self, signal: int, sample_index: int) -> int:
        return self.fake_signal_value(signal, sample_index + self.phase)

    def fake_signal_value(self, signal: int, absolute_index: int) -> int:
        np = _np()
        x = int(absolute_index)
        if signal == 15:
            return 0
        if signal in {8, 9}:
            return self._fake_asg_value(channel=signal - 8, absolute_index=x)
        if signal in {0, 1, 2}:
            return int(np.sin(x / (120.0 + signal * 25.0)) * (2**10) + np.sin(x / 18.0) * (2**9))
        if signal in {5, 6, 7, 14}:
            return int(np.cos(x / (75.0 + signal * 3.0)) * (2**11))
        if signal in {12, 13}:
            ramp = ((x * (signal - 10)) % 2048) - 1024
            return int(ramp * 3)
        if signal == 3:
            return int((4096 if (x // 128) % 2 == 0 else -4096) * 0.8)
        if signal == 4:
            return int(np.sin(x / 160.0) * (2**12) * np.exp(-((x % 2048) / 4096.0)))
        base = 90.0 if signal == 10 else 63.0
        phase = 0.0 if signal == 10 else 1.3
        return int(np.sin(x / base + phase) * (2**12))

    def _fake_asg_value(self, channel: int, absolute_index: int) -> int:
        np = _np()
        value_offset = 0 if channel == 0 else 0x20
        data_addr = ASG_ADDR_BASE + (0x10000 if channel == 0 else 0x20000)
        amplitude_addr = ASG_ADDR_BASE + 0x4 + value_offset
        frequency_addr = ASG_ADDR_BASE + 0x10 + value_offset
        if (
            amplitude_addr not in self.fpgamemory
            and frequency_addr not in self.fpgamemory
            and data_addr not in self.fpgamemory
        ):
            if channel == 0:
                return int(np.sin(absolute_index / 42.0) * (2**12))
            return int(np.sign(np.sin(absolute_index / 54.0)) * (2**11))

        amplitude_offset_word = self.fpgamemory.get(amplitude_addr, 0)
        amplitude = (amplitude_offset_word & 0x3FFF) / float(2**13)
        offset_raw = (amplitude_offset_word >> 16) & 0x3FFF
        if offset_raw & (1 << 13):
            offset_raw -= 1 << 14
        offset = offset_raw / float(2**13)

        frequency_word = self.fpgamemory.get(frequency_addr, 0)
        phase_step = max(1.0, frequency_word / float(2**16))
        table_index = int((absolute_index * phase_step) % ASG_DATA_LENGTH)
        table_word = self.fpgamemory.get(data_addr + table_index * 4)
        if table_word is None:
            table_value = np.sin(absolute_index / (42.0 if channel == 0 else 54.0))
        else:
            table_sample = int(table_word) & 0x3FFF
            if table_sample & (1 << 13):
                table_sample -= 1 << 14
            table_value = table_sample / float(2**13)
        return int(max(-8192, min(8191, round((offset + amplitude * table_value) * (2**13)))))
