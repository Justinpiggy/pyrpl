# unitary test for the RedPitaya and Pyrpl modules and baseclass for all other
# tests
import logging
import pytest
logger = logging.getLogger(name=__name__)
import os
from .. import Pyrpl, APP, user_config_dir, global_config
from ..pyrpl_utils import time
from ..async_utils import sleep
from ..errors import UnexpectedPyrplError, ExpectedPyrplError

# I don't know why, in nosetests, the logger goes to UNSET...
logger_quamash = logging.getLogger(name='quamash')
logger_quamash.setLevel(logging.INFO)


class TestPyrpl(object):
    """Base class for all pyrpl tests."""
    # names of the configfiles to use
    source_config_file = "nosetests_source.yml"
    tmp_config_file = "nosetests_config.yml"
    OPEN_ALL_DOCKWIDGETS = False

    @pytest.fixture(autouse=True)
    def _inject_pyrpl(self, pyrpl_instance):
        """Inject the shared pyrpl instance into each test class instance."""
        self.pyrpl = pyrpl_instance
        self.r = self.pyrpl.rp
        self.read_time = pyrpl_instance._test_read_time
        self.write_time = pyrpl_instance._test_write_time
        self.communication_time = pyrpl_instance._test_communication_time
        
        # Per-class setup
        if self.OPEN_ALL_DOCKWIDGETS and not getattr(self.pyrpl, '_widgets_opened', False):
            for name, dock_widget in self.pyrpl.widgets[0].dock_widgets.items():
                print("Showing widget %s..." % name)
                dock_widget.setVisible(True)
            sleep(3.0)  # give some time for startup
            self.pyrpl._widgets_opened = True
        
        # Initialize curves list for this test class
        if not hasattr(self, 'curves'):
            self.curves = []
        
        yield
        
        # Per-class teardown
        # Delete the curves fabricated in the test
        if hasattr(self, 'curves'):
            while len(self.curves) > 0:
                self.curves.pop().delete()

    def test_read_write_time(self):
        """Test that read/write times are within acceptable limits."""
        try:
            maxtime = global_config.test.max_communication_time
        except:
            raise ExpectedPyrplError("Error with global config file. "
                                       "Please delete the file %s and retry!"
                                       % os.path.join(user_config_dir,
                                                      'global_config.yml'))
        assert self.read_time < maxtime, \
            "Read operation is very slow: %e s (expected < %e s). It is " \
            "highly recommended that you improve the network connection to " \
            "your Red Pitaya device. " % (self.read_time, maxtime)
        assert self.write_time < maxtime, \
            "Write operation is very slow: %e s (expected < %e s). It is " \
            "highly recommended that you improve the network connection to " \
            "your Red Pitaya device. " % (self.write_time, maxtime)

    def test_pyrpl(self):
        """Test that pyrpl instance exists."""
        assert (self.pyrpl is not None)


# only one test class per file is allowed due to conflicts with
# inheritance from TestPyrpl base class