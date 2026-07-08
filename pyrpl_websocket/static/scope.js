(function () {
  const MAGIC = "PWS1";
  const HEADER_BYTES = 24;
  const canvas = document.getElementById("scope-canvas");
  const status = document.getElementById("status");
  const sessionLine = document.getElementById("session-line");
  const streamToggle = document.getElementById("stream-toggle");
  const singleFrame = document.getElementById("single-frame");
  const registerAddr = document.getElementById("register-addr");
  const registerLength = document.getElementById("register-length");
  const registerValues = document.getElementById("register-values");
  const registerRead = document.getElementById("register-read");
  const registerWrite = document.getElementById("register-write");
  const controlOutput = document.getElementById("control-output");
  const zoomOut = document.getElementById("zoom-out");
  const zoomIn = document.getElementById("zoom-in");
  const zoomReset = document.getElementById("zoom-reset");
  const plotRange = document.getElementById("plot-range");
  const ctx = canvas.getContext("2d");
  let socket = null;
  let controlSocket = null;
  let latestFrame = null;
  let nextRequestId = 1;
  let panState = null;
  const view = { start: 0, end: 1 };
  const pendingControl = new Map();

  function setStatus(message) {
    status.textContent = message;
  }

  function websocketUrl() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/ws/scope?samples=4096`;
  }

  function controlUrl() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/ws/control`;
  }

  function parseInteger(text) {
    const value = Number(String(text).trim());
    if (!Number.isInteger(value)) {
      throw new Error(`Invalid integer: ${text}`);
    }
    return value;
  }

  function parseValues(text) {
    return String(text)
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(parseInteger);
  }

  function setControlOutput(message) {
    controlOutput.textContent = message;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function viewSpan() {
    return view.end - view.start;
  }

  function setView(start, end) {
    const minimumSpan = 0.002;
    let span = Math.max(minimumSpan, end - start);
    if (span >= 1) {
      view.start = 0;
      view.end = 1;
      return;
    }
    let nextStart = start;
    let nextEnd = start + span;
    if (nextStart < 0) {
      nextEnd -= nextStart;
      nextStart = 0;
    }
    if (nextEnd > 1) {
      nextStart -= nextEnd - 1;
      nextEnd = 1;
    }
    view.start = clamp(nextStart, 0, 1 - span);
    view.end = clamp(nextEnd, span, 1);
  }

  function resetView() {
    view.start = 0;
    view.end = 1;
    if (latestFrame) {
      drawFrame(latestFrame);
    } else {
      updatePlotRange();
    }
  }

  function zoomAt(ratio, factor) {
    const span = viewSpan();
    const anchor = view.start + span * ratio;
    const nextSpan = clamp(span * factor, 0.002, 1);
    const nextStart = anchor - nextSpan * ratio;
    setView(nextStart, nextStart + nextSpan);
    if (latestFrame) {
      drawFrame(latestFrame);
    } else {
      updatePlotRange();
    }
  }

  function canvasRatio(clientX) {
    const rect = canvas.getBoundingClientRect();
    return clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
  }

  function updatePlotRange(frame = latestFrame) {
    if (!frame) {
      plotRange.textContent = "Full range";
      return;
    }
    const first = Math.floor(view.start * Math.max(0, frame.sampleCount - 1));
    const last = Math.ceil(view.end * Math.max(0, frame.sampleCount - 1));
    const percent = Math.round(viewSpan() * 1000) / 10;
    plotRange.textContent = `Samples ${first}-${last} | ${percent}%`;
  }

  function settlePending(error) {
    for (const { reject } of pendingControl.values()) {
      reject(error);
    }
    pendingControl.clear();
  }

  function connectControl() {
    if (controlSocket && controlSocket.readyState <= WebSocket.OPEN) {
      return controlSocket;
    }
    controlSocket = new WebSocket(controlUrl());
    controlSocket.onopen = () => setControlOutput("Control socket connected");
    controlSocket.onclose = () => {
      settlePending(new Error("Control socket closed"));
      controlSocket = null;
      setControlOutput("Control socket closed");
    };
    controlSocket.onerror = () => setControlOutput("Control socket error");
    controlSocket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      const request = pendingControl.get(response.id);
      if (!request) {
        return;
      }
      pendingControl.delete(response.id);
      if (response.ok) {
        request.resolve(response);
      } else {
        request.reject(new Error(response.error?.detail || "Control request failed"));
      }
    };
    return controlSocket;
  }

  function sendControl(message) {
    const id = nextRequestId;
    nextRequestId += 1;
    const request = { ...message, id };
    return new Promise((resolve, reject) => {
      const ws = connectControl();
      pendingControl.set(id, { resolve, reject });
      const transmit = () => ws.send(JSON.stringify(request));
      if (ws.readyState === WebSocket.OPEN) {
        transmit();
      } else {
        ws.addEventListener("open", transmit, { once: true });
      }
    });
  }

  async function refreshSession() {
    try {
      const response = await sendControl({ type: "session.get" });
      const session = response.session;
      const mode = session.fake ? "fake hardware" : session.settings.hostname;
      sessionLine.textContent = `Session: ${mode} | reads ${session.reads} | writes ${session.writes}`;
    } catch (error) {
      sessionLine.textContent = "Session unavailable";
    }
  }

  function parseFrame(buffer) {
    if (buffer.byteLength < HEADER_BYTES) {
      throw new Error("Frame too short");
    }
    const view = new DataView(buffer);
    const magic = String.fromCharCode(...new Uint8Array(buffer.slice(0, 4)));
    if (magic !== MAGIC) {
      throw new Error(`Bad frame magic ${magic}`);
    }
    const version = view.getUint16(4, true);
    if (version !== 1) {
      throw new Error(`Unsupported frame version ${version}`);
    }
    const channelCount = view.getUint16(6, true);
    const sampleCount = view.getUint32(8, true);
    const timestamp = Number(view.getBigUint64(12, true));
    const sequence = view.getUint32(20, true);
    const samples = new Float32Array(buffer, HEADER_BYTES);
    return { channelCount, sampleCount, timestamp, sequence, samples };
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const width = Math.max(320, Math.floor(rect.width * scale));
    const height = Math.max(320, Math.floor(rect.height * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawGrid(width, height) {
    ctx.strokeStyle = "#17242d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += width / 10) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += height / 8) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  function drawChannelLine(frame, channel, color, baseline, firstSample, lastSample) {
    const width = canvas.width;
    const scale = canvas.height * 0.2;
    const visibleCount = Math.max(1, lastSample - firstSample);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, window.devicePixelRatio || 1);
    ctx.beginPath();
    for (let index = firstSample; index <= lastSample; index += 1) {
      const x = ((index - firstSample) / visibleCount) * width;
      const y = baseline - frame.samples[index * frame.channelCount + channel] * scale;
      if (index === firstSample) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  function drawChannelMinMax(frame, channel, color, baseline, firstSample, lastSample) {
    const width = canvas.width;
    const scale = canvas.height * 0.2;
    const visibleCount = Math.max(1, lastSample - firstSample + 1);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, window.devicePixelRatio || 1);
    ctx.beginPath();
    for (let pixel = 0; pixel < width; pixel += 1) {
      const rangeStart = firstSample + Math.floor((pixel / width) * visibleCount);
      const rangeEnd = Math.min(
        lastSample,
        firstSample + Math.ceil(((pixel + 1) / width) * visibleCount),
      );
      let min = Infinity;
      let max = -Infinity;
      for (let index = rangeStart; index <= rangeEnd; index += 1) {
        const value = frame.samples[index * frame.channelCount + channel];
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
      const yMin = baseline - min * scale;
      const yMax = baseline - max * scale;
      ctx.moveTo(pixel, yMin);
      ctx.lineTo(pixel, yMax);
    }
    ctx.stroke();
  }

  function drawChannel(frame, channel, color, baseline, firstSample, lastSample) {
    const visibleCount = Math.max(1, lastSample - firstSample + 1);
    if (visibleCount > canvas.width * 2) {
      drawChannelMinMax(frame, channel, color, baseline, firstSample, lastSample);
    } else {
      drawChannelLine(frame, channel, color, baseline, firstSample, lastSample);
    }
  }

  function drawFrame(frame) {
    latestFrame = frame;
    resizeCanvas();
    const width = canvas.width;
    const height = canvas.height;
    const firstSample = Math.floor(view.start * Math.max(0, frame.sampleCount - 1));
    const lastSample = Math.max(
      firstSample,
      Math.ceil(view.end * Math.max(0, frame.sampleCount - 1)),
    );
    ctx.clearRect(0, 0, width, height);
    drawGrid(width, height);
    drawChannel(frame, 0, "#4fd17f", height * 0.33, firstSample, lastSample);
    if (frame.channelCount > 1) {
      drawChannel(frame, 1, "#ef6461", height * 0.67, firstSample, lastSample);
    }
    updatePlotRange(frame);
  }

  async function fetchSingleFrame() {
    setStatus("Fetching single frame...");
    const response = await fetch("/api/scope/frame?samples=4096");
    const buffer = await response.arrayBuffer();
    const frame = parseFrame(buffer);
    drawFrame(frame);
    setStatus(`Single frame ${frame.sequence}: ${frame.sampleCount} samples`);
    refreshSession();
  }

  function connectStream() {
    socket = new WebSocket(websocketUrl());
    socket.binaryType = "arraybuffer";
    socket.onopen = () => setStatus("Scope stream connected");
    socket.onclose = () => {
      setStatus("Scope stream closed");
      socket = null;
      streamToggle.textContent = "Connect Stream";
    };
    socket.onerror = () => setStatus("Scope stream error");
    socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        const frame = parseFrame(event.data);
        drawFrame(frame);
        setStatus(`Streaming frame ${frame.sequence}: ${frame.sampleCount} samples`);
      }
    };
    streamToggle.textContent = "Disconnect Stream";
  }

  function disconnectStream() {
    socket?.close();
    socket = null;
    streamToggle.textContent = "Connect Stream";
  }

  singleFrame.addEventListener("click", () => {
    fetchSingleFrame().catch((error) => setStatus(error.message));
  });

  registerRead.addEventListener("click", () => {
    let addr;
    let length;
    try {
      addr = parseInteger(registerAddr.value);
      length = parseInteger(registerLength.value);
    } catch (error) {
      setControlOutput(error.message);
      return;
    }
    sendControl({ type: "register.read", addr, length })
      .then((response) => {
        registerValues.value = response.values.join(", ");
        setControlOutput(`Read ${response.length} @ 0x${response.addr.toString(16)}`);
        refreshSession();
      })
      .catch((error) => setControlOutput(error.message));
  });

  registerWrite.addEventListener("click", () => {
    let addr;
    let values;
    try {
      addr = parseInteger(registerAddr.value);
      values = parseValues(registerValues.value);
    } catch (error) {
      setControlOutput(error.message);
      return;
    }
    sendControl({ type: "register.write", addr, values })
      .then((response) => {
        setControlOutput(`Wrote ${response.count} @ 0x${response.addr.toString(16)}`);
        refreshSession();
      })
      .catch((error) => setControlOutput(error.message));
  });

  streamToggle.addEventListener("click", () => {
    if (socket) {
      disconnectStream();
    } else {
      connectStream();
    }
  });

  zoomOut.addEventListener("click", () => zoomAt(0.5, 1.8));
  zoomIn.addEventListener("click", () => zoomAt(0.5, 0.55));
  zoomReset.addEventListener("click", resetView);

  canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomAt(canvasRatio(event.clientX), event.deltaY < 0 ? 0.82 : 1.22);
    },
    { passive: false },
  );

  canvas.addEventListener("pointerdown", (event) => {
    panState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startView: { ...view },
    };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-panning");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!panState || panState.pointerId !== event.pointerId) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const deltaRatio = (event.clientX - panState.startX) / Math.max(1, rect.width);
    const span = panState.startView.end - panState.startView.start;
    const shift = -deltaRatio * span;
    setView(panState.startView.start + shift, panState.startView.end + shift);
    if (latestFrame) {
      drawFrame(latestFrame);
    }
  });

  function endPan(event) {
    if (panState && panState.pointerId === event.pointerId) {
      panState = null;
      canvas.classList.remove("is-panning");
    }
  }

  canvas.addEventListener("pointerup", endPan);
  canvas.addEventListener("pointercancel", endPan);
  canvas.addEventListener("dblclick", resetView);

  window.addEventListener("resize", () => {
    resizeCanvas();
    if (latestFrame) {
      drawFrame(latestFrame);
    }
  });
  resizeCanvas();
  updatePlotRange();
  refreshSession();
})();
