const fs = require("fs");
const path = require("path");
const vm = require("vm");
const app = fs.readFileSync(path.join(__dirname, "..", "assets/js/app.js"), "utf8");

function assert(ok, message) { if (!ok) throw new Error(message); }
const start = app.indexOf("  function logoZoomAttrs(label)");
const end = app.indexOf("  function renderList()", start);
const code = app.slice(start, end);
const elements = Object.create(null);
const docListeners = Object.create(null);

function element(id) {
  const listeners = Object.create(null);
  return {
    id, dataset: {}, style: {}, attributes: {}, hidden: false, open: false,
    textContent: "", alt: "", src: "", currentSrc: "", dir: "",
    parentElement: null,
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    dispatch(type, event = {}) {
      event.target = event.target || this;
      (listeners[type] || []).forEach(fn => fn(event));
    },
    setAttribute(k, v) { this.attributes[k] = String(v); if (k === "open") this.open = true; },
    getAttribute(k) { return this.attributes[k] ?? null; },
    removeAttribute(k) { delete this.attributes[k]; if (k === "src") this.src = ""; if (k === "open") this.open = false; },
    focus() { this.focused = true; },
    showModal() { this.open = true; },
    close() { this.open = false; this.dispatch("close"); },
    matches(selector) { return selector === 'img[data-logo-zoom="true"]' && this.attributes["data-logo-zoom"] === "true"; },
    closest(selector) { return this.matches(selector) ? this : null; }
  };
}
for (const id of ["logoZoomDialog","logoZoomImage","logoZoomStage","logoZoomTitle","logoZoomEyebrow","logoZoomHint","logoZoomClose"]) {
  elements["#" + id] = element(id);
}
const source = element("sourceLogo");
source.src = "https://example.test/logo.svg";
source.currentSrc = source.src;
source.alt = "Example Aerospace";
source.attributes["data-logo-zoom"] = "true";
source.attributes.role = "button";
source.parentElement = { id: "logoWrapper" };
const document = {
  querySelector(s) { return elements[s] || null; },
  addEventListener(type, fn, capture) { (docListeners[type] ||= []).push({fn,capture}); },
  contains(node) { return node === source; },
  activeElement: null
};
const window = {
  getComputedStyle(node) {
    return { backgroundColor: node === source ? "rgba(0, 0, 0, 0)" : "rgb(11, 20, 32)" };
  }
};
const context = {
  document, window, LANG: "fa",
  esc: s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"
  }[c])),
  $: s => document.querySelector(s)
};
vm.createContext(context);
vm.runInContext(code + "\ninitLogoZoom();", context);

const dialog = elements["#logoZoomDialog"];
const image = elements["#logoZoomImage"];
const title = elements["#logoZoomTitle"];
const close = elements["#logoZoomClose"];
const stage = elements["#logoZoomStage"];

const click = docListeners.click.find(x => x.capture).fn;
click({ target: source, preventDefault(){this.prevented=true;}, stopPropagation(){this.stopped=true;} });
assert(dialog.open, "click should open modal");
assert(title.textContent === "Example Aerospace", "modal should show logo title");
assert(image.src === source.src && image.alt === source.alt, "modal should use original logo source and alt");
assert(stage.style.background === "rgb(11, 20, 32)", "modal should retain logo contrast background");

close.dispatch("click");
assert(!dialog.open, "close button should close modal");
assert(source.focused, "closing should restore focus to the source logo");

const keydown = docListeners.keydown.find(x => x.capture).fn;
keydown({ target: source, key: "Enter", preventDefault(){}, stopPropagation(){} });
assert(dialog.open, "Enter should open modal");
dialog.dispatch("click", { target: dialog });
assert(!dialog.open, "backdrop click should close modal");

keydown({ target: source, key: " ", preventDefault(){}, stopPropagation(){} });
assert(dialog.open, "Space should open modal");
image.dispatch("error");
assert(image.hidden && elements["#logoZoomHint"].textContent.includes("ممکن"), "image error should show localized fallback");
dialog.close();

console.log("PASS: delegated click opens the native modal with the original logo");
console.log("PASS: close button and backdrop dismiss the modal");
console.log("PASS: Enter/Space activate keyboard-accessible logos");
console.log("PASS: source contrast background and focus restoration are preserved");
console.log("PASS: image-load failure is handled without breaking the map UI");
