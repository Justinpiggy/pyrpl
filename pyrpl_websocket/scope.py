"""Scope data helpers for the web prototype."""

from __future__ import annotations

import struct
import time
from dataclasses import dataclass

import numpy as np


SCOPE_ADDR_BASE = 0x40100000
SCOPE_CH1_OFFSET = 0x10000
SCOPE_CH2_OFFSET = 0x20000
SCOPE_WRITE_POINTER_CURRENT_OFFSET = 0x18
SCOPE_DATA_LENGTH = 2**14
SCOPE_MAGIC = b"PWS1"
SCOPE_FRAME_VERSION = 1
SCOPE_HEADER_STRUCT = struct.Struct("<4sHHLQI")
SCOPE_HEADER_BYTES = SCOPE_HEADER_STRUCT.size


@dataclass
class ScopeFrame:
    sequence: int
    timestamp_ns: int
    sample_count: int
    channel_count: int
    payload: bytes

    def to_bytes(self) -> bytes:
        """Encode frame as a compact binary WebSocket message."""

        header = SCOPE_HEADER_STRUCT.pack(
            SCOPE_MAGIC,
            SCOPE_FRAME_VERSION,
            self.channel_count,
            self.sample_count,
            self.timestamp_ns,
            self.sequence,
        )
        return header + self.payload

    @classmethod
    def from_bytes(cls, data: bytes) -> "ScopeFrame":
        """Decode a binary scope frame."""

        if len(data) < SCOPE_HEADER_BYTES:
            raise ValueError("scope frame is shorter than the header")
        magic, version, channel_count, sample_count, timestamp_ns, sequence = (
            SCOPE_HEADER_STRUCT.unpack(data[:SCOPE_HEADER_BYTES])
        )
        if magic != SCOPE_MAGIC:
            raise ValueError("scope frame has invalid magic")
        if version != SCOPE_FRAME_VERSION:
            raise ValueError("scope frame version is unsupported")
        payload = data[SCOPE_HEADER_BYTES:]
        expected_bytes = sample_count * channel_count * np.dtype(np.float32).itemsize
        if len(payload) != expected_bytes:
            raise ValueError("scope frame payload length does not match metadata")
        return cls(
            sequence=sequence,
            timestamp_ns=timestamp_ns,
            sample_count=sample_count,
            channel_count=channel_count,
            payload=payload,
        )

    def samples(self) -> np.ndarray:
        """Return payload as a two-dimensional float32 array."""

        data = np.frombuffer(self.payload, dtype=np.float32)
        return data.reshape((self.sample_count, self.channel_count))


def decode_scope_words(words: np.ndarray) -> np.ndarray:
    """Convert 14-bit two's-complement scope words to float32 volts."""

    data = np.array(words, dtype=np.int32)
    data[data >= 2**13] -= 2**14
    return (data.astype(np.float32) / np.float32(2**13)).astype(np.float32)


def clamp_sample_count(sample_count: int) -> int:
    """Clamp a requested scope sample count to the implemented buffer size."""

    return max(1, min(SCOPE_DATA_LENGTH, int(sample_count)))


def make_scope_frame(sequence: int, ch1: np.ndarray, ch2: np.ndarray) -> ScopeFrame:
    """Pack two normalized channels into a binary-ready scope frame."""

    sample_count = min(len(ch1), len(ch2))
    interleaved = np.empty(sample_count * 2, dtype=np.float32)
    interleaved[0::2] = np.asarray(ch1[:sample_count], dtype=np.float32)
    interleaved[1::2] = np.asarray(ch2[:sample_count], dtype=np.float32)
    return ScopeFrame(
        sequence=sequence,
        timestamp_ns=time.time_ns(),
        sample_count=sample_count,
        channel_count=2,
        payload=interleaved.tobytes(),
    )


def read_scope_frame(client, sequence: int, sample_count: int = SCOPE_DATA_LENGTH) -> ScopeFrame:
    """Read both scope channels and return a binary-ready raw frame."""

    sample_count = clamp_sample_count(sample_count)
    ch1_words = client.reads(SCOPE_ADDR_BASE + SCOPE_CH1_OFFSET, sample_count)
    ch2_words = client.reads(SCOPE_ADDR_BASE + SCOPE_CH2_OFFSET, sample_count)
    ch1 = decode_scope_words(ch1_words)
    ch2 = decode_scope_words(ch2_words)
    advance_scope_phase = getattr(client, "advance_scope_phase", None)
    if callable(advance_scope_phase):
        advance_scope_phase(sample_count)
    return make_scope_frame(sequence, ch1, ch2)


def read_trigger_aligned_scope_frame(client, sequence: int, roll_offset: int, sample_count: int = SCOPE_DATA_LENGTH) -> ScopeFrame:
    """Read the full hardware ring buffer and align it to PyRPL trigger time."""

    sample_count = clamp_sample_count(sample_count)
    ch1_words = client.reads(SCOPE_ADDR_BASE + SCOPE_CH1_OFFSET, SCOPE_DATA_LENGTH)
    ch2_words = client.reads(SCOPE_ADDR_BASE + SCOPE_CH2_OFFSET, SCOPE_DATA_LENGTH)
    ch1 = np.roll(decode_scope_words(ch1_words), roll_offset)
    ch2 = np.roll(decode_scope_words(ch2_words), roll_offset)
    return make_scope_frame(sequence, ch1[:sample_count], ch2[:sample_count])


def read_rolling_scope_frame(
    client,
    sequence: int,
    sample_count: int = SCOPE_DATA_LENGTH,
) -> ScopeFrame:
    """Read a PyRPL-style untriggered rolling frame from the live ring buffer."""

    sample_count = clamp_sample_count(sample_count)
    write_pointer_before = int(client.reads(SCOPE_ADDR_BASE + SCOPE_WRITE_POINTER_CURRENT_OFFSET, 1)[0])
    ch1_words = client.reads(SCOPE_ADDR_BASE + SCOPE_CH1_OFFSET, SCOPE_DATA_LENGTH)
    ch2_words = client.reads(SCOPE_ADDR_BASE + SCOPE_CH2_OFFSET, SCOPE_DATA_LENGTH)
    write_pointer_after = int(client.reads(SCOPE_ADDR_BASE + SCOPE_WRITE_POINTER_CURRENT_OFFSET, 1)[0])
    to_discard = (int(write_pointer_after) - int(write_pointer_before)) % SCOPE_DATA_LENGTH

    def roll_current(words: np.ndarray) -> np.ndarray:
        data = np.roll(decode_scope_words(words), SCOPE_DATA_LENGTH - int(write_pointer_before))
        if to_discard:
            data = np.concatenate(
                [
                    np.full(to_discard, np.nan, dtype=np.float32),
                    data[to_discard:],
                ]
            )
        return data.astype(np.float32)

    ch1 = roll_current(ch1_words)
    ch2 = roll_current(ch2_words)
    if sample_count < SCOPE_DATA_LENGTH:
        ch1 = ch1[-sample_count:]
        ch2 = ch2[-sample_count:]
    return make_scope_frame(sequence, ch1, ch2)
