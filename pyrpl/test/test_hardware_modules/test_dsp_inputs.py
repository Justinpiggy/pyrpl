import logging
logger = logging.getLogger(name=__name__)
import time
import numpy as np
from time import sleep
from qtpy import QtCore, QtWidgets
from pyrpl.test.test_base import TestPyrpl
import pytest


class TestInput(TestPyrpl):
    @pytest.fixture(autouse=True)
    def setup_lockbox(self):
        self.p = self.pyrpl
        self.l = self.pyrpl.lockbox
        self.l.classname = 'Interferometer'

    def test_input(self):
        self.p.lockbox.sequence[0].input = 'port1'
        assert self.p.lockbox.sequence[0].input == 'port1', \
            self.p.lockbox.sequence[0].input
        self.p.lockbox.sequence[0].input = 'port2'
        assert self.p.lockbox.sequence[0].input == 'port2', \
            self.p.lockbox.sequence[0].input
        self.p.lockbox.sequence[0].input = self.p.lockbox.inputs.port1
        assert self.p.lockbox.sequence[0].input == 'port1', \
            self.p.lockbox.sequence[0].input
        self.p.rp.pid0.input = self.p.lockbox.inputs.port2
        assert self.p.rp.pid0.input == 'lockbox.inputs.port2', self.p.rp.pid0.input
        self.p.rp.pid0.input = self.p.lockbox.sequence[0].input
        assert self.p.rp.pid0.input == 'lockbox.inputs.port1', self.p.rp.pid0.input
