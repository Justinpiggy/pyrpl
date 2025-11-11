# unitary test for the RedPitaya and Pyrpl modules and baseclass for all other
# tests
import logging
logger = logging.getLogger(name=__name__)
import os
from pyrpl import Pyrpl, RedPitaya, user_config_dir


class TestRedpitaya(object):
    _shared_r = None
    @classmethod
    def setup_class(cls):
        print("=======SETTING UP TestRedpitaya===========")
        cls.hostname = os.environ.get('REDPITAYA_HOSTNAME')
        cls.password = os.environ.get('REDPITAYA_PASSWORD')
        if cls._shared_r is None:
            if cls.hostname is not None:
                cls.r = RedPitaya()
            else:
                cls.r = cls._shared_r

    @classmethod
    def teardown_class(cls):
        if cls is TestRedpitaya:
            print("=======TEARING DOWN TestRedpitaya===========")
            cls.r.end_all()

    def test_redpitaya(self):
        assert (self.r is not None)

    def test_connect(self):
        assert self.r.hk.led == 0
