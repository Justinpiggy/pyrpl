import unittest

import numpy as np

from pyrpl_websocket.monitor_client import DummyClient
from pyrpl_websocket.scope import ScopeFrame, decode_scope_words, read_scope_frame


class ScopeFrameTest(unittest.TestCase):
    def test_decode_scope_words_handles_signed_14_bit_values(self):
        decoded = decode_scope_words(np.array([0, 1, 8191, 8192, 16383], dtype=np.uint32))
        np.testing.assert_allclose(
            decoded,
            np.array([0.0, 1 / 8192, 8191 / 8192, -1.0, -1 / 8192], dtype=np.float32),
        )

    def test_scope_frame_roundtrip(self):
        frame = read_scope_frame(DummyClient(), sequence=7, sample_count=16)
        encoded = frame.to_bytes()
        decoded = ScopeFrame.from_bytes(encoded)
        self.assertEqual(decoded.sequence, 7)
        self.assertEqual(decoded.sample_count, 16)
        self.assertEqual(decoded.channel_count, 2)
        self.assertEqual(decoded.samples().shape, (16, 2))

    def test_fake_scope_advances_between_frames(self):
        client = DummyClient()
        first = read_scope_frame(client, sequence=1, sample_count=256).samples()
        second = read_scope_frame(client, sequence=2, sample_count=256).samples()
        self.assertFalse(np.array_equal(first, second))


if __name__ == "__main__":
    unittest.main()
