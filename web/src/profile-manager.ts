import { reportError } from "./status-bar";
import { THEMES, normalizeTheme, type ThemeName } from "./workspace";

export interface ProfileState {
  active: { id: string | null; name: string };
  profiles: Array<{ id: string; name: string; updated_at: string }>;
  workspace?: unknown;
  plot_views?: Record<string, Record<string, string | number | boolean>>;
  reason?: string;
  load_revision?: string | null;
  imported_id?: string;
}

export class ProfileManager {
  private state: ProfileState | null = null;
  private busy = false;
  private readOnly = true;
  private readonly dialog: HTMLDialogElement;
  private readonly select: HTMLSelectElement;
  private readonly name: HTMLInputElement;
  private readonly active: HTMLElement;
  private readonly status: HTMLOutputElement;
  private readonly file: HTMLInputElement;
  private readonly theme: HTMLSelectElement;
  private upload: Record<string, unknown> | null = null;

  constructor(private readonly options: {
    button: HTMLButtonElement;
    heading: HTMLElement;
    shell: HTMLElement;
    snapshot: () => { workspace: unknown; plot_views: unknown };
    flush: () => Promise<unknown>;
    loaded: (state: ProfileState) => void;
    theme: () => ThemeName;
    setTheme: (theme: ThemeName) => void;
  }) {
    this.dialog = document.createElement("dialog");
    this.dialog.id = "profiles-dialog";
    this.dialog.setAttribute("aria-labelledby", "profiles-heading");
    this.dialog.innerHTML = `
      <header class="profiles-header"><h2 id="profiles-heading">Profiles</h2><button type="button" data-action="close" aria-label="Close profiles">Close</button></header>
      <p class="profile-active-line">Active: <strong id="profiles-active"></strong></p>
      <label>Saved profile<select id="profiles-select" aria-label="Saved profile"></select></label>
      <label>Profile name<input id="profiles-name" maxlength="80" autocomplete="off" aria-label="Profile name"></label>
      <label>Color theme<select id="profiles-theme" aria-label="Color theme" data-control-scope="view"></select></label>
      <div class="profile-actions"><button type="button" data-action="save">Save current</button><button type="button" data-action="create">Save as new</button></div>
      <div class="profile-actions"><button type="button" data-action="load">Load selected</button><button type="button" data-action="rename">Rename selected</button></div>
      <label>Profile file (.json)<input id="profiles-file" type="file" accept=".json,application/json"></label>
      <div class="profile-actions"><button type="button" data-action="download">Download selected</button><button type="button" data-action="upload">Upload file</button></div>
      <p class="profile-load-note">Upload saves a copy using Profile name. Choose a new name if it already exists, then Load selected to apply it.</p>
      <p class="profile-load-note">Loading replaces settings and stops acquisition and Lockbox. Saved curves are kept.</p>
      <output id="profiles-status" aria-live="polite"></output>`;
    options.shell.appendChild(this.dialog);
    this.select = this.dialog.querySelector<HTMLSelectElement>("select")!;
    this.name = this.dialog.querySelector<HTMLInputElement>("input")!;
    this.active = this.dialog.querySelector("#profiles-active")!;
    this.status = this.dialog.querySelector<HTMLOutputElement>("output")!;
    this.file = this.dialog.querySelector<HTMLInputElement>("#profiles-file")!;
    this.theme = this.dialog.querySelector<HTMLSelectElement>("#profiles-theme")!;
    for (const [name, label] of Object.entries(THEMES)) this.theme.add(new Option(label, name));
    this.theme.value = options.theme();
    this.theme.addEventListener("change", () => options.setTheme(normalizeTheme(this.theme.value)));
    this.file.addEventListener("change", () => {
      void this.readUpload().catch(error => reportError(this.status, String(error.message ?? error)));
    });
    options.button.addEventListener("click", () => {
      this.theme.value = options.theme();
      this.dialog.showModal();
      this.refresh().catch(error => reportError(this.status, String(error.message ?? error)));
    });
    this.select.addEventListener("change", () => {
      this.name.value = this.state?.profiles.find(profile => profile.id === this.select.value)?.name ?? this.state?.active.name ?? "";
      this.updateButtons();
    });
    this.dialog.addEventListener("click", event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
      if (!button) return;
      if (button.dataset.action === "close") { this.dialog.close(); return; }
      void this.perform(button.dataset.action!).catch(error => reportError(this.status, String(error.message ?? error)));
    });
  }

  setReadOnly(readOnly: boolean): void {
    this.readOnly = readOnly;
    this.updateButtons();
  }

  async refresh(): Promise<ProfileState | null> {
    const response = await fetch("/api/profiles");
    if (!response.ok) {
      if (response.status === 404) return null; // Client can still display an older server.
      throw new Error(await this.error(response));
    }
    const state = await response.json() as ProfileState;
    this.apply(state);
    return state;
  }

  apply(state: ProfileState): void {
    const previousActive = this.state?.active.id;
    const previousSelected = this.select.value;
    this.state = state;
    this.options.heading.textContent = state.active.name;
    this.options.heading.title = state.active.name;
    document.title = `${state.active.name} — PyRPL`;
    this.active.textContent = state.active.name;
    this.select.replaceChildren();
    if (!state.profiles.length) this.select.add(new Option("No saved profiles", ""));
    for (const profile of state.profiles) this.select.add(new Option(profile.name, profile.id));
    this.select.value = state.imported_id ?? (previousActive !== state.active.id ? state.active.id ?? ""
      : state.profiles.some(profile => profile.id === previousSelected) ? previousSelected : state.active.id ?? state.profiles[0]?.id ?? "");
    if (document.activeElement !== this.name) {
      this.name.value = state.profiles.find(profile => profile.id === this.select.value)?.name ?? state.active.name;
    }
    this.updateButtons();
  }

  private updateButtons(): void {
    for (const button of this.dialog.querySelectorAll<HTMLButtonElement>("button[data-action]")) {
      const action = button.dataset.action;
      if (action === "close") continue;
      button.disabled = this.busy || (this.readOnly && action !== "download") || !this.state
        || ((action === "load" || action === "rename" || action === "download") && !this.select.value)
        || (action === "upload" && !this.upload);
    }
    this.select.disabled = this.busy;
    this.name.disabled = this.busy || this.readOnly;
    this.file.disabled = this.busy || this.readOnly;
    this.theme.disabled = this.busy;
  }

  private async readUpload(): Promise<void> {
    this.upload = null;
    this.updateButtons();
    const file = this.file.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) throw new Error("Profile upload exceeds 8 MiB");
    let profile: Record<string, unknown>;
    try {
      profile = JSON.parse(await file.text());
      if (!profile || profile.version !== 1 || typeof profile.name !== "string" || !profile.settings || typeof profile.settings !== "object") throw new Error();
    } catch {
      throw new Error("Choose a version 1 PyRPL profile JSON file");
    }
    this.upload = profile;
    this.name.value = String(profile.name);
    this.updateButtons();
  }

  private async download(): Promise<void> {
    const response = await fetch(`/api/profiles/${this.select.value}/download`);
    if (!response.ok) throw new Error(await this.error(response));
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    const name = this.state?.profiles.find(profile => profile.id === this.select.value)?.name ?? "profile";
    link.href = url;
    link.download = `${name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private async error(response: Response): Promise<string> {
    const data = await response.json().catch(() => ({}));
    return typeof data.detail === "string" ? data.detail : `Profile request failed (${response.status})`;
  }

  private async perform(action: string): Promise<void> {
    if (this.busy || !this.state) return;
    if (action === "download") { await this.download(); return; }
    if (this.readOnly) return;
    const name = this.name.value.trim();
    if ((action === "create" || action === "rename" || action === "upload" || !this.state.active.id) && !name) {
      this.name.focus();
      throw new Error("Enter a profile name");
    }
    this.busy = true;
    this.updateButtons();
    try {
      await this.options.flush();
      let path = "/api/profiles";
      let method = "POST";
      let body: unknown = { name, ...this.options.snapshot() };
      if (action === "upload") {
        path += "/import";
        body = { name, profile: this.upload };
      } else if (action === "save" && this.state.active.id) {
        path += `/${this.state.active.id}`;
        method = "PUT";
      } else if (action === "load") {
        path += `/${this.select.value}/load`;
        body = undefined;
      } else if (action === "rename") {
        path += `/${this.select.value}`;
        method = "PATCH";
        body = { name };
      }
      const response = await fetch(path, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
      if (!response.ok) throw new Error(await this.error(response));
      const state = await response.json() as ProfileState;
      this.apply(state);
      if (action === "upload") { this.upload = null; this.file.value = ""; }
      this.status.textContent = action === "load" ? "Loaded" : action === "rename" ? "Renamed" : "Saved";
      if (action === "load") this.options.loaded(state);
    } finally {
      this.busy = false;
      this.updateButtons();
    }
  }
}
