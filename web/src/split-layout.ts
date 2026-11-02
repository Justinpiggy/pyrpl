import Split from "split.js";

/** Split.js pointer behavior plus the same sizing/persistence path for keyboard users. */
export function accessibleSplit(elements: HTMLElement[], options: Split.Options): Split.Instance {
  const gutters: HTMLElement[] = [];
  const horizontal = options.direction !== "vertical";
  let instance: Split.Instance;
  const update = () => {
    if (!instance) return;
    const sizes = instance.getSizes();
    gutters.forEach((gutter, index) => {
      const pair = sizes[index] + sizes[index + 1];
      gutter.setAttribute("aria-valuenow", String(Math.round(sizes[index] / pair * 100)));
    });
  };
  instance = Split(elements, {
    ...options,
    gutter: (index, direction) => {
      const gutter = document.createElement("div");
      gutter.className = `gutter gutter-${direction}`;
      gutter.tabIndex = 0;
      gutter.setAttribute("role", "separator");
      gutter.setAttribute("aria-orientation", horizontal ? "vertical" : "horizontal");
      gutter.setAttribute("aria-valuemin", "0");
      gutter.setAttribute("aria-valuemax", "100");
      const name = elements[index - 1].querySelector("h2, h3")?.textContent
        ?? elements[index - 1].closest(".workspace-panel")?.querySelector("h2")?.textContent
        ?? "Panel";
      gutter.setAttribute("aria-label", `${name} size`);
      gutter.title = "Resize: arrow keys, Shift for larger steps, Home/End for limits";
      gutter.addEventListener("keydown", event => {
        const negative = horizontal ? "ArrowLeft" : "ArrowUp";
        const positive = horizontal ? "ArrowRight" : "ArrowDown";
        if (![negative, positive, "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const sizes = instance.getSizes();
        const before = index - 1, after = index;
        const total = sizes[before] + sizes[after];
        const dimension = horizontal ? "width" : "height";
        const pixels = elements[before].getBoundingClientRect()[dimension]
          + elements[after].getBoundingClientRect()[dimension];
        const mins = elements.map((_, i) => Array.isArray(options.minSize)
          ? options.minSize[i] : options.minSize ?? 100);
        const low = Math.min(total / 2, mins[before] / Math.max(1, pixels) * total);
        const high = Math.max(total / 2, total - mins[after] / Math.max(1, pixels) * total);
        const step = total * (event.shiftKey ? 0.1 : 0.02);
        const target = event.key === "Home" ? low : event.key === "End" ? high
          : sizes[before] + (event.key === positive ? step : -step);
        sizes[before] = Math.min(high, Math.max(low, target));
        sizes[after] = total - sizes[before];
        instance.setSizes(sizes);
        update();
        options.onDrag?.(sizes);
        options.onDragEnd?.(sizes);
      });
      gutters.push(gutter);
      return gutter;
    },
    onDrag: sizes => { update(); options.onDrag?.(sizes); },
    onDragEnd: sizes => { update(); options.onDragEnd?.(sizes); },
  });
  update();
  return instance;
}
