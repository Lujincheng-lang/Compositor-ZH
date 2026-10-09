import "./style.css";
import {
  createIcons,
  Move,
  SquareDashed,
  Paintbrush,
  Eraser,
  PaintBucket,
  RectangleHorizontal,
  Circle,
  Type,
  Pipette,
  Hand,
  ZoomIn,
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  ArrowUp,
  ArrowDown,
  Blend,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Crop,
  SlidersHorizontal,
  History,
  Square,
  RotateCw,
  Image as ImageIcon,
} from "lucide";
import {
  Editor,
  canvas,
  layer,
  composite,
  drawLayer,
  localPoint,
  worldPoint,
  MODES,
  checkSize,
} from "./engine";
const iconSet = {
  Move,
  SquareDashed,
  Paintbrush,
  Eraser,
  PaintBucket,
  RectangleHorizontal,
  Circle,
  Type,
  Pipette,
  Hand,
  ZoomIn,
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  ArrowUp,
  ArrowDown,
  Blend,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Crop,
  SlidersHorizontal,
  History,
  Square,
  RotateCw,
  Image: ImageIcon,
};
const tools = [
  ["move", "移动", "Move", "V"],
  ["select", "矩形选框", "SquareDashed", "M"],
  ["brush", "画笔", "Paintbrush", "B"],
  ["eraser", "橡皮擦", "Eraser", "E"],
  ["fill", "油漆桶", "PaintBucket", "G"],
  ["gradient", "渐变", "Blend", "Shift+G"],
  ["rect", "矩形", "RectangleHorizontal", "U"],
  ["ellipse", "椭圆", "Circle", "Shift+U"],
  ["text", "文字", "Type", "T"],
  ["eyedropper", "吸管", "Pipette", "I"],
  ["hand", "抓手", "Hand", "H"],
  ["zoom", "缩放", "ZoomIn", "Z"],
];
const menus = {
  文件: [
    ["new", "新建…", "Ctrl+N"],
    ["open", "打开…", "Ctrl+O"],
    ["place", "置入图片…", ""],
    ["open-comp", "导入原版 .comp 文件夹…", ""],
    null,
    ["save", "保存项目…", "Ctrl+S"],
    ["export-png", "导出 PNG…", "Ctrl+Shift+S"],
    ["export-jpg", "导出 JPEG…", ""],
    ["export-psd", "导出栅格图层 PSD…", ""],
    null,
    ["recovery", "恢复自动备份…", ""],
  ],
  编辑: [
    ["undo", "撤销", "Ctrl+Z"],
    ["redo", "重做", "Ctrl+Shift+Z"],
    null,
    ["copy-selection", "复制选区到新图层", "Ctrl+J"],
    ["fill-selection", "填充前景色", "Alt+Backspace"],
    ["clear", "清除选区像素", "Delete"],
    null,
    ["transform", "自由变换", "Ctrl+T"],
  ],
  图像: [
    ["size", "画布尺寸 / 分辨率…", ""],
    ["crop", "按选区裁切…", ""],
    null,
    ["brightness", "亮度…", ""],
    ["contrast", "对比度…", ""],
    ["saturate", "饱和度…", ""],
    ["grayscale", "去色", "Ctrl+Shift+U"],
    ["invert", "反相", "Ctrl+I"],
  ],
  图层: [
    ["add", "新建图层", "Ctrl+Shift+N"],
    ["duplicate", "复制图层", ""],
    ["rename", "重命名图层…", ""],
    ["merge", "向下合并", "Ctrl+E"],
    ["delete-layer", "删除图层", ""],
    null,
    ["mask", "添加 / 切换蒙版", ""],
    ["remove-mask", "移除蒙版…", ""],
    ["lock", "锁定 / 解锁", ""],
    ["flip-x", "水平翻转", ""],
    ["flip-y", "垂直翻转", ""],
  ],
  选择: [
    ["select-all", "全部", "Ctrl+A"],
    ["deselect", "取消选择", "Ctrl+D"],
  ],
  滤镜: [["blur", "高斯模糊…", ""]],
  视图: [
    ["fit", "适合屏幕", "Ctrl+0"],
    ["actual", "实际像素", "Ctrl+1"],
    ["zoom-in", "放大", "Ctrl++"],
    ["zoom-out", "缩小", "Ctrl+-"],
    ["fullscreen", "画布专注模式", "F"],
  ],
  帮助: [
    ["help", "快捷键与版本说明…", ""],
    ["demo", "打开内置示例…", ""],
  ],
};
const i = (name) =>
  `<i data-lucide="${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}"></i>`;
const $ = (s) => document.querySelector(s);
$("#app").innerHTML =
  `<header class="menubar"><div class="brand"><span>Co</span>Compositor</div>${Object.entries(
    menus,
  )
    .map(
      ([name, items]) =>
        `<div class="menu"><button aria-haspopup="menu">${name}</button><div class="dropdown" role="menu">${items.map((item) => (item ? `<button role="menuitem" data-action="${item[0]}">${item[1]}<kbd>${item[2]}</kbd></button>` : "<hr>")).join("")}</div></div>`,
    )
    .join("")}<span class="version">Windows 中文版 · 0.1</span></header>
<div class="options"><span id="tool-name">移动工具</span><span class="divider"></span><label id="brush-option">大小 <input id="brush-size" aria-label="画笔大小" type="number" value="30" min="1" max="1000"> px</label><label id="opacity-option">不透明度 <input id="brush-opacity" aria-label="工具不透明度" type="number" value="100" min="1" max="100"> %</label><label id="hardness-option">硬度 <input id="hardness" type="range" value="80" min="0" max="100" aria-label="画笔硬度"></label><label id="tolerance-option">容差 <input id="tolerance" type="number" value="24" min="0" max="255" aria-label="填充容差"></label><button data-action="transform" title="自由变换 Ctrl+T">${i("Move")} 变换</button><span class="tip" id="tool-tip">拖动图层 · Shift 约束方向 · 空格平移</span></div>
<main class="workspace"><aside class="tools" aria-label="工具栏">${tools.map((t) => `<button data-tool="${t[0]}" aria-label="${t[1]}" title="${t[1]} (${t[3]})">${i(t[2])}</button>`).join("")}<div class="split"></div><button data-action="crop" title="按选区裁切">${i("Crop")}</button><div class="colors"><input id="bg" type="color" value="#ffffff" aria-label="背景色" title="背景色"><input id="fg" type="color" value="#111111" aria-label="前景色" title="前景色"></div><button data-action="swap" title="交换前景 / 背景色 (X)">${i("RotateCw")}</button></aside>
<section class="view"><div class="tabs"><div class="tab" id="document-tab">起始页</div><div class="spacer"></div><button data-action="open" title="打开">${i("FolderOpen")}</button><button data-action="save" title="保存">${i("Save")}</button></div><div class="ruler-top"><canvas id="ruler"></canvas></div><div class="viewport" tabindex="0" aria-label="图像编辑画布"><div class="stage hidden"><canvas id="display"></canvas></div><canvas id="overlay"></canvas><div class="welcome"><div class="mark">Co</div><h1>让创作回到画布</h1><p>本地编辑 · 中文工作区 · 熟悉的操作方式</p><div><button class="primary" data-action="new">新建文档</button> <button data-action="open">打开图片或项目</button></div><button data-action="demo">探索示例文档 →</button><div class="shortcuts"><span>Ctrl+N 新建</span><span>Ctrl+O 打开</span><span>拖入图片即可置入</span></div></div></div></section>
<aside class="side"><div class="panel-heading">导航器<span class="light">sRGB / 8 位</span></div><div class="navigator"><canvas id="navigator" width="256" height="105"></canvas><div class="nav-controls"><button data-action="zoom-out" aria-label="缩小">−</button><input id="zoom-range" type="range" min="5" max="400" value="100" aria-label="视图缩放"><button data-action="zoom-in" aria-label="放大">+</button><span id="zoom-label">100%</span></div></div><div class="panel-heading">变换与属性<span class="light" id="layer-kind">像素图层</span></div><div class="properties"><label>X <input id="prop-x" type="number" aria-label="图层 X"></label><label>Y <input id="prop-y" type="number" aria-label="图层 Y"></label><label>W <input id="prop-w" type="number" min="1" aria-label="图层宽度"></label><label>H <input id="prop-h" type="number" min="1" aria-label="图层高度"></label><label>角度 <input id="prop-rotation" type="number" aria-label="图层角度"></label><label>DPI <input id="prop-dpi" type="number" min="1" max="9600" aria-label="分辨率"></label><div class="wide"><button data-action="flip-x" title="水平翻转">${i("FlipHorizontal")}</button><button data-action="flip-y" title="垂直翻转">${i("FlipVertical")}</button><button data-action="edit-text" title="编辑文字">${i("Type")}</button></div></div><div class="panel-tabs"><button class="active" data-panel="layers">图层</button><button data-panel="history">历史记录</button></div><div class="layer-controls"><select id="blend" aria-label="混合模式">${MODES.map((m) => `<option value="${m[0]}">${m[1]}</option>`).join("")}</select><label>不透明度 <input id="layer-opacity" type="number" min="0" max="100" value="100" aria-label="图层不透明度">%</label></div><div class="layer-list"></div><div class="history-list"></div><div class="layer-footer"><button data-action="add" title="新建图层">${i("Plus")}</button><button data-action="mask" title="添加 / 切换蒙版">${i("Square")}</button><button data-action="duplicate" title="复制图层">${i("Copy")}</button><button data-action="up" title="上移图层">${i("ArrowUp")}</button><button data-action="down" title="下移图层">${i("ArrowDown")}</button><button data-action="delete-layer" title="删除图层">${i("Trash2")}</button><span id="layer-count">0 层</span></div></aside></main>
<footer class="statusbar"><button data-action="fit" id="status-zoom">适合屏幕</button><span id="dimensions">无文档</span><span class="message" id="status">就绪</span><span>离线工作区</span></footer><input type="file" id="file-input" accept=".png,.jpg,.jpeg,.webp,.bmp,.psd,.cwin" multiple hidden>`;
function icons() {
  createIcons({ icons: iconSet, attrs: { "aria-hidden": "true" } });
}
icons();
export const editor = new Editor();
let tool = "move",
  zoom = 1,
  pan = { x: 0, y: 0 },
  space = false,
  gesture = null,
  panel = "layers",
  transform = true,
  toastTimer,
  modalOpen = false,
  working = false,
  recoveryRevision = 0,
  revision = 0;
const view = $(".viewport"),
  stage = $(".stage"),
  display = $("#display"),
  overlay = $("#overlay");
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function notify(message, error = false) {
  $("#status").textContent = message;
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  if (error) el.style.borderColor = "#d78975";
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), error ? 8000 : 3500);
}
async function run(fn) {
  if (working) return;
  working = true;
  document.body.classList.add("busy");
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    notify(e.message || String(e), true);
  } finally {
    working = false;
    document.body.classList.remove("busy");
  }
}
function dialog(title, body, confirm = "确定") {
  return new Promise((resolve) => {
    modalOpen = true;
    const el = document.createElement("div");
    el.className = "modal-backdrop";
    el.innerHTML = `<form class="dialog"><h2>${esc(title)}</h2>${body}<footer><button type="button" data-cancel>取消</button><button type="submit" class="primary">${esc(confirm)}</button></footer></form>`;
    document.body.append(el);
    const finish = (result) => {
      el.remove();
      modalOpen = false;
      resolve(result);
    };
    el.querySelector("[data-cancel]").onclick = () => finish(null);
    el.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      const values = Object.fromEntries(new FormData(e.target));
      finish(values);
    };
    el.onkeydown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        finish(null);
      }
      if (e.key === "Tab") {
        const items = [...el.querySelectorAll("button,input,select,textarea")];
        if (e.shiftKey && document.activeElement === items[0]) {
          e.preventDefault();
          items.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    el.querySelector("input,textarea,button").focus();
  });
}
const field = (label, name, value, type = "number", extra = "") =>
  `<label>${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
async function discard() {
  return (
    !editor.dirty ||
    !!(await dialog(
      "保留当前修改？",
      '<p class="description">当前文档有未保存修改。继续会替换当前文档；请先取消并保存，或选择放弃修改。</p>',
      "放弃修改",
    ))
  );
}
function requireDoc() {
  if (!editor.doc) throw Error("请先新建或打开文档");
  if (editor.busy) throw Error("正在恢复历史记录，请稍候");
  return editor.active;
}
function editable() {
  const l = requireDoc();
  if (l.locked) throw Error("图层已锁定，请先解锁");
  return l;
}
function setTool(next) {
  tool = next;
  transform = next === "move";
  document.querySelectorAll("[data-tool]").forEach((b) => {
    b.classList.toggle("active", b.dataset.tool === next);
    b.setAttribute("aria-pressed", b.dataset.tool === next);
  });
  $("#tool-name").textContent = tools.find((t) => t[0] === tool)[1];
  $("#brush-option").classList.toggle(
    "hidden",
    !["brush", "eraser"].includes(tool),
  );
  $("#hardness-option").classList.toggle(
    "hidden",
    !["brush", "eraser"].includes(tool),
  );
  $("#tolerance-option").classList.toggle("hidden", tool !== "fill");
  $("#opacity-option").classList.toggle(
    "hidden",
    !["brush", "eraser", "gradient", "rect", "ellipse", "fill"].includes(tool),
  );
  const tips = {
    move: "拖动移动 · 右下角缩放 · 属性面板旋转",
    select: "拖动建立矩形选区 · Ctrl+D 取消",
    brush: "拖动绘画 · [ / ] 调大小 · 蒙版上隐藏内容",
    eraser: "擦除像素 · 蒙版上恢复可见区域",
    gradient: "拖动从前景色渐变到背景色",
    text: "单击添加文字 · 右侧 T 编辑所选文字",
    hand: "拖动平移 · 滚轮缩放",
    fill: "连续区域填充 · 可调整容差",
  };
  $("#tool-tip").textContent = tips[tool] || "Shift 约束比例 · 空格平移画布";
  view.style.cursor = [
    "brush",
    "eraser",
    "select",
    "gradient",
    "rect",
    "ellipse",
  ].includes(tool)
    ? "crosshair"
    : tool === "hand"
      ? "grab"
      : tool === "text"
        ? "text"
        : "default";
  drawOverlay();
}
function fit() {
  if (!editor.doc) return;
  zoom = Math.min(
    (view.clientWidth - 100) / editor.doc.width,
    (view.clientHeight - 100) / editor.doc.height,
    1,
  );
  zoom = Math.max(0.03, zoom);
  center();
}
function center() {
  pan = {
    x: (view.clientWidth - editor.doc.width * zoom) / 2,
    y: (view.clientHeight - editor.doc.height * zoom) / 2,
  };
  updateView();
}
function setZoom(
  value,
  anchor = { x: view.clientWidth / 2, y: view.clientHeight / 2 },
) {
  if (!editor.doc) return;
  const next = Math.max(0.03, Math.min(8, value));
  pan.x = anchor.x - ((anchor.x - pan.x) * next) / zoom;
  pan.y = anchor.y - ((anchor.y - pan.y) * next) / zoom;
  zoom = next;
  updateView();
}
function updateView() {
  if (editor.doc) {
    stage.style.width = editor.doc.width + "px";
    stage.style.height = editor.doc.height + "px";
    stage.style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    $("#zoom-label").textContent = Math.round(zoom * 100) + "%";
    $("#status-zoom").textContent = Math.round(zoom * 100) + "%";
    $("#zoom-range").value = Math.round(zoom * 100);
    $("#document-tab").innerHTML =
      `<span class="dot">${editor.dirty ? "●" : ""}</span>${esc(editor.doc.name)} @ ${Math.round(zoom * 100)}% (RGB/8)`;
  }
  drawOverlay();
  drawRuler();
}
function drawRuler() {
  const c = $("#ruler");
  c.width = c.clientWidth;
  c.height = 20;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, 20);
  ctx.strokeStyle = "#909090";
  ctx.fillStyle = "#b0b0b0";
  ctx.font = "9px Segoe UI";
  if (!editor.doc) return;
  const step = zoom > 0.8 ? 100 : zoom > 0.3 ? 200 : 500;
  for (let x = 0; x <= editor.doc.width; x += step / 5) {
    const sx = pan.x + x * zoom;
    if (sx < 0 || sx > c.width) continue;
    ctx.beginPath();
    ctx.moveTo(sx, 20);
    ctx.lineTo(sx, x % step === 0 ? 9 : 15);
    ctx.stroke();
    if (x % step === 0) ctx.fillText(x, sx + 3, 9);
  }
}
function screen(p) {
  return { x: p.x * zoom + pan.x, y: p.y * zoom + pan.y };
}
function point(event) {
  const r = view.getBoundingClientRect();
  return {
    x: (event.clientX - r.left - pan.x) / zoom,
    y: (event.clientY - r.top - pan.y) / zoom,
  };
}
function screenEvent(e) {
  const r = view.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function bounds(l) {
  return [
    { x: 0, y: 0 },
    { x: l.canvas.width, y: 0 },
    { x: l.canvas.width, y: l.canvas.height },
    { x: 0, y: l.canvas.height },
  ].map((p) => screen(worldPoint(l, p)));
}
function drawOverlay(preview = null) {
  overlay.width = view.clientWidth;
  overlay.height = view.clientHeight;
  const ctx = overlay.getContext("2d");
  if (!editor.doc) return;
  const l = editor.active;
  if (transform && l) {
    const p = bounds(l);
    ctx.strokeStyle = "#70b7ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    p.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();
    p.forEach((p) => {
      ctx.fillStyle = "#eee";
      ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      ctx.strokeRect(p.x - 3, p.y - 3, 6, 6);
    });
  }
  const r = preview || editor.selection;
  if (r) {
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      pan.x + r.x * zoom,
      pan.y + r.y * zoom,
      r.w * zoom,
      r.h * zoom,
    );
    ctx.strokeStyle = "#000";
    ctx.lineDashOffset = 5;
    ctx.strokeRect(
      pan.x + r.x * zoom,
      pan.y + r.y * zoom,
      r.w * zoom,
      r.h * zoom,
    );
    ctx.restore();
  }
}
function renderPixels() {
  if (!editor.doc) return;
  const c = composite(editor.doc);
  if (display.width !== c.width || display.height !== c.height) {
    display.width = c.width;
    display.height = c.height;
  }
  const ctx = display.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(c, 0, 0);
  const nav = $("#navigator"),
    n = nav.getContext("2d");
  n.clearRect(0, 0, nav.width, nav.height);
  const s = Math.min(nav.width / c.width, nav.height / c.height);
  n.drawImage(
    c,
    (nav.width - c.width * s) / 2,
    (nav.height - c.height * s) / 2,
    c.width * s,
    c.height * s,
  );
  drawOverlay();
}
function sync() {
  const doc = editor.doc;
  window.desktop?.dirty(editor.dirty);
  revision++;
  $(".welcome").classList.toggle("hidden", !!doc);
  stage.classList.toggle("hidden", !doc);
  if (!doc) return;
  $("#document-tab").innerHTML =
    `<span class="dot">${editor.dirty ? "●" : ""}</span>${esc(doc.name)} @ ${Math.round(zoom * 100)}% (RGB/8)`;
  $("#dimensions").textContent =
    `${doc.width} × ${doc.height} px · ${doc.dpi} ppi`;
  $("#layer-count").textContent = doc.layers.length + " 层";
  const l = editor.active;
  $("#blend").value = l.blend;
  $("#layer-opacity").value = Math.round(l.opacity * 100);
  $("#layer-kind").textContent =
    l.target === "mask" ? "蒙版绘画" : l.text ? "文字图层" : "像素图层";
  for (const [k, v] of Object.entries({
    x: l.x,
    y: l.y,
    w: Math.abs(l.canvas.width * l.scaleX),
    h: Math.abs(l.canvas.height * l.scaleY),
    rotation: l.rotation,
    dpi: doc.dpi,
  }))
    $("#prop-" + k).value = Math.round(v * 100) / 100;
  $(".layer-list").innerHTML = doc.layers
    .slice()
    .reverse()
    .map(
      (l) =>
        `<div class="layer-row ${l.id === doc.active ? "selected" : ""}" data-layer="${l.id}" tabindex="0" role="button" aria-label="图层 ${esc(l.name)}"><button class="eye" data-visible="${l.id}" title="${l.visible ? "隐藏" : "显示"}图层">${i(l.visible ? "Eye" : "EyeOff")}</button><img src="${l.canvas.toDataURL()}" class="${l.target !== "mask" ? "target" : ""}" data-target="pixels" alt="像素缩略图">${l.mask ? `<img class="mask ${l.target === "mask" ? "target" : ""}" src="${l.mask.toDataURL()}" data-target="mask" alt="蒙版缩略图">` : ""}<span class="name">${esc(l.name)}</span>${l.locked ? i("Lock") : ""}</div>`,
    )
    .join("");
  $(".history-list").innerHTML = editor.history
    .map(
      (h, index) =>
        `<button data-history="${index}" class="${index === editor.index ? "current" : index > editor.index ? "future" : ""}">${i("History")}${esc(h.label)}</button>`,
    )
    .join("");
  icons();
  renderPixels();
  updateView();
}
editor.onchange = sync;
function clipSelection(ctx, l) {
  if (!editor.selection) return;
  const r = editor.selection,
    pts = [
      { x: r.x, y: r.y },
      { x: r.x + r.w, y: r.y },
      { x: r.x + r.w, y: r.y + r.h },
      { x: r.x, y: r.y + r.h },
    ].map((p) => localPoint(l, p));
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.clip();
}
function norm(a, b, shift = false) {
  let dx = b.x - a.x,
    dy = b.y - a.y;
  if (shift) {
    const size = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * size;
    dy = Math.sign(dy || 1) * size;
  }
  return {
    x: Math.min(a.x, a.x + dx),
    y: Math.min(a.y, a.y + dy),
    w: Math.abs(dx),
    h: Math.abs(dy),
  };
}
function brushValues() {
  return {
    size: Math.max(1, Math.min(1000, +$("#brush-size").value || 1)),
    opacity: Math.max(
      0.01,
      Math.min(1, +$("#brush-opacity").value / 100 || 0.01),
    ),
    hardness: +$("#hardness").value / 100,
  };
}
function brushStamp(ctx, p) {
  const { size, hardness } = brushValues(),
    r = size / 2;
  ctx.fillStyle = $("#fg").value;
  if (hardness < 1) {
    const g = ctx.createRadialGradient(p.x, p.y, r * hardness, p.x, p.y, r);
    g.addColorStop(0, $("#fg").value);
    g.addColorStop(1, $("#fg").value + "00");
    ctx.fillStyle = g;
  }
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
}
function strokeTo(g, p) {
  const current = localPoint(g.l, p),
    previous = g.last;
  const dist = Math.hypot(current.x - previous.x, current.y - previous.y),
    step = Math.max(1, brushValues().size * 0.08),
    n = Math.max(1, Math.ceil(dist / step));
  for (let j = 1; j <= n; j++)
    brushStamp(g.stroke.getContext("2d"), {
      x: previous.x + ((current.x - previous.x) * j) / n,
      y: previous.y + ((current.y - previous.y) * j) / n,
    });
  g.last = current;
  const ctx = g.target.getContext("2d");
  ctx.clearRect(0, 0, g.target.width, g.target.height);
  ctx.drawImage(g.base, 0, 0);
  ctx.save();
  clipSelection(ctx, g.l);
  ctx.globalAlpha = brushValues().opacity;
  ctx.globalCompositeOperation = g.erase ? "destination-out" : "source-over";
  ctx.drawImage(g.stroke, 0, 0);
  ctx.restore();
  renderPixels();
}
function clearSelection(fill = false) {
  const l = editable(),
    ctx = (l.target === "mask" && l.mask ? l.mask : l.canvas).getContext("2d");
  if (!editor.selection && !fill) throw Error("先选择需要清除的区域");
  ctx.save();
  clipSelection(ctx, l);
  if (fill) {
    ctx.fillStyle = $("#fg").value;
    ctx.fillRect(0, 0, l.canvas.width, l.canvas.height);
  } else ctx.clearRect(0, 0, l.canvas.width, l.canvas.height);
  ctx.restore();
  l.text = null;
  editor.commit(fill ? "填充前景色" : "清除选区");
}
function flood(p) {
  const l = editable();
  if (l.target === "mask") throw Error("蒙版请用画笔或橡皮擦编辑");
  const loc = localPoint(l, p),
    x = Math.floor(loc.x),
    y = Math.floor(loc.y),
    w = l.canvas.width,
    h = l.canvas.height;
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const ctx = l.canvas.getContext("2d"),
    image = ctx.getImageData(0, 0, w, h),
    data = image.data,
    start = (y * w + x) * 4,
    color = Array.from(data.slice(start, start + 4)),
    hex = $("#fg").value,
    fill = [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
      Math.round(brushValues().opacity * 255),
    ],
    tol = Math.max(0, Math.min(255, +$("#tolerance").value || 0));
  const seen = new Uint8Array(w * h),
    queue = new Int32Array(w * h);
  let head = 0,
    tail = 1;
  queue[0] = y * w + x;
  seen[y * w + x] = 1;
  while (head < tail) {
    const index = queue[head++],
      xx = index % w,
      yy = Math.floor(index / w),
      off = index * 4;
    if (color.some((v, k) => Math.abs(v - data[off + k]) > tol)) continue;
    if (editor.selection) {
      const q = worldPoint(l, { x: xx, y: yy }),
        r = editor.selection;
      if (q.x < r.x || q.x > r.x + r.w || q.y < r.y || q.y > r.y + r.h)
        continue;
    }
    data.set(fill, off);
    for (const n of [
      xx > 0 ? index - 1 : -1,
      xx < w - 1 ? index + 1 : -1,
      yy > 0 ? index - w : -1,
      yy < h - 1 ? index + w : -1,
    ])
      if (n >= 0 && !seen[n]) {
        seen[n] = 1;
        queue[tail++] = n;
      }
  }
  ctx.putImageData(image, 0, 0);
  l.text = null;
  editor.commit("油漆桶填充");
}
async function textDialog(existing = null, origin = { x: 100, y: 100 }) {
  const t = existing?.text || {
    content: "在这里输入文字",
    font: "Microsoft YaHei",
    size: 48,
    color: $("#fg").value,
    bold: false,
  };
  const values = await dialog(
    existing ? "编辑文字" : "添加文字",
    `<textarea name="content" aria-label="文字内容">${esc(t.content)}</textarea>${field("字体", "font", t.font, "text")}${field("字号 px", "size", t.size, "number", 'min="1" max="1000"')}${field("颜色", "color", t.color, "color")}<label>粗体<input type="checkbox" name="bold" ${t.bold ? "checked" : ""}></label>`,
  );
  if (!values) return;
  const config = { ...values, size: +values.size, bold: values.bold === "on" };
  if (!config.content.trim()) throw Error("文字不能为空");
  if (!Number.isFinite(config.size) || config.size < 1 || config.size > 1000)
    throw Error("字号范围 1–1000 px");
  const measure = canvas(1, 1).getContext("2d");
  measure.font = `${config.bold ? "bold " : ""}${config.size}px "${config.font.replace(/["\\]/g, "")}"`;
  const lines = config.content.split("\n"),
    w =
      Math.ceil(
        Math.max(...lines.map((line) => measure.measureText(line).width)),
      ) + 12,
    h = Math.ceil(lines.length * config.size * 1.4) + 12;
  checkSize(w, h);
  if (existing) {
    const total = editor.doc.layers.reduce(
      (sum, item) =>
        sum +
        (item === existing ? w * h : item.canvas.width * item.canvas.height),
      0,
    );
    if (total > 80000000) throw Error("文字编辑后超过图层像素限制");
  }
  const l = existing || layer("文字 · " + lines[0].slice(0, 18), w, h);
  const c = canvas(w, h),
    ctx = c.getContext("2d");
  ctx.font = measure.font;
  ctx.fillStyle = config.color;
  ctx.textBaseline = "top";
  lines.forEach((line, index) =>
    ctx.fillText(line, 6, 6 + index * config.size * 1.4),
  );
  l.canvas = c;
  l.text = config;
  if (l.mask) l.mask = null;
  if (existing) {
    editor.commit("编辑文字");
  } else {
    l.x = origin.x;
    l.y = origin.y;
    editor.add(l, "添加文字");
  }
  setTool("move");
}
async function openFiles(files, place = false) {
  for (const [index, f] of files.entries()) {
    const ext = f.name.split(".").at(-1).toLowerCase();
    if (ext === "cwin" || ext === "psd") {
      if (!(await discard())) return;
      if (ext === "cwin") await editor.openProject(f.bytes);
      else await editor.importPsd(f.bytes, f.name);
      fit();
    } else {
      const replace = !place && index === 0;
      if (replace && !(await discard())) return;
      await editor.importImage(f.bytes, f.name, replace);
      if (replace || (index === 0 && !place)) fit();
    }
    notify("已打开 " + f.name);
  }
}
async function chooseFiles(place = false) {
  if (window.desktop) {
    const files = await window.desktop.open();
    if (files) await openFiles(files, place);
  } else {
    const input = $("#file-input");
    input.dataset.place = place ? "1" : "0";
    input.value = "";
    input.click();
  }
}
async function saveBytes(bytes, name, type) {
  if (window.desktop) return window.desktop.save(bytes, name, type);
  const blob = new Blob([bytes]),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return name;
}
async function exportImage(type) {
  requireDoc();
  const values = await dialog(
    "导出 " + type.toUpperCase(),
    `<p class="description">导出当前画布的可见合成。PNG 保留透明；JPEG 使用白色底。图片将写入文档 DPI 元数据。</p>${type === "jpg" ? field("质量 %", "quality", 92, "number", 'min="1" max="100"') : ""}`,
    "导出",
  );
  if (!values) return;
  const c = composite(editor.doc, type === "jpg" ? "#fff" : null),
    blob = await new Promise((resolve) =>
      c.toBlob(
        resolve,
        type === "jpg" ? "image/jpeg" : "image/png",
        (+values.quality || 92) / 100,
      ),
    );
  const bytes = withDpi(
    new Uint8Array(await blob.arrayBuffer()),
    type,
    editor.doc.dpi,
  );
  const path = await saveBytes(bytes, editor.doc.name + "." + type, type);
  if (path) notify("已导出 " + path);
}
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let n = 0; n < 8; n++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
export function withDpi(bytes, type, dpi) {
  if (type === "jpg") {
    const out = bytes.slice();
    for (let i = 2; i < Math.min(out.length - 16, 128); i++)
      if (
        out[i] === 0xff &&
        out[i + 1] === 0xe0 &&
        String.fromCharCode(...out.slice(i + 4, i + 9)) === "JFIF\0"
      ) {
        out[i + 11] = 1;
        const d = Math.min(65535, Math.round(dpi));
        out[i + 12] = d >> 8;
        out[i + 13] = d & 255;
        out[i + 14] = d >> 8;
        out[i + 15] = d & 255;
        return out;
      }
    throw Error("JPEG 编码器未提供 JFIF 分辨率字段");
  }
  const chunk = new Uint8Array(21),
    v = new DataView(chunk.buffer);
  v.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4);
  v.setUint32(8, Math.round(dpi / 0.0254));
  v.setUint32(12, Math.round(dpi / 0.0254));
  chunk[16] = 1;
  v.setUint32(17, crc32(chunk.slice(4, 17)));
  let cursor = 8,
    parts = [bytes.slice(0, 8)],
    inserted = false;
  while (cursor < bytes.length) {
    const n = new DataView(
        bytes.buffer,
        bytes.byteOffset + cursor,
        4,
      ).getUint32(0),
      tag = String.fromCharCode(...bytes.slice(cursor + 4, cursor + 8));
    if (tag !== "pHYs") parts.push(bytes.slice(cursor, cursor + n + 12));
    if (tag === "IHDR" && !inserted) {
      parts.push(chunk);
      inserted = true;
    }
    cursor += n + 12;
  }
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}
async function action(name) {
  if (gesture) finishGesture();
  switch (name) {
    case "new": {
      if (!(await discard())) return;
      const v = await dialog(
        "新建文档",
        `${field("名称", "name", "未标题-1", "text")}${field("宽度 px", "w", 1600, "number", 'min="1" max="8192"')}${field("高度 px", "h", 1000, "number", 'min="1" max="8192"')}${field("分辨率 ppi", "dpi", 300, "number", 'min="1" max="9600"')}<label>背景<select name="background"><option value="transparent">透明</option><option value="white">白色</option></select></label><p class="description">8 位 RGB / sRGB · 单文档工作区</p>`,
        "创建",
      );
      if (v) {
        editor.newDocument(
          +v.w,
          +v.h,
          +v.dpi,
          v.name,
          v.background === "white",
        );
        fit();
      }
      break;
    }
    case "open":
      await chooseFiles();
      break;
    case "place":
      await chooseFiles(true);
      break;
    case "open-comp": {
      if (!window.desktop)
        throw Error("请在 Windows 桌面版中导入 .comp 文件夹");
      const input = await window.desktop.openComp();
      if (input && (await discard())) {
        await editor.importComp(input);
        fit();
        notify("已导入原版基础图层项目；请另存为 .cwin");
      }
      break;
    }
    case "save": {
      requireDoc();
      const path = await saveBytes(
        await editor.saveProject(),
        editor.doc.name + ".cwin",
        "cwin",
      );
      if (path) {
        editor.markSaved();
        notify("项目已保存：" + path);
      }
      break;
    }
    case "export-png":
      await exportImage("png");
      break;
    case "export-jpg":
      await exportImage("jpg");
      break;
    case "export-psd": {
      requireDoc();
      const v = await dialog(
        "导出栅格图层 PSD",
        '<p class="description">保留图层名称、顺序、可见性、不透明度和支持的混合模式。文字、变换和蒙版会烘焙为每层像素；请同时保存 .cwin 项目以继续编辑。尚未在 Photoshop 实机核验。</p>',
        "导出",
      );
      if (v) {
        const path = await saveBytes(
          await editor.exportPsd(),
          editor.doc.name + ".psd",
          "psd",
        );
        if (path) notify("已导出栅格 PSD：" + path);
      }
      break;
    }
    case "recovery": {
      const bytes = await window.desktop?.recover();
      if (!bytes) throw Error("没有自动备份");
      if (await discard()) {
        await editor.openProject(bytes);
        editor.dirty = true;
        editor.notify();
        fit();
        notify("已恢复最近自动备份，请另存项目");
      }
      break;
    }
    case "undo":
      requireDoc();
      await editor.undo();
      break;
    case "redo":
      requireDoc();
      await editor.redo();
      break;
    case "add":
      requireDoc();
      editor.add(
        layer(
          "图层 " + (editor.doc.layers.length + 1),
          editor.doc.width,
          editor.doc.height,
        ),
      );
      break;
    case "duplicate":
      requireDoc();
      editor.duplicate();
      break;
    case "delete-layer":
      editable();
      editor.remove();
      break;
    case "rename": {
      const l = requireDoc(),
        v = await dialog("重命名图层", field("名称", "name", l.name, "text"));
      if (v) {
        l.name = v.name || "图层";
        editor.commit("重命名图层");
      }
      break;
    }
    case "merge":
      requireDoc();
      editor.merge();
      break;
    case "mask":
      requireDoc();
      editor.mask();
      setTool("brush");
      notify(
        editor.active.target === "mask"
          ? "蒙版模式：画笔隐藏，橡皮擦恢复"
          : "已切回像素绘画",
      );
      break;
    case "remove-mask": {
      const l = editable();
      if (!l.mask) throw Error("当前图层没有蒙版");
      if (
        await dialog(
          "移除蒙版",
          '<p class="description">恢复蒙版隐藏的全部像素。此操作可以撤销。</p>',
          "移除",
        )
      ) {
        l.mask = null;
        l.target = "pixels";
        editor.commit("移除蒙版");
      }
      break;
    }
    case "lock": {
      const l = requireDoc();
      l.locked = !l.locked;
      editor.commit(l.locked ? "锁定图层" : "解锁图层");
      break;
    }
    case "up":
      editable();
      editor.moveLayer(1);
      break;
    case "down":
      editable();
      editor.moveLayer(-1);
      break;
    case "flip-x": {
      const l = editable();
      const p = worldPoint(l, { x: l.canvas.width, y: 0 });
      l.x = p.x;
      l.y = p.y;
      l.scaleX *= -1;
      editor.commit("水平翻转");
      break;
    }
    case "flip-y": {
      const l = editable();
      const p = worldPoint(l, { x: 0, y: l.canvas.height });
      l.x = p.x;
      l.y = p.y;
      l.scaleY *= -1;
      editor.commit("垂直翻转");
      break;
    }
    case "transform":
      requireDoc();
      setTool("move");
      transform = true;
      drawOverlay();
      notify("拖动移动，拖右下角缩放；右侧输入精确尺寸和角度");
      break;
    case "select-all":
      requireDoc();
      editor.selection = {
        x: 0,
        y: 0,
        w: editor.doc.width,
        h: editor.doc.height,
      };
      drawOverlay();
      break;
    case "deselect":
      editor.selection = null;
      drawOverlay();
      break;
    case "clear":
      clearSelection();
      break;
    case "fill-selection":
      clearSelection(true);
      break;
    case "copy-selection": {
      const l = requireDoc();
      if (!editor.selection) {
        editor.duplicate();
        break;
      }
      const r = editor.selection,
        w = Math.round(r.w),
        h = Math.round(r.h);
      if (w < 1 || h < 1) throw Error("选区太小");
      const c = canvas(editor.doc.width, editor.doc.height);
      drawLayer(c.getContext("2d"), { ...l, visible: true }, false);
      const copy = layer(l.name + " 选区", w, h);
      copy.canvas.getContext("2d").drawImage(c, r.x, r.y, r.w, r.h, 0, 0, w, h);
      copy.x = r.x;
      copy.y = r.y;
      editor.add(copy, "复制选区");
      break;
    }
    case "crop":
      requireDoc();
      if (!editor.selection) throw Error("先用矩形选框选择裁切范围");
      if (
        await dialog(
          "裁切画布",
          '<p class="description">按当前矩形选区裁切所有图层。文字、变换与蒙版将烘焙为像素；可撤销，请先保存项目。</p>',
          "裁切",
        )
      ) {
        editor.crop();
        fit();
      }
      break;
    case "size": {
      requireDoc();
      const v = await dialog(
        "画布尺寸",
        `${field("宽度 px", "w", editor.doc.width, "number", 'min="1" max="8192"')}${field("高度 px", "h", editor.doc.height, "number", 'min="1" max="8192"')}${field("分辨率 ppi", "dpi", editor.doc.dpi, "number", 'min="1" max="9600"')}<p class="description">从左上角扩展 / 收缩画布；图层像素尺寸保持原值。分辨率只改变输出元数据。</p>`,
      );
      if (v) {
        checkSize(+v.w, +v.h);
        if (+v.dpi < 1 || +v.dpi > 9600) throw Error("分辨率无效");
        Object.assign(editor.doc, { width: +v.w, height: +v.h, dpi: +v.dpi });
        editor.selection = null;
        editor.commit("画布尺寸");
        fit();
      }
      break;
    }
    case "brightness":
    case "contrast":
    case "saturate":
    case "blur": {
      editable();
      const labels = {
          brightness: "亮度",
          contrast: "对比度",
          saturate: "饱和度",
          blur: "高斯模糊",
        },
        max = name === "blur" ? 100 : 300,
        v = await dialog(
          labels[name],
          `${field(name === "blur" ? "半径 px" : "强度 %", "value", name === "blur" ? 4 : 100, "number", `min="0" max="${max}"`)}<p class="description">应用于当前像素图层；有选区时仅处理选区。可撤销。</p>`,
          "应用",
        );
      if (v) editor.applyFilter(name, Math.max(0, Math.min(max, +v.value)));
      break;
    }
    case "grayscale":
    case "invert":
      editable();
      editor.applyFilter(name);
      break;
    case "fit":
      fit();
      break;
    case "actual":
      setZoom(1);
      break;
    case "zoom-in":
      setZoom(zoom * 1.25);
      break;
    case "zoom-out":
      setZoom(zoom / 1.25);
      break;
    case "fullscreen":
      document.body.classList.toggle("fullscreen");
      setTimeout(() => updateView(), 0);
      break;
    case "swap": {
      const old = $("#fg").value;
      $("#fg").value = $("#bg").value;
      $("#bg").value = old;
      break;
    }
    case "edit-text": {
      const l = editable();
      if (!l.text) throw Error("请选中文字图层");
      await textDialog(l);
      break;
    }
    case "help":
      await dialog(
        "Compositor Windows 中文版 0.1",
        `<p class="description">参考 robbietilton/Compositor，保留 MIT 授权。Windows 编辑核心为独立实现。<br><br>V 移动 / M 矩形选框 / B 画笔 / E 橡皮 / G 填充 / Shift+G 渐变 / U 矩形 / Shift+U 椭圆 / T 文字 / I 吸管 / H 抓手 / Z 缩放。<br><br>空格拖动平移；滚轮缩放；[ ] 调画笔大小；X 交换颜色；Ctrl+Z 撤销；Ctrl+Shift+Z 重做；Ctrl+J 复制；Ctrl+S 保存；F 专注模式。<br><br>当前为基础编辑版本：单文档、RGB 8 位。尚无 CMYK、智能对象、路径、Camera Raw、专业色彩管理及原生 PSD 高级结构兼容。</p>`,
        "知道了",
      );
      break;
    case "demo": {
      if (!(await discard())) return;
      editor.newDocument(1400, 900, 300, "光与形 · 示例", false);
      const bg = editor.active,
        c = bg.canvas.getContext("2d"),
        g = c.createLinearGradient(0, 0, 1400, 900);
      g.addColorStop(0, "#101d2b");
      g.addColorStop(1, "#354b54");
      c.fillStyle = g;
      c.fillRect(0, 0, 1400, 900);
      bg.name = "背景 · 深蓝";
      const sphere = layer("球体 · 渐变", 500, 500),
        s = sphere.canvas.getContext("2d"),
        rad = s.createRadialGradient(155, 135, 15, 240, 260, 250);
      rad.addColorStop(0, "#f9e8c2");
      rad.addColorStop(0.45, "#c9a67b");
      rad.addColorStop(1, "#493a35");
      s.fillStyle = rad;
      s.beginPath();
      s.arc(250, 250, 240, 0, Math.PI * 2);
      s.fill();
      sphere.x = 720;
      sphere.y = 180;
      editor.add(sphere, "添加球体");
      const t = layer("文字 · LIGHT & FORM", 620, 240),
        tc = t.canvas.getContext("2d");
      tc.fillStyle = "#e9eadc";
      tc.font = "500 66px Segoe UI";
      tc.fillText("LIGHT", 12, 80);
      tc.fillText("& FORM", 12, 160);
      tc.font = "22px Microsoft YaHei";
      tc.fillStyle = "#b6c4bd";
      tc.fillText("光与形 / 本地创作练习", 16, 216);
      t.x = 110;
      t.y = 300;
      editor.add(t, "添加标题");
      editor.commit("打开示例");
      fit();
      setTool("move");
      break;
    }
  }
}
document.addEventListener("click", (event) => {
  const menuButton = event.target.closest(".menu>button");
  if (menuButton) {
    const parent = menuButton.parentElement,
      open = parent.classList.contains("open");
    document
      .querySelectorAll(".menu")
      .forEach((m) => m.classList.remove("open"));
    parent.classList.toggle("open", !open);
    return;
  }
  document.querySelectorAll(".menu").forEach((m) => m.classList.remove("open"));
  const button = event.target.closest("[data-action]");
  if (button) run(() => action(button.dataset.action));
  const toolButton = event.target.closest("[data-tool]");
  if (toolButton) setTool(toolButton.dataset.tool);
  const tab = event.target.closest("[data-panel]");
  if (tab) {
    panel = tab.dataset.panel;
    document
      .querySelectorAll("[data-panel]")
      .forEach((t) => t.classList.toggle("active", t === tab));
    $(".layer-list").style.display = panel === "layers" ? "block" : "none";
    $(".history-list").style.display = panel === "history" ? "block" : "none";
  }
  const row = event.target.closest("[data-layer]");
  if (row)
    run(() => {
      if (gesture) return;
      editor.doc.active = row.dataset.layer;
      const l = editor.active;
      if (event.target.closest("[data-visible]")) {
        l.visible = !l.visible;
        editor.commit("切换图层可见性");
      } else {
        const target = event.target.closest("[data-target]");
        if (target) l.target = target.dataset.target;
        sync();
      }
    });
  const history = event.target.closest("[data-history]");
  if (history) run(() => editor.goto(+history.dataset.history));
});
document.addEventListener("dblclick", (event) => {
  if (event.target.closest(".layer-row .name")) run(() => action("rename"));
});
$(".layer-list").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.target.closest("[data-layer]")?.click();
  }
});
$("#blend").onchange = () =>
  run(() => {
    editable().blend = $("#blend").value;
    editor.commit("混合模式");
  });
$("#layer-opacity").onchange = () =>
  run(() => {
    editable().opacity =
      Math.max(0, Math.min(100, +$("#layer-opacity").value)) / 100;
    editor.commit("图层不透明度");
  });
for (const key of ["x", "y", "w", "h", "rotation", "dpi"])
  $("#prop-" + key).onchange = () =>
    run(() => {
      const l = editable(),
        v = +$("#prop-" + key).value;
      if (!Number.isFinite(v)) throw Error("输入需为有效数值");
      if (key === "w" || key === "h") {
        if (v < 1 || v > 100000) throw Error("尺寸范围 1–100000 px");
        const prop = key === "w" ? "scaleX" : "scaleY";
        l[prop] =
          (Math.sign(l[prop]) * v) /
          (key === "w" ? l.canvas.width : l.canvas.height);
      } else if (key === "dpi") {
        if (v < 1 || v > 9600) throw Error("分辨率范围 1–9600");
        editor.doc.dpi = v;
      } else l[key] = v;
      editor.commit("变换属性");
    });
$("#zoom-range").oninput = () => setZoom(+$("#zoom-range").value / 100);
$("#file-input").onchange = () =>
  run(async () =>
    openFiles(
      await Promise.all(
        [...$("#file-input").files].map(async (f) => ({
          name: f.name,
          bytes: new Uint8Array(await f.arrayBuffer()),
        })),
      ),
      $("#file-input").dataset.place === "1",
    ),
  );
view.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    setZoom(zoom * Math.exp(-e.deltaY * 0.0015), screenEvent(e));
  },
  { passive: false },
);
view.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!$(".drop-hint")) {
    const el = document.createElement("div");
    el.className = "drop-hint";
    el.textContent = "释放以置入图片 / 打开项目";
    view.append(el);
  }
});
view.addEventListener("dragleave", (e) => {
  if (!view.contains(e.relatedTarget)) $(".drop-hint")?.remove();
});
view.addEventListener("drop", (e) => {
  e.preventDefault();
  $(".drop-hint")?.remove();
  const files = [...e.dataTransfer.files];
  run(async () =>
    openFiles(
      await Promise.all(
        files.map(async (f) => {
          if (f.size > 512 * 1024 * 1024) throw Error("文件超过 512 MB");
          return { name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) };
        }),
      ),
      !!editor.doc,
    ),
  );
});
view.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || working || editor.busy || modalOpen || !editor.doc)
    return;
  view.focus();
  const p = point(e);
  if (space || tool === "hand") {
    gesture = { kind: "pan", start: screenEvent(e), pan: { ...pan } };
    view.setPointerCapture(e.pointerId);
    return;
  }
  run(async () => {
    const l = requireDoc();
    if (tool === "zoom") {
      setZoom(zoom * (e.altKey ? 0.8 : 1.25), screenEvent(e));
      return;
    }
    if (tool === "eyedropper") {
      const x = Math.floor(p.x),
        y = Math.floor(p.y);
      if (x < 0 || y < 0 || x >= display.width || y >= display.height) return;
      const d = display.getContext("2d").getImageData(x, y, 1, 1).data;
      $("#fg").value =
        "#" +
        [...d.slice(0, 3)].map((v) => v.toString(16).padStart(2, "0")).join("");
      notify("已拾取前景色");
      return;
    }
    if (tool === "text") {
      await textDialog(null, p);
      return;
    }
    if (tool === "fill") {
      flood(p);
      return;
    }
    if (tool === "move") {
      editable();
      const handle = bounds(l)[2],
        s = screenEvent(e),
        kind =
          Math.hypot(s.x - handle.x, s.y - handle.y) < 12 ? "resize" : "move";
      gesture = {
        kind,
        l,
        start: p,
        origin: { x: l.x, y: l.y, scaleX: l.scaleX, scaleY: l.scaleY },
        changed: false,
      };
    } else if (tool === "brush" || tool === "eraser") {
      editable();
      if (l.text) {
        l.text = null;
        notify("文字已栅格化，可撤销恢复");
      }
      const target = l.target === "mask" && l.mask ? l.mask : l.canvas,
        base = canvas(target.width, target.height),
        stroke = canvas(target.width, target.height);
      base.getContext("2d").drawImage(target, 0, 0);
      gesture = {
        kind: "paint",
        l,
        target,
        base,
        stroke,
        last: localPoint(l, p),
        erase: l.target === "mask" ? tool === "brush" : tool === "eraser",
      };
      strokeTo(gesture, p);
    } else gesture = { kind: tool, start: p, end: p, shift: e.shiftKey };
    view.setPointerCapture(e.pointerId);
  });
});
view.addEventListener("pointermove", (e) => {
  if (!gesture) return;
  const g = gesture,
    p = point(e);
  if (g.kind === "pan") {
    const s = screenEvent(e);
    pan.x = g.pan.x + s.x - g.start.x;
    pan.y = g.pan.y + s.y - g.start.y;
    updateView();
  } else if (g.kind === "move") {
    let dx = p.x - g.start.x,
      dy = p.y - g.start.y;
    if (e.shiftKey) {
      if (Math.abs(dx) > Math.abs(dy)) dy = 0;
      else dx = 0;
    }
    g.l.x = g.origin.x + dx;
    g.l.y = g.origin.y + dy;
    g.changed = true;
    renderPixels();
  } else if (g.kind === "resize") {
    const lp = localPoint({ ...g.l, ...g.origin }, p);
    let sx = (lp.x / g.l.canvas.width) * g.origin.scaleX,
      sy = (lp.y / g.l.canvas.height) * g.origin.scaleY;
    if (e.shiftKey) sy = g.origin.scaleY * (sx / g.origin.scaleX);
    g.l.scaleX =
      Math.sign(g.origin.scaleX) *
      Math.max(0.001, Math.min(1000, Math.abs(sx)));
    g.l.scaleY =
      Math.sign(g.origin.scaleY) *
      Math.max(0.001, Math.min(1000, Math.abs(sy)));
    g.changed = true;
    renderPixels();
  } else if (g.kind === "paint") strokeTo(g, p);
  else {
    g.end = p;
    g.shift = e.shiftKey;
    drawOverlay(norm(g.start, p, e.shiftKey));
  }
});
function finishGesture() {
  const g = gesture;
  if (!g) return;
  gesture = null;
  if (g.kind === "move" || g.kind === "resize") {
    if (g.changed) editor.commit(g.kind === "move" ? "移动图层" : "缩放图层");
    return;
  }
  if (g.kind === "paint") {
    editor.commit(
      g.l.target === "mask" ? "绘画蒙版" : g.erase ? "橡皮擦" : "画笔",
    );
    return;
  }
  if (g.kind === "pan") return;
  const r = norm(g.start, g.end || g.start, g.shift);
  if (g.kind === "select") {
    editor.selection = r.w > 1 && r.h > 1 ? r : null;
    drawOverlay();
    return;
  }
  if (g.kind === "gradient") {
    const l = editable(),
      a = localPoint(l, g.start),
      b = localPoint(l, g.end || g.start);
    if (Math.hypot(a.x - b.x, a.y - b.y) < 1) return;
    const ctx = l.canvas.getContext("2d");
    ctx.save();
    clipSelection(ctx, l);
    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    grad.addColorStop(0, $("#fg").value);
    grad.addColorStop(1, $("#bg").value);
    ctx.globalAlpha = brushValues().opacity;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, l.canvas.width, l.canvas.height);
    ctx.restore();
    l.text = null;
    editor.commit("渐变填充");
    return;
  }
  if (["rect", "ellipse"].includes(g.kind) && r.w >= 1 && r.h >= 1) {
    const l = layer(
        g.kind === "rect" ? "矩形" : "椭圆",
        Math.ceil(r.w),
        Math.ceil(r.h),
      ),
      ctx = l.canvas.getContext("2d");
    ctx.fillStyle = $("#fg").value;
    if (g.kind === "rect") ctx.fillRect(0, 0, l.canvas.width, l.canvas.height);
    else {
      ctx.beginPath();
      ctx.ellipse(
        l.canvas.width / 2,
        l.canvas.height / 2,
        l.canvas.width / 2,
        l.canvas.height / 2,
        0,
        0,
        2 * Math.PI,
      );
      ctx.fill();
    }
    l.x = r.x;
    l.y = r.y;
    l.opacity = brushValues().opacity;
    editor.add(l, "绘制" + l.name);
  }
}
view.addEventListener("pointerup", () => run(() => finishGesture()));
view.addEventListener("pointercancel", () => run(() => finishGesture()));
window.addEventListener("blur", () => {
  space = false;
  if (gesture) run(() => finishGesture());
});
document.addEventListener("keydown", (e) => {
  if (modalOpen || e.target.matches("input,textarea,select")) return;
  if (e.key === "Escape") {
    document
      .querySelectorAll(".menu")
      .forEach((m) => m.classList.remove("open"));
    if (document.body.classList.contains("fullscreen")) {
      document.body.classList.remove("fullscreen");
      updateView();
    } else {
      editor.selection = null;
      drawOverlay();
    }
    return;
  }
  if (e.code === "Space") {
    e.preventDefault();
    space = true;
    view.style.cursor = "grab";
    return;
  }
  const ctrl = e.ctrlKey || e.metaKey,
    key = e.key.toLowerCase();
  if (ctrl) {
    const shortcuts = {
      n: "new",
      o: "open",
      s: e.shiftKey ? "export-png" : "save",
      z: e.shiftKey ? "redo" : "undo",
      y: "redo",
      j: "copy-selection",
      a: "select-all",
      d: "deselect",
      t: "transform",
      e: "merge",
      i: "invert",
      0: "fit",
      1: "actual",
      "=": "zoom-in",
      "+": "zoom-in",
      "-": "zoom-out",
    };
    let name = shortcuts[key];
    if (e.shiftKey && key === "n") name = "add";
    if (e.shiftKey && key === "u") name = "grayscale";
    if (name) {
      e.preventDefault();
      run(() => action(name));
    }
    return;
  }
  if (e.altKey && e.key === "Backspace") {
    e.preventDefault();
    run(() => action("fill-selection"));
    return;
  }
  if (key === "delete" || key === "backspace") {
    e.preventDefault();
    run(() => action("clear"));
    return;
  }
  if (key === "x") {
    run(() => action("swap"));
    return;
  }
  if (key === "f") {
    run(() => action("fullscreen"));
    return;
  }
  if (e.key === "[" || e.key === "]") {
    $("#brush-size").value = Math.max(
      1,
      Math.min(1000, +$("#brush-size").value + (e.key === "]" ? 5 : -5)),
    );
    return;
  }
  const t = tools.find(
    (t) => t[3].toLowerCase() === (e.shiftKey ? "shift+" : "") + key,
  );
  if (t) {
    e.preventDefault();
    setTool(t[0]);
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    e.preventDefault();
    run(() => {
      const l = editable(),
        step = e.shiftKey ? 10 : 1;
      l.x += e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
      l.y += e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
      editor.commit("微移图层");
    });
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    space = false;
    view.style.cursor = tool === "hand" ? "grab" : "default";
  }
});
new ResizeObserver(() => updateView()).observe(view);
setInterval(() => {
  if (
    !editor.doc ||
    !editor.dirty ||
    working ||
    gesture ||
    revision === recoveryRevision ||
    !window.desktop
  )
    return;
  const captured = revision;
  run(async () => {
    await window.desktop.autosave(await editor.saveProject());
    recoveryRevision = captured;
    $("#status").textContent =
      "已自动备份 · " + new Date().toLocaleTimeString("zh-CN");
  });
}, 60000);
window.desktop?.onClose(() =>
  run(async () => {
    if (gesture) finishGesture();
    const values = await dialog(
      "关闭软件",
      '<p class="description">当前文档尚未保存。选择保存并关闭，或先取消继续编辑。</p><label>操作<select name="mode"><option value="save">保存项目并关闭</option><option value="discard">放弃修改并关闭</option></select></label>',
      "继续",
    );
    if (!values) return;
    if (values.mode === "save") {
      const path = await saveBytes(
        await editor.saveProject(),
        editor.doc.name + ".cwin",
        "cwin",
      );
      if (!path) return;
    }
    window.desktop.closeReply(true);
  }),
);
window.addEventListener("beforeunload", (e) => {
  if (editor.dirty && !window.desktop) {
    e.preventDefault();
    e.returnValue = "";
  }
});
setTool("move");
// The development/test harness uses the same editor and actions as the desktop UI.
if (import.meta.env.DEV || new URLSearchParams(location.search).has("test"))
  window.compositor = {
    editor,
    action,
    setTool,
    fit,
    withDpi,
    saveBytes,
    openFiles,
  };
