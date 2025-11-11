# conftest.py - pytest automatically discovers fixtures from this file
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

# Global variable to store which source config to use
_source_config_file = "nosetests_source.yml"


def pytest_collection_modifyitems(session, config, items):
    """
    Hook called after test collection. 
    Checks if test_attribute.py or test_lockbox.py are in the session.
    """
    global _source_config_file
    
    # Check if any collected tests are from test_attribute.py or test_lockbox.py
    found_attribute = False
    found_lockbox = False
    
    for item in items:
        # Get the test file name
        test_file = item.fspath.basename
        
        if test_file == 'test_attribute.py':
            found_attribute = True
        elif test_file == 'test_lockbox.py':
            found_lockbox = True
    
    # Priority: attribute > lockbox > default
    # (Changed priority so test_attribute.py takes precedence)
    if found_attribute:
        _source_config_file = "nosetests_source_dummy_module.yml"
        logger.info(f"Found test_attribute.py in test session - using source config: {_source_config_file}")
    elif found_lockbox:
        _source_config_file = "nosetests_source_lockbox.yml"
        logger.info(f"Found test_lockbox.py in test session - using source config: {_source_config_file}")
    
    logger.info(f"Final source config file: {_source_config_file}")


@pytest.fixture(scope="session")
def pyrpl_instance():
    """Session-scoped fixture to create a single pyrpl instance for all tests."""
    tmp_file = "nosetests_config.yml"
    tmp_conf = os.path.join(user_config_dir, tmp_file)
    
    # Remove file before tests
    if os.path.isfile(tmp_conf):
        try:
            os.remove(tmp_conf)
        except (WindowsError, OSError):
            pass
    while os.path.exists(tmp_conf):
        pass  # make sure the file is really gone before proceeding further
    
    # Create pyrpl instance with the determined source config
    logger.info(f"Creating Pyrpl instance with source config: {_source_config_file}")
    pyrpl = Pyrpl(config=tmp_file, source=_source_config_file)
    
    # Setup: Perform initial timing measurements
    r = pyrpl.rp
    N = 10
    t0 = time()
    for i in range(N):
        r.hk.led
    read_time = (time()-t0)/float(N)
    
    t0 = time()
    for i in range(N):
        r.hk.led = 0
    write_time = (time()-t0)/float(N)
    
    # Store timing info on the pyrpl object for later access
    pyrpl._test_read_time = read_time
    pyrpl._test_write_time = write_time
    pyrpl._test_communication_time = (read_time + write_time)/2.0
    
    print("Estimated time per read / write operation: %.1f ms / %.1f ms" %
          (read_time*1000.0, write_time*1000.0))
    sleep(0.1)  # give some time for events to get processed
    
    yield pyrpl
    
    # Teardown: Clean up after all tests complete
    try:
        pyrpl._clear()
    except (FileNotFoundError, OSError):
        # In case the config file was already deleted or inaccessible, just continue
        pass
    
    sleep(0.2)  # Give time for file operations to complete
    
    # Remove file after pyrpl is cleared
    if os.path.isfile(tmp_conf):
        try:
            os.remove(tmp_conf)
        except (WindowsError, OSError):
            pass
    
    # Wait for file to be fully deleted
    max_attempts = 10
    for _ in range(max_attempts):
        if not os.path.exists(tmp_conf):
            break
        sleep(0.1)