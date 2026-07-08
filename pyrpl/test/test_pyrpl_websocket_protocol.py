import unittest

from pyrpl_websocket.monitor_client import make_header


class MonitorProtocolTest(unittest.TestCase):
    def test_monitor_read_header_layout(self):
        header = make_header(b"r", addr=0x40100000, length=0x1234)
        self.assertEqual(header, bytes([ord("r"), 0, 0x34, 0x12, 0, 0, 0x10, 0x40]))

    def test_monitor_write_header_layout(self):
        header = make_header(b"w", addr=0x40110000, length=2)
        self.assertEqual(header, bytes([ord("w"), 0, 2, 0, 0, 0, 0x11, 0x40]))


if __name__ == "__main__":
    unittest.main()
