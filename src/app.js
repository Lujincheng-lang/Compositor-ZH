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
  ArrowLeftRight,
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
  Check,
  X,
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
  cloneLayer,
  layerBounds,
  opaqueAt,
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
  ArrowLeftRight,
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
  Check,
  X,
  Image: ImageIcon,
};
// Order and shortcuts follow the Photoshop toolbar.
const tools = [
  ["move", "移动", "Move", "V"],
  ["select", "矩形选框", "SquareDashed", "M"],
  ["crop", "裁剪", "Crop", "C"],
  ["eyedropper", "吸管", "Pipette", "I"],
  ["brush", "画笔", "Paintbrush", "B"],
  ["eraser", "橡皮擦", "Eraser", "E"],
  ["gradient", "渐变", "Blend", "Shift+G"],
  ["fill", "油漆桶", "PaintBucket", "G"],
  ["text", "横排文字", "Type", "T"],
  ["rect", "矩形", "RectangleHorizontal", "U"],
  ["ellipse", "椭圆", "Circle", "Shift+U"],
  ["hand", "抓手", "Hand", "H"],
  ["zoom", "缩放", "ZoomIn", "Z"],
];
const toolGroups = [
  ["move", "select", "crop", "eyedropper"],
  ["brush", "eraser", "gradient", "fill"],
  ["text", "rect", "ellipse"],
  ["hand", "zoom"],
];
const menus = {
  文件: [
    ["new", "新建…", "Ctrl+N"],
    ["open", "打开…", "Ctrl+O"],
    ["place", "置入图片…", ""],
    ["open-comp", "导入原版 .comp 文件夹…", ""],
    null,
    ["save", "存储", "Ctrl+S"],
    ["save-as", "存储为…", "Shift+Ctrl+S"],
    null,
    ["export-png", "导出为 PNG…", "Alt+Shift+Ctrl+W"],
    ["export-jpg", "导出为 JPEG…", ""],
    ["export-psd", "导出栅格图层 PSD…", ""],
    null,
    ["recovery", "恢复自动备份…", ""],
  ],
  编辑: [
    ["undo", "还原", "Ctrl+Z"],
    ["redo", "重做", "Shift+Ctrl+Z"],
    null,
    ["copy-selection", "通过拷贝的图层", "Ctrl+J"],
    ["fill", "填充…", "Shift+F5"],
    ["fill-selection", "用前景色填充", "Alt+Backspace"],
    ["fill-background", "用背景色填充", "Ctrl+Backspace"],
    ["clear", "清除", "Delete"],
    null,
    ["transform", "自由变换", "Ctrl+T"],
    ["flip-x", "水平翻转", ""],
    ["flip-y", "垂直翻转", ""],
  ],
  图像: [
    ["brightness", "亮度…", ""],
    ["contrast", "对比度…", ""],
    ["saturate", "饱和度…", ""],
    ["grayscale", "去色", "Shift+Ctrl+U"],
    ["invert", "反相", "Ctrl+I"],
    null,
    ["image-size", "图像大小…", "Alt+Ctrl+I"],
    ["size", "画布大小…", "Alt+Ctrl+C"],
    ["crop", "裁剪（按选区）", ""],
  ],
  图层: [
    ["add", "新建图层", "Shift+Ctrl+N"],
    ["duplicate", "复制图层", ""],
    ["rename", "重命名图层…", ""],
    ["delete-layer", "删除图层", ""],
    null,
    ["mask", "添加 / 切换蒙版", ""],
    ["remove-mask", "移除蒙版…", ""],
    ["lock", "锁定 / 解锁图层", "Ctrl+/"],
    null,
    ["front", "置为顶层", "Shift+Ctrl+]"],
    ["up", "前移一层", "Ctrl+]"],
    ["down", "后移一层", "Ctrl+["],
    ["back", "置为底层", "Shift+Ctrl+["],
    null,
    ["merge", "向下合并", "Ctrl+E"],
  ],
  选择: [
    ["select-all", "全部", "Ctrl+A"],
    ["deselect", "取消选择", "Ctrl+D"],
    ["reselect", "重新选择", "Shift+Ctrl+D"],
    null,
    ["layer-selection", "载入图层选区", "Ctrl+单击缩略图"],
  ],
  滤镜: [["blur", "高斯模糊…", ""]],
  视图: [
    ["zoom-in", "放大", "Ctrl++"],
    ["zoom-out", "缩小", "Ctrl+-"],
    ["fit", "按屏幕大小缩放", "Ctrl+0"],
    ["actual", "100%", "Ctrl+1"],
    null,
    ["rulers", "标尺", "Ctrl+R"],
    ["panels", "显示 / 隐藏面板", "Tab"],
    ["fullscreen", "画布专注模式", "F"],
  ],
  帮助: [
    ["help", "快捷键与版本说明…", ""],
    ["demo", "打开内置示例…", ""],
  ],
};
const fonts = [
  "Microsoft YaHei",
  "DengXian",
  "SimHei",
  "SimSun",
  "KaiTi",
  "FangSong",
  "Segoe UI",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Consolas",
];
const i = (name) =>
  `<i data-lucide="${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}"></i>`;
const $ = (s) => document.querySelector(s);
const toolButton = (t) =>
  `<button data-tool="${t[0]}" aria-label="${t[1]}" title="${t[1]}工具 (${t[3]})">${i(t[2])}</button>`;
$("#app").innerHTML =
  `<header class="menubar"><div class="brand"><span>Co</span>Compositor</div>${Object.entries(
    menus,
  )
    .map(
      ([name, items]) =>
        `<div class="menu"><button aria-haspopup="menu">${name}</button><div class="dropdown" role="menu">${items.map((item) => (item ? `<button role="menuitem" data-action="${item[0]}">${item[1]}<kbd>${item[2]}</kbd></button>` : "<hr>")).join("")}</div></div>`,
    )
    .join("")}<span class="version">Windows 中文版 · 0.1</span></header>
<div class="options"><span id="tool-name">移动工具</span><span class="divider"></span>
<div class="opt" data-for="move"><label><input type="checkbox" id="auto-select"> 自动选择图层</label><label><input type="checkbox" id="show-transform" checked> 显示变换控件</label></div>
<div class="opt" data-for="brush eraser"><label>大小 <input id="brush-size-range" type="range" min="1" max="500" value="30" aria-label="画笔大小滑块"><input id="brush-size" aria-label="画笔大小" type="number" value="30" min="1" max="1000"> px</label><label id="hardness-option">硬度 <input id="hardness" type="range" value="80" min="0" max="100" aria-label="画笔硬度"><output id="hardness-value">80%</output></label></div>
<div class="opt" data-for="brush eraser fill gradient rect ellipse"><label id="opacity-option">不透明度 <input id="brush-opacity-range" type="range" min="1" max="100" value="100" aria-label="工具不透明度滑块"><input id="brush-opacity" aria-label="工具不透明度" type="number" value="100" min="1" max="100"> %</label></div>
<div class="opt" data-for="fill"><label id="tolerance-option">容差 <input id="tolerance" type="number" value="24" min="0" max="255" aria-label="填充容差"></label></div>
<div class="opt" data-for="text"><label>字体 <input id="text-font" list="font-list" value="Microsoft YaHei" aria-label="字体"></label><label>字号 <input id="text-size" type="number" value="48" min="1" max="1000" aria-label="字号"> px</label><datalist id="font-list">${fonts.map((f) => `<option value="${f}">`).join("")}</datalist></div>
<div class="opt" data-for="crop"><label><input type="checkbox" id="crop-delete"> 删除裁剪的像素</label></div>
<div class="opt" data-for="select"><span class="hint">Shift 正方形 · Alt 从中心 · 在选区内拖动可移动选区</span></div>
<div class="opt" data-for="eyedropper"><span class="hint">单击拾取前景色 · Alt+单击拾取背景色</span></div>
<div class="opt hidden" id="commit-group"><button data-action="cancel" title="取消 (Esc)" aria-label="取消">${i("X")}</button><button data-action="commit" class="commit" title="提交 (Enter)" aria-label="提交">${i("Check")}</button></div>
<span class="tip" id="tool-tip">拖动图层 · Shift 约束方向 · 空格平移</span></div>
<main class="workspace"><aside class="tools" aria-label="工具栏">${toolGroups.map((g) => g.map((name) => toolButton(tools.find((t) => t[0] === name))).join("")).join('<div class="split"></div>')}<div class="colors"><input id="bg" type="color" value="#ffffff" aria-label="背景色" title="背景色"><input id="fg" type="color" value="#000000" aria-label="前景色" title="前景色"><button class="swap" data-action="swap" title="切换前景色和背景色 (X)" aria-label="切换前景色和背景色">${i("ArrowLeftRight")}</button><button class="reset" data-action="default-colors" title="默认前景色和背景色 (D)" aria-label="默认前景色和背景色"><span></span><span></span></button></div></aside>
<section class="view"><div class="tabs"><div class="tab" id="document-tab">起始页</div><div class="spacer"></div><button data-action="open" title="打开 (Ctrl+O)">${i("FolderOpen")}</button><button data-action="save" title="存储 (Ctrl+S)">${i("Save")}</button></div><div class="ruler-corner"></div><div class="ruler-top"><canvas id="ruler"></canvas></div><div class="ruler-left"><canvas id="ruler-left"></canvas></div><div class="viewport" tabindex="0" aria-label="图像编辑画布"><div class="stage hidden"><canvas id="display"></canvas></div><canvas id="overlay"></canvas><div class="welcome"><div class="mark">Co</div><h1>让创作回到画布</h1><p>本地编辑 · 中文工作区 · 熟悉的操作方式</p><div><button class="primary" data-action="new">新建文档</button> <button data-action="open">打开图片或项目</button></div><button data-action="demo">探索示例文档 →</button><div class="shortcuts"><span>Ctrl+N 新建</span><span>Ctrl+O 打开</span><span>拖入图片即可置入</span></div></div></div></section>
<aside class="side"><div class="panel-heading" data-collapse="navigator">导航器<span class="light">sRGB / 8 位</span></div><div class="navigator" id="navigator-panel"><canvas id="navigator" width="256" height="105" title="拖动红框平移视图"></canvas><div class="nav-controls"><button data-action="zoom-out" aria-label="缩小">−</button><input id="zoom-range" type="range" min="3" max="800" value="100" aria-label="视图缩放"><button data-action="zoom-in" aria-label="放大">+</button><span id="zoom-label">100%</span></div></div><div class="panel-heading" data-collapse="properties">属性<span class="light" id="layer-kind">像素图层</span></div><div class="properties" id="properties-panel"><label>X <input id="prop-x" type="number" aria-label="图层 X"></label><label>Y <input id="prop-y" type="number" aria-label="图层 Y"></label><label>W <input id="prop-w" type="number" min="1" aria-label="图层宽度"></label><label>H <input id="prop-h" type="number" min="1" aria-label="图层高度"></label><label>角度 <input id="prop-rotation" type="number" aria-label="图层角度"></label><label>DPI <input id="prop-dpi" type="number" min="1" max="9600" aria-label="分辨率"></label><div class="wide"><button data-action="flip-x" title="水平翻转">${i("FlipHorizontal")}</button><button data-action="flip-y" title="垂直翻转">${i("FlipVertical")}</button><button data-action="edit-text" title="编辑文字">${i("Type")}</button></div></div><div class="panel-tabs"><button class="active" data-panel="layers">图层</button><button data-panel="history">历史记录</button></div><div class="layer-controls"><select id="blend" aria-label="混合模式">${MODES.map((m) => `<option value="${m[0]}">${m[1]}</option>`).join("")}</select><label><span class="scrub" id="opacity-scrub" title="左右拖动调整不透明度">不透明度</span> <input id="layer-opacity" type="number" min="0" max="100" value="100" aria-label="图层不透明度">%</label></div><div class="layer-locks"><span>锁定:</span><button id="lock-button" data-action="lock" title="锁定 / 解锁图层 (Ctrl+/)" aria-label="锁定图层">${i("Lock")}</button><span class="light" id="lock-state">未锁定</span></div><div class="layer-list"></div><div class="history-list"></div><div class="layer-footer"><button data-action="mask" title="添加 / 切换蒙版">${i("Square")}</button><button data-action="add" title="创建新图层 (Shift+Ctrl+N)">${i("Plus")}</button><button data-action="duplicate" title="复制图层">${i("Copy")}</button><button data-action="up" title="前移一层 (Ctrl+])">${i("ArrowUp")}</button><button data-action="down" title="后移一层 (Ctrl+[)">${i("ArrowDown")}</button><button data-action="delete-layer" title="删除图层">${i("Trash2")}</button><span id="layer-count">0 层</span></div></aside></main>
<footer class="statusbar"><button data-action="fit" id="status-zoom">适合屏幕</button><span id="dimensions">无文档</span><span id="cursor-pos">X – · Y –</span><span class="message" id="status">就绪</span><span>离线工作区</span></footer><div class="context-menu hidden" id="context-menu" role="menu"></div><input type="file" id="file-input" accept=".png,.jpg,.jpeg,.webp,.bmp,.psd,.cwin" multiple hidden>`;
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
  xform = null,
  cropRect = null,
  hover = null,
  lastPaint = null,
  lastSelection = null,
  lastComposite = null,
  navGeom = null,
  ants = 0,
  toastTimer,
  modalOpen = false,
  working = false,
  recoveryRevision = 0,
  revision = 0;
const view = $(".viewport"),
  stage = $(".stage"),
  display = $("#display"),
  overlay = $("#overlay");
const PAINT_TOOLS = ["brush", "eraser"];
const ZOOM_STEPS = [
  0.03, 0.05, 0.0625, 0.0833, 0.125, 0.1667, 0.25, 0.3333, 0.5, 0.6667, 1, 1.5,
  2, 3, 4, 5, 6, 7, 8,
];
const ROTATE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 12a7 7 0 1 1 3 5.7" fill="none" stroke="#fff" stroke-width="4"/><path d="M5 12a7 7 0 1 1 3 5.7" fill="none" stroke="#000" stroke-width="1.6"/><path d="M2 9l3 4 3-4z" fill="#000" stroke="#fff"/></svg>')}") 12 12, crosshair`;
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
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
function dialog(title, body, confirm = "确定", setup = null) {
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
    setup?.(el);
    const first = el.querySelector("input,textarea,select,button");
    first.focus();
    first.select?.();
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
const fullRect = () => ({
  x: 0,
  y: 0,
  w: editor.doc.width,
  h: editor.doc.height,
  touched: false,
});
function setTool(next) {
  if (xform && next !== "move") commitTransform();
  if (next !== "crop") cropRect = null;
  else if (editor.doc && tool !== "crop") cropRect = fullRect();
  tool = next;
  document.querySelectorAll("[data-tool]").forEach((b) => {
    b.classList.toggle("active", b.dataset.tool === next);
    b.setAttribute("aria-pressed", b.dataset.tool === next);
  });
  $("#tool-name").textContent = tools.find((t) => t[0] === tool)[1] + "工具";
  document
    .querySelectorAll(".opt[data-for]")
    .forEach((o) =>
      o.classList.toggle("hidden", !o.dataset.for.split(" ").includes(tool)),
    );
  updateCommitGroup();
  const tips = {
    move: "Ctrl+单击自动选择 · Alt+拖动复制 · Ctrl+T 自由变换",
    select: "拖动建立矩形选区 · Ctrl+D 取消 · Shift+Ctrl+D 重新选择",
    crop: "拖动控制点调整 · 在框外拖动重新绘制 · Enter 确认 · Esc 复位",
    brush:
      "[ / ] 大小 · Shift+[ / ] 硬度 · 数字键不透明度 · Shift+单击画直线 · Alt 吸管",
    eraser: "擦除像素 · 蒙版上恢复可见区域 · Shift+单击画直线",
    gradient: "拖动从前景色渐变到背景色 · Shift 约束 45°",
    text: "单击添加文字 · 单击已有文字图层再次编辑",
    eyedropper: "按住拖动连续取样",
    hand: "拖动平移 · 双击工具按钮适合屏幕",
    zoom: "单击放大 · Alt+单击缩小 · 左右拖动连续缩放 · 双击工具按钮 100%",
    fill: "连续区域填充 · 可调整容差 · Alt 吸管",
  };
  $("#tool-tip").textContent = tips[tool] || "Shift 约束比例 · 空格平移画布";
  updateCursor();
  drawOverlay();
}
function updateCommitGroup() {
  $("#commit-group").classList.toggle(
    "hidden",
    !(xform || (tool === "crop" && cropRect)),
  );
}
function brushRadius() {
  const l = editor.active,
    s = l ? (Math.abs(l.scaleX) + Math.abs(l.scaleY)) / 2 : 1;
  return (brushValues().size / 2) * zoom * s;
}
function updateCursor() {
  if (gesture?.kind === "pan" || space) {
    view.style.cursor = gesture?.kind === "pan" ? "grabbing" : "grab";
    return;
  }
  let c = "default";
  if (PAINT_TOOLS.includes(tool))
    c = editor.doc && brushRadius() >= 4 ? "none" : "crosshair";
  else if (
    ["select", "gradient", "rect", "ellipse", "fill", "eyedropper"].includes(
      tool,
    )
  )
    c = "crosshair";
  else if (tool === "hand") c = "grab";
  else if (tool === "text") c = "text";
  else if (tool === "zoom") c = "zoom-in";
  if (hover && editor.doc && !gesture) {
    if (
      tool === "move" &&
      (xform || $("#show-transform").checked) &&
      editor.active
    ) {
      const hit = transformHit(editor.active, hover.s, !!xform);
      if (hit) c = hitCursor(hit, editor.active);
    } else if (tool === "crop" && cropRect) {
      const hit = cropHit(hover.s);
      c =
        hit.mode === "scale"
          ? scaleCursor(hit, cropCenterScreen())
          : hit.mode === "move"
            ? "move"
            : "crosshair";
    } else if (
      tool === "select" &&
      editor.selection &&
      inRect(hover.p, editor.selection)
    )
      c = "move";
    if (tool === "zoom" && hover.alt) c = "zoom-out";
  }
  view.style.cursor = c;
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
function clampPan() {
  if (!editor.doc) return;
  const margin = 60,
    w = editor.doc.width * zoom,
    h = editor.doc.height * zoom;
  pan.x = clamp(pan.x, margin - w, view.clientWidth - margin);
  pan.y = clamp(pan.y, margin - h, view.clientHeight - margin);
}
function setZoom(
  value,
  anchor = { x: view.clientWidth / 2, y: view.clientHeight / 2 },
) {
  if (!editor.doc) return;
  const next = clamp(value, 0.03, 8);
  pan.x = anchor.x - ((anchor.x - pan.x) * next) / zoom;
  pan.y = anchor.y - ((anchor.y - pan.y) * next) / zoom;
  zoom = next;
  updateCursor();
  updateView();
}
function stepZoom(direction, anchor) {
  const next =
    direction > 0
      ? ZOOM_STEPS.find((z) => z > zoom * 1.001) || 8
      : ZOOM_STEPS.findLast((z) => z < zoom * 0.999) || 0.03;
  setZoom(next, anchor);
}
function docTitle() {
  return `<span class="dot">${editor.dirty ? "●" : ""}</span>${esc(editor.doc.name)}${editor.filePath ? ".cwin" : ""} @ ${Math.round(zoom * 1000) / 10}% (RGB/8)`;
}
function updateView() {
  if (editor.doc) {
    stage.style.width = editor.doc.width + "px";
    stage.style.height = editor.doc.height + "px";
    stage.style.transform = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    const label = Math.round(zoom * 1000) / 10 + "%";
    $("#zoom-label").textContent = label;
    $("#status-zoom").textContent = label;
    $("#zoom-range").value = Math.round(zoom * 100);
    $("#document-tab").innerHTML = docTitle();
  }
  drawOverlay();
  drawRulers();
  drawNavigator();
}
function rulerStep() {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
  return steps.find((s) => s * zoom >= 60) || 5000;
}
function drawRuler(c, horizontal) {
  const length = horizontal ? c.clientWidth : c.clientHeight;
  if (!length) return;
  const w = horizontal ? length : 20,
    h = horizontal ? 20 : length;
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  if (!editor.doc) return;
  ctx.strokeStyle = "#8a8a8a";
  ctx.fillStyle = "#b8b8b8";
  ctx.font = "9px Segoe UI";
  const step = rulerStep(),
    minor = step / (step * zoom >= 100 ? 10 : step % 5 === 0 ? 5 : 2),
    offset = horizontal ? pan.x : pan.y;
  const first = Math.floor(-offset / zoom / minor) * minor;
  ctx.beginPath();
  for (let v = first; offset + v * zoom <= length; v += minor) {
    const s = Math.round(offset + v * zoom) + 0.5,
      major = Math.abs(v / step - Math.round(v / step)) < 1e-6,
      tick = major
        ? 0
        : Math.abs((v * 2) / step - Math.round((v * 2) / step)) < 1e-6
          ? 10
          : 14;
    if (horizontal) {
      ctx.moveTo(s, 20);
      ctx.lineTo(s, tick);
    } else {
      ctx.moveTo(20, s);
      ctx.lineTo(tick, s);
    }
    if (major) {
      const label = String(Math.round(v));
      if (horizontal) ctx.fillText(label, s + 3, 9);
      else {
        ctx.save();
        ctx.translate(9, s + 3);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(label, -ctx.measureText(label).width, 0);
        ctx.restore();
      }
    }
  }
  ctx.stroke();
  if (hover) {
    const s = Math.round(horizontal ? hover.s.x : hover.s.y) + 0.5;
    ctx.strokeStyle = "#f2f2f2";
    ctx.beginPath();
    if (horizontal) {
      ctx.moveTo(s, 0);
      ctx.lineTo(s, 20);
    } else {
      ctx.moveTo(0, s);
      ctx.lineTo(20, s);
    }
    ctx.stroke();
  }
}
function drawRulers() {
  if (document.body.classList.contains("no-rulers")) return;
  drawRuler($("#ruler"), true);
  drawRuler($("#ruler-left"), false);
}
function drawNavigator() {
  const nav = $("#navigator"),
    w = nav.clientWidth || 256,
    h = nav.clientHeight || 105;
  if (nav.width !== w) nav.width = w;
  if (nav.height !== h) nav.height = h;
  const n = nav.getContext("2d");
  n.clearRect(0, 0, w, h);
  navGeom = null;
  if (!editor.doc || !lastComposite) return;
  const c = lastComposite,
    s = Math.min(w / c.width, h / c.height),
    ox = (w - c.width * s) / 2,
    oy = (h - c.height * s) / 2;
  n.drawImage(c, ox, oy, c.width * s, c.height * s);
  n.strokeStyle = "#e5483f";
  n.lineWidth = 1.5;
  const x = ox + (-pan.x / zoom) * s,
    y = oy + (-pan.y / zoom) * s,
    vw = (view.clientWidth / zoom) * s,
    vh = (view.clientHeight / zoom) * s;
  n.save();
  n.beginPath();
  n.rect(0, 0, w, h);
  n.clip();
  n.strokeRect(
    Math.round(x) + 0.5,
    Math.round(y) + 0.5,
    Math.round(vw),
    Math.round(vh),
  );
  n.restore();
  navGeom = { s, ox, oy, scale: w / nav.getBoundingClientRect().width };
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
const inRect = (p, r) =>
  p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
function inPolygon(p, poly) {
  let inside = false;
  for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
    const pa = poly[a],
      pb = poly[b];
    if (
      pa.y > p.y !== pb.y > p.y &&
      p.x < ((pb.x - pa.x) * (p.y - pa.y)) / (pb.y - pa.y) + pa.x
    )
      inside = !inside;
  }
  return inside;
}
const HANDLES = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [1, 0.5],
  [1, 1],
  [0.5, 1],
  [0, 1],
  [0, 0.5],
];
function transformHit(l, s, session) {
  const w = l.canvas.width,
    h = l.canvas.height;
  for (const [u, v] of HANDLES) {
    const q = screen(worldPoint(l, { x: u * w, y: v * h }));
    if (Math.hypot(s.x - q.x, s.y - q.y) <= 7) return { mode: "scale", u, v };
  }
  const poly = bounds(l);
  if (inPolygon(s, poly)) return { mode: "move" };
  if (session || poly.some((q) => Math.hypot(s.x - q.x, s.y - q.y) <= 26))
    return { mode: "rotate" };
  return null;
}
function scaleCursor(hit, centerScreen) {
  const angle =
    ((Math.atan2(hit.sy - centerScreen.y, hit.sx - centerScreen.x) * 180) /
      Math.PI +
      360) %
    180;
  return angle < 22.5 || angle >= 157.5
    ? "ew-resize"
    : angle < 67.5
      ? "nwse-resize"
      : angle < 112.5
        ? "ns-resize"
        : "nesw-resize";
}
function hitCursor(hit, l) {
  if (hit.mode === "move") return "move";
  if (hit.mode === "rotate") return ROTATE_CURSOR;
  const q = screen(
      worldPoint(l, { x: hit.u * l.canvas.width, y: hit.v * l.canvas.height }),
    ),
    c = screen(
      worldPoint(l, { x: l.canvas.width / 2, y: l.canvas.height / 2 }),
    );
  return scaleCursor({ sx: q.x, sy: q.y }, c);
}
function cropScreenRect() {
  const a = screen({ x: cropRect.x, y: cropRect.y });
  return { x: a.x, y: a.y, w: cropRect.w * zoom, h: cropRect.h * zoom };
}
function cropCenterScreen() {
  const r = cropScreenRect();
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}
function cropHit(s) {
  const r = cropScreenRect();
  for (const [u, v] of HANDLES) {
    const q = { x: r.x + u * r.w, y: r.y + v * r.h };
    if (Math.hypot(s.x - q.x, s.y - q.y) <= 8)
      return { mode: "scale", u, v, sx: q.x, sy: q.y };
  }
  return inRect(s, r) ? { mode: "move" } : { mode: "new" };
}
function strokeAnts(ctx, path) {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = "#fff";
  ctx.lineDashOffset = -ants;
  path();
  ctx.stroke();
  ctx.strokeStyle = "#000";
  ctx.lineDashOffset = -ants + 4;
  path();
  ctx.stroke();
  ctx.restore();
}
function handleSquare(ctx, q) {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#1473e6";
  ctx.fillRect(Math.round(q.x) - 3.5, Math.round(q.y) - 3.5, 7, 7);
  ctx.strokeRect(Math.round(q.x) - 3.5, Math.round(q.y) - 3.5, 7, 7);
}
function sizeLabel(ctx, s, text) {
  ctx.save();
  ctx.font = "11px Segoe UI, Microsoft YaHei UI";
  const w = ctx.measureText(text).width + 12;
  ctx.fillStyle = "#1e1e1ee8";
  ctx.fillRect(s.x + 14, s.y + 14, w, 20);
  ctx.fillStyle = "#eee";
  ctx.fillText(text, s.x + 20, s.y + 28);
  ctx.restore();
}
function drawOverlay() {
  if (overlay.width !== view.clientWidth) overlay.width = view.clientWidth;
  if (overlay.height !== view.clientHeight) overlay.height = view.clientHeight;
  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  if (!editor.doc) return;
  const l = editor.active,
    g = gesture;
  if (l && tool === "move" && (xform || $("#show-transform").checked)) {
    const p = bounds(l),
      w = l.canvas.width,
      h = l.canvas.height;
    ctx.strokeStyle = "#1473e6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    p.forEach((q, k) => (k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
    ctx.closePath();
    ctx.stroke();
    for (const [u, v] of HANDLES)
      handleSquare(ctx, screen(worldPoint(l, { x: u * w, y: v * h })));
    if (xform) {
      const c = screen(worldPoint(l, { x: w / 2, y: h / 2 }));
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.moveTo(c.x - 7, c.y);
      ctx.lineTo(c.x + 7, c.y);
      ctx.moveTo(c.x, c.y - 7);
      ctx.lineTo(c.x, c.y + 7);
      ctx.stroke();
    }
    if (g?.kind === "xform" && hover) {
      const text =
        g.mode === "rotate"
          ? `${Math.round(l.rotation * 10) / 10}°`
          : `W: ${Math.round(Math.abs(w * l.scaleX))} px  H: ${Math.round(Math.abs(h * l.scaleY))} px`;
      sizeLabel(ctx, hover.s, text);
    }
  }
  const sel =
    g?.kind === "select"
      ? norm(g.start, g.end, g.shift, g.alt)
      : editor.selection;
  if (sel) {
    const a = screen(sel);
    strokeAnts(ctx, () => {
      ctx.beginPath();
      ctx.rect(
        Math.round(a.x) + 0.5,
        Math.round(a.y) + 0.5,
        Math.round(sel.w * zoom),
        Math.round(sel.h * zoom),
      );
    });
    if (g?.kind === "select" && hover)
      sizeLabel(
        ctx,
        hover.s,
        `W: ${Math.round(sel.w)} px  H: ${Math.round(sel.h)} px`,
      );
  }
  if (g && (g.kind === "rect" || g.kind === "ellipse")) {
    const r = norm(g.start, g.end, g.shift, g.alt),
      a = screen(r);
    ctx.save();
    ctx.strokeStyle = "#1473e6";
    ctx.beginPath();
    if (g.kind === "rect") ctx.rect(a.x, a.y, r.w * zoom, r.h * zoom);
    else
      ctx.ellipse(
        a.x + (r.w * zoom) / 2,
        a.y + (r.h * zoom) / 2,
        (r.w * zoom) / 2,
        (r.h * zoom) / 2,
        0,
        0,
        Math.PI * 2,
      );
    ctx.stroke();
    ctx.restore();
    if (hover)
      sizeLabel(
        ctx,
        hover.s,
        `W: ${Math.round(r.w)} px  H: ${Math.round(r.h)} px`,
      );
  }
  if (g?.kind === "gradient") {
    const a = screen(g.start),
      b = screen(g.end);
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    for (const [q, color] of [
      [a, $("#fg").value],
      [b, $("#bg").value],
    ]) {
      ctx.fillStyle = color;
      ctx.fillRect(q.x - 4, q.y - 4, 8, 8);
      ctx.strokeRect(q.x - 4, q.y - 4, 8, 8);
    }
    ctx.restore();
  }
  if (tool === "crop" && cropRect) {
    const r = cropScreenRect();
    ctx.save();
    ctx.fillStyle = "#000000a0";
    ctx.beginPath();
    ctx.rect(0, 0, overlay.width, overlay.height);
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.fill("evenodd");
    ctx.strokeStyle = "#ffffff70";
    ctx.beginPath();
    for (const k of [1, 2]) {
      ctx.moveTo(r.x + (r.w * k) / 3, r.y);
      ctx.lineTo(r.x + (r.w * k) / 3, r.y + r.h);
      ctx.moveTo(r.x, r.y + (r.h * k) / 3);
      ctx.lineTo(r.x + r.w, r.y + (r.h * k) / 3);
    }
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(
      Math.round(r.x) + 0.5,
      Math.round(r.y) + 0.5,
      Math.round(r.w),
      Math.round(r.h),
    );
    for (const [u, v] of HANDLES)
      handleSquare(ctx, { x: r.x + u * r.w, y: r.y + v * r.h });
    ctx.restore();
    if (g?.kind?.startsWith("crop") && hover)
      sizeLabel(
        ctx,
        hover.s,
        `W: ${Math.round(cropRect.w)} px  H: ${Math.round(cropRect.h)} px`,
      );
  }
  if (hover && PAINT_TOOLS.includes(tool) && !space) {
    const r = brushRadius(),
      s = hover.s;
    ctx.save();
    if (r >= 4) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.x - 3, s.y);
      ctx.lineTo(s.x + 3, s.y);
      ctx.moveTo(s.x, s.y - 3);
      ctx.lineTo(s.x, s.y + 3);
      ctx.stroke();
    }
    ctx.restore();
  }
}
function renderPixels() {
  if (!editor.doc) return;
  const c = composite(editor.doc);
  lastComposite = c;
  if (display.width !== c.width || display.height !== c.height) {
    display.width = c.width;
    display.height = c.height;
  }
  const ctx = display.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(c, 0, 0);
  drawNavigator();
  drawOverlay();
}
function sync() {
  const doc = editor.doc;
  window.desktop?.dirty(editor.dirty);
  revision++;
  $(".welcome").classList.toggle("hidden", !!doc);
  stage.classList.toggle("hidden", !doc);
  if (!doc) return;
  if (xform && !doc.layers.includes(xform.l)) xform = null;
  if (tool === "crop" && (!cropRect || !cropRect.touched))
    cropRect = fullRect();
  updateCommitGroup();
  $("#document-tab").innerHTML = docTitle();
  $("#dimensions").textContent =
    `${doc.width} × ${doc.height} px · ${doc.dpi} ppi`;
  $("#layer-count").textContent = doc.layers.length + " 层";
  const l = editor.active;
  $("#blend").value = l.blend;
  $("#layer-opacity").value = Math.round(l.opacity * 100);
  $("#lock-button").classList.toggle("on", l.locked);
  $("#lock-state").textContent = l.locked ? "已锁定" : "未锁定";
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
        `<div class="layer-row ${l.id === doc.active ? "selected" : ""} ${l.visible ? "" : "invisible"}" data-layer="${l.id}" draggable="true" tabindex="0" role="button" aria-label="图层 ${esc(l.name)}"><button class="eye" data-visible="${l.id}" title="${l.visible ? "隐藏" : "显示"}图层 · Alt+单击仅显示此图层">${i(l.visible ? "Eye" : "EyeOff")}</button><img src="${l.canvas.toDataURL()}" class="${l.target !== "mask" ? "target" : ""}" data-target="pixels" alt="像素缩略图" title="Ctrl+单击载入选区${l.text ? " · 双击编辑文字" : ""}" draggable="false">${l.mask ? `<img class="mask ${l.target === "mask" ? "target" : ""}" src="${l.mask.toDataURL()}" data-target="mask" alt="蒙版缩略图" draggable="false">` : ""}<span class="name">${l.text ? '<b class="kind">T</b>' : ""}${esc(l.name)}</span>${l.locked ? `<button class="lock" data-lock="${l.id}" title="解锁图层">${i("Lock")}</button>` : ""}</div>`,
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
function selectLayer(id) {
  if (xform && xform.l.id !== id) commitTransform();
  editor.doc.active = id;
  sync();
}
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
function norm(a, b, shift = false, alt = false) {
  let dx = b.x - a.x,
    dy = b.y - a.y;
  if (shift) {
    const size = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * size;
    dy = Math.sign(dy || 1) * size;
  }
  if (alt)
    return {
      x: a.x - Math.abs(dx),
      y: a.y - Math.abs(dy),
      w: Math.abs(dx) * 2,
      h: Math.abs(dy) * 2,
    };
  return {
    x: Math.min(a.x, a.x + dx),
    y: Math.min(a.y, a.y + dy),
    w: Math.abs(dx),
    h: Math.abs(dy),
  };
}
function setSelection(r) {
  if (editor.selection) lastSelection = editor.selection;
  editor.selection = r;
  drawOverlay();
}
function brushValues() {
  return {
    size: clamp(+$("#brush-size").value || 1, 1, 1000),
    opacity: clamp(+$("#brush-opacity").value / 100 || 0.01, 0.01, 1),
    hardness: +$("#hardness").value / 100,
  };
}
function setBrushSize(v) {
  v = Math.round(clamp(v, 1, 1000));
  $("#brush-size").value = v;
  $("#brush-size-range").value = Math.min(500, v);
  updateCursor();
  drawOverlay();
}
function setToolOpacity(v) {
  v = Math.round(clamp(v, 1, 100));
  $("#brush-opacity").value = v;
  $("#brush-opacity-range").value = v;
}
function setHardness(v) {
  v = Math.round(clamp(v, 0, 100));
  $("#hardness").value = v;
  $("#hardness-value").textContent = v + "%";
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
  g.lastWorld = p;
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
function fillSelection(color, opacity = 1, label = "填充") {
  const l = editable(),
    ctx = (l.target === "mask" && l.mask ? l.mask : l.canvas).getContext("2d");
  ctx.save();
  clipSelection(ctx, l);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, l.canvas.width, l.canvas.height);
  ctx.restore();
  l.text = null;
  editor.commit(label);
}
function clearSelection() {
  const l = editable(),
    ctx = (l.target === "mask" && l.mask ? l.mask : l.canvas).getContext("2d");
  if (!editor.selection) throw Error("先选择需要清除的区域");
  ctx.save();
  clipSelection(ctx, l);
  ctx.clearRect(0, 0, l.canvas.width, l.canvas.height);
  ctx.restore();
  l.text = null;
  editor.commit("清除选区");
}
function pickColor(p, target = "fg") {
  const x = Math.floor(p.x),
    y = Math.floor(p.y);
  if (x < 0 || y < 0 || x >= display.width || y >= display.height) return;
  const d = display.getContext("2d").getImageData(x, y, 1, 1).data;
  $("#" + target).value =
    "#" +
    [...d.slice(0, 3)].map((v) => v.toString(16).padStart(2, "0")).join("");
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
    tol = clamp(+$("#tolerance").value || 0, 0, 255);
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
const transformState = (l) => ({
  x: l.x,
  y: l.y,
  scaleX: l.scaleX,
  scaleY: l.scaleY,
  rotation: l.rotation,
});
function startTransform() {
  const l = editable();
  if (xform) return;
  setTool("move");
  xform = { l, origin: transformState(l), changed: false };
  updateCommitGroup();
  drawOverlay();
  notify(
    "自由变换：拖动控制点缩放（Shift 自由比例，Alt 中心）· 框外拖动旋转 · Enter 确认 · Esc 取消",
  );
}
function commitTransform() {
  if (!xform) return;
  const t = xform;
  xform = null;
  updateCommitGroup();
  if (t.changed) editor.commit("自由变换");
  else drawOverlay();
}
function cancelTransform() {
  if (!xform) return;
  Object.assign(xform.l, xform.origin);
  xform = null;
  updateCommitGroup();
  sync();
}
const clampScale = (s) => Math.sign(s || 1) * clamp(Math.abs(s), 0.001, 1000);
function applyScale(g, p, e) {
  const o = g.origin,
    l = g.l,
    w = l.canvas.width,
    h = l.canvas.height,
    ua = e.altKey ? 0.5 : 1 - g.u,
    va = e.altKey ? 0.5 : 1 - g.v,
    A = { x: ua * w, y: va * h },
    anchor = worldPoint({ ...l, ...o }, A),
    a = (-o.rotation * Math.PI) / 180,
    dx = p.x - anchor.x,
    dy = p.y - anchor.y,
    d = {
      x: dx * Math.cos(a) - dy * Math.sin(a),
      y: dx * Math.sin(a) + dy * Math.cos(a),
    },
    hx = (g.u - ua) * w,
    hy = (g.v - va) * h;
  let sx = o.scaleX,
    sy = o.scaleY;
  if (g.u !== 0.5 && g.v !== 0.5 && !e.shiftKey) {
    const vx = hx * o.scaleX,
      vy = hy * o.scaleY,
      k = (d.x * vx + d.y * vy) / (vx * vx + vy * vy);
    sx = o.scaleX * k;
    sy = o.scaleY * k;
  } else {
    if (hx) sx = d.x / hx;
    if (hy) sy = d.y / hy;
  }
  sx = clampScale(sx);
  sy = clampScale(sy);
  const r = (o.rotation * Math.PI) / 180;
  Object.assign(l, {
    scaleX: sx,
    scaleY: sy,
    rotation: o.rotation,
    x: anchor.x - (A.x * sx * Math.cos(r) - A.y * sy * Math.sin(r)),
    y: anchor.y - (A.x * sx * Math.sin(r) + A.y * sy * Math.cos(r)),
  });
}
function applyRotate(g, p, e) {
  const o = g.origin,
    l = g.l,
    w = l.canvas.width,
    h = l.canvas.height,
    c = worldPoint({ ...l, ...o }, { x: w / 2, y: h / 2 });
  let angle =
    o.rotation +
    ((Math.atan2(p.y - c.y, p.x - c.x) -
      Math.atan2(g.start.y - c.y, g.start.x - c.x)) *
      180) /
      Math.PI;
  if (e.shiftKey) angle = Math.round(angle / 15) * 15;
  angle = ((((angle + 180) % 360) + 360) % 360) - 180;
  angle = Math.round(angle * 100) / 100;
  const r = (angle * Math.PI) / 180,
    hw = (w / 2) * o.scaleX,
    hh = (h / 2) * o.scaleY;
  Object.assign(l, {
    rotation: angle,
    x: c.x - (hw * Math.cos(r) - hh * Math.sin(r)),
    y: c.y - (hw * Math.sin(r) + hh * Math.cos(r)),
  });
}
function topLayerAt(p, predicate = (l) => opaqueAt(l, p)) {
  return editor.doc.layers
    .slice()
    .reverse()
    .find((l) => l.visible && predicate(l));
}
function applyCrop() {
  requireDoc();
  if (!cropRect) return;
  const r = cropRect;
  if (r.w < 1 || r.h < 1) throw Error("裁剪区域太小");
  editor.crop(r, $("#crop-delete").checked);
  cropRect = fullRect();
  fit();
  notify(
    $("#crop-delete").checked
      ? "已裁剪并删除画布外像素"
      : "已裁剪：画布外像素保留，可移动图层重新构图",
  );
}
async function textDialog(existing = null, origin = { x: 100, y: 100 }) {
  const t = existing?.text || {
    content: "在这里输入文字",
    font: $("#text-font").value || "Microsoft YaHei",
    size: clamp(+$("#text-size").value || 48, 1, 1000),
    color: $("#fg").value,
    bold: false,
  };
  const values = await dialog(
    existing ? "编辑文字" : "添加文字",
    `<textarea name="content" aria-label="文字内容">${esc(t.content)}</textarea>${field("字体", "font", t.font, "text", 'list="font-list"')}${field("字号 px", "size", t.size, "number", 'min="1" max="1000"')}${field("颜色", "color", t.color, "color")}<label>粗体<input type="checkbox" name="bold" ${t.bold ? "checked" : ""}></label>`,
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
      editor.filePath = ext === "cwin" ? f.path || null : null;
      fit();
    } else {
      const replace = !place && index === 0;
      if (replace && !(await discard())) return;
      await editor.importImage(f.bytes, f.name, replace);
      if (replace) editor.filePath = null;
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
async function saveProject(as = false) {
  requireDoc();
  const bytes = await editor.saveProject();
  const path =
    !as && editor.filePath && window.desktop?.write
      ? await window.desktop.write(bytes, editor.filePath)
      : await saveBytes(bytes, editor.doc.name + ".cwin", "cwin");
  if (!path) return null;
  if (window.desktop) editor.filePath = path;
  editor.markSaved();
  notify("项目已存储：" + path);
  return path;
}
async function exportImage(type) {
  requireDoc();
  const values = await dialog(
    "导出为 " + (type === "jpg" ? "JPEG" : "PNG"),
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
const VIEW_ACTIONS = [
  "commit",
  "cancel",
  "undo",
  "redo",
  "zoom-in",
  "zoom-out",
  "fit",
  "actual",
  "rulers",
  "panels",
  "fullscreen",
  "swap",
  "default-colors",
  "help",
];
function arrange(to) {
  const l = editable(),
    from = editor.doc.layers.indexOf(l);
  editor.reorder(from, to(from));
}
async function action(name) {
  if (gesture) finishGesture();
  if (xform && !VIEW_ACTIONS.includes(name) && name !== "transform")
    commitTransform();
  switch (name) {
    case "new": {
      if (!(await discard())) return;
      const v = await dialog(
        "新建文档",
        `${field("名称", "name", "未标题-1", "text")}${field("宽度 px", "w", 1600, "number", 'min="1" max="8192"')}${field("高度 px", "h", 1000, "number", 'min="1" max="8192"')}${field("分辨率 ppi", "dpi", 300, "number", 'min="1" max="9600"')}<label>背景内容<select name="background"><option value="white">白色</option><option value="transparent">透明</option></select></label><p class="description">8 位 RGB / sRGB · 单文档工作区</p>`,
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
        editor.filePath = null;
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
        editor.filePath = null;
        fit();
        notify("已导入原版基础图层项目；请另存为 .cwin");
      }
      break;
    }
    case "save":
      await saveProject(false);
      break;
    case "save-as":
      await saveProject(true);
      break;
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
        editor.filePath = null;
        editor.dirty = true;
        editor.notify();
        fit();
        notify("已恢复最近自动备份，请另存项目");
      }
      break;
    }
    case "undo":
      requireDoc();
      if (xform) return cancelTransform();
      await editor.undo();
      break;
    case "redo":
      requireDoc();
      if (xform) return cancelTransform();
      await editor.redo();
      break;
    case "commit":
      if (xform) commitTransform();
      else if (tool === "crop") applyCrop();
      break;
    case "cancel":
      if (xform) cancelTransform();
      else if (tool === "crop" && editor.doc) {
        cropRect = fullRect();
        drawOverlay();
      }
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
      arrange((i) => i + 1);
      break;
    case "down":
      arrange((i) => i - 1);
      break;
    case "front":
      arrange(() => editor.doc.layers.length - 1);
      break;
    case "back":
      arrange(() => 0);
      break;
    case "layer-above":
    case "layer-below": {
      requireDoc();
      const layers = editor.doc.layers,
        k = layers.indexOf(editor.active) + (name === "layer-above" ? 1 : -1);
      if (k >= 0 && k < layers.length) selectLayer(layers[k].id);
      break;
    }
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
      startTransform();
      break;
    case "select-all":
      requireDoc();
      setSelection({ x: 0, y: 0, w: editor.doc.width, h: editor.doc.height });
      break;
    case "deselect":
      setSelection(null);
      break;
    case "reselect":
      requireDoc();
      if (!lastSelection) throw Error("没有可重新载入的选区");
      setSelection(lastSelection);
      break;
    case "layer-selection": {
      const l = requireDoc(),
        r = layerBounds(l, true);
      if (!r) throw Error("图层没有可见像素");
      setSelection(r);
      notify("已将图层像素范围载入为矩形选区");
      break;
    }
    case "clear":
      clearSelection();
      break;
    case "fill-selection":
      fillSelection($("#fg").value, 1, "填充前景色");
      break;
    case "fill-background":
      fillSelection($("#bg").value, 1, "填充背景色");
      break;
    case "fill": {
      editable();
      const v = await dialog(
        "填充",
        `<label>内容<select name="content"><option value="fg">前景色</option><option value="bg">背景色</option><option value="#000000">黑色</option><option value="#808080">50% 灰色</option><option value="#ffffff">白色</option></select></label>${field("不透明度 %", "opacity", 100, "number", 'min="1" max="100"')}<p class="description">${editor.selection ? "填充当前选区。" : "没有选区时填充整个图层。"}可撤销。</p>`,
      );
      if (v) {
        const color =
          v.content === "fg"
            ? $("#fg").value
            : v.content === "bg"
              ? $("#bg").value
              : v.content;
        fillSelection(color, clamp(+v.opacity || 100, 1, 100) / 100, "填充");
      }
      break;
    }
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
      editor.add(copy, "通过拷贝的图层");
      break;
    }
    case "crop":
      requireDoc();
      if (!editor.selection)
        throw Error("先用矩形选框选择裁切范围，或使用裁剪工具 (C)");
      editor.crop(editor.selection, $("#crop-delete").checked);
      fit();
      break;
    case "image-size": {
      requireDoc();
      const doc = editor.doc,
        v = await dialog(
          "图像大小",
          `${field("宽度 px", "w", doc.width, "number", 'min="1" max="8192"')}${field("高度 px", "h", doc.height, "number", 'min="1" max="8192"')}<label>约束比例<input type="checkbox" name="keep" checked></label>${field("分辨率 ppi", "dpi", doc.dpi, "number", 'min="1" max="9600"')}<p class="description">按比例缩放全部图层（通过变换，不损失原始像素）。仅修改分辨率不会重新采样。</p>`,
          "确定",
          (el) => {
            const w = el.querySelector('[name="w"]'),
              h = el.querySelector('[name="h"]'),
              keep = el.querySelector('[name="keep"]');
            w.oninput = () => {
              if (keep.checked)
                h.value = Math.max(
                  1,
                  Math.round((+w.value * doc.height) / doc.width),
                );
            };
            h.oninput = () => {
              if (keep.checked)
                w.value = Math.max(
                  1,
                  Math.round((+h.value * doc.width) / doc.height),
                );
            };
          },
        );
      if (v) {
        editor.resizeImage(+v.w, +v.h, +v.dpi);
        fit();
      }
      break;
    }
    case "size": {
      requireDoc();
      const anchors = [0, 0.5, 1]
        .flatMap((y) => [0, 0.5, 1].map((x) => `${x},${y}`))
        .map(
          (a) =>
            `<input type="radio" name="anchor" value="${a}" aria-label="锚点 ${a}" ${a === "0.5,0.5" ? "checked" : ""}>`,
        )
        .join("");
      const v = await dialog(
        "画布大小",
        `${field("宽度 px", "w", editor.doc.width, "number", 'min="1" max="8192"')}${field("高度 px", "h", editor.doc.height, "number", 'min="1" max="8192"')}${field("分辨率 ppi", "dpi", editor.doc.dpi, "number", 'min="1" max="9600"')}<label>定位<span class="anchor-grid">${anchors}</span></label><p class="description">按定位点扩展或收缩画布；图层像素保持原值，扩展区域透明。</p>`,
      );
      if (v) {
        const [ax, ay] = String(v.anchor || "0.5,0.5")
          .split(",")
          .map(Number);
        editor.resizeCanvas(+v.w, +v.h, { x: ax, y: ay }, +v.dpi);
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
      if (v) editor.applyFilter(name, clamp(+v.value, 0, max));
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
      stepZoom(1);
      break;
    case "zoom-out":
      stepZoom(-1);
      break;
    case "rulers":
      document.body.classList.toggle("no-rulers");
      setTimeout(() => updateView(), 0);
      break;
    case "panels":
      document.body.classList.toggle("hide-panels");
      setTimeout(() => updateView(), 0);
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
    case "default-colors":
      $("#fg").value = "#000000";
      $("#bg").value = "#ffffff";
      break;
    case "edit-text": {
      const l = editable();
      if (!l.text) throw Error("请选中文字图层");
      await textDialog(l);
      break;
    }
    case "help":
      await dialog(
        "Compositor Windows 中文版 0.1",
        `<p class="description">参考 robbietilton/Compositor，保留 MIT 授权。Windows 编辑核心为独立实现。快捷键尽量与 Photoshop 保持一致。<br><br><b>工具</b>：V 移动 / M 矩形选框 / C 裁剪 / I 吸管 / B 画笔 / E 橡皮 / G 油漆桶 / Shift+G 渐变 / T 文字 / U 矩形 / Shift+U 椭圆 / H 抓手 / Z 缩放。<br><br><b>画笔</b>：[ ] 大小；Shift+[ ] 硬度；数字键 1–0 不透明度；Shift+单击画直线；按住 Alt 临时吸管。<br><br><b>变换</b>：Ctrl+T 自由变换，拖角点等比缩放（Shift 自由比例、Alt 以中心），框外拖动旋转（Shift 15°），Enter 确认，Esc 取消；移动工具 Ctrl+单击自动选择图层，Alt+拖动复制。<br><br><b>视图</b>：空格拖动平移；滚轮滚动，Ctrl/Alt+滚轮缩放；Ctrl+0 适合屏幕；Ctrl+1 100%；Ctrl+R 标尺；Tab 隐藏面板；F 专注模式。<br><br><b>图层</b>：Ctrl+J 通过拷贝的图层；Ctrl+[ ] 前后移动；Shift+Ctrl+[ ] 置底/置顶；Alt+[ ] 选择下/上一图层；Ctrl+/ 锁定；Alt+单击眼睛仅显示该层；拖动排序；右键菜单。<br><br><b>其他</b>：D 默认颜色；X 交换颜色；Alt/Ctrl+Backspace 前景/背景色填充；Shift+F5 填充；Delete 清除选区（无选区时删除图层）；Ctrl+S 存储；Shift+Ctrl+S 存储为；Alt+Ctrl+I 图像大小；Alt+Ctrl+C 画布大小。<br><br>当前为基础编辑版本：单文档、RGB 8 位。尚无 CMYK、智能对象、路径、Camera Raw、专业色彩管理及原生 PSD 高级结构兼容。</p>`,
        "知道了",
      );
      break;
    case "demo": {
      if (!(await discard())) return;
      editor.newDocument(1400, 900, 300, "光与形 · 示例", false);
      editor.filePath = null;
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
function closeMenus() {
  document.querySelectorAll(".menu").forEach((m) => m.classList.remove("open"));
}
function hideContext() {
  $("#context-menu").classList.add("hidden");
}
function showContext(x, y, items) {
  const m = $("#context-menu");
  m.innerHTML = items
    .filter((item) => item !== false)
    .map((item) =>
      item
        ? `<button role="menuitem" data-action="${item[0]}">${item[1]}<kbd>${item[2] || ""}</kbd></button>`
        : "<hr>",
    )
    .join("");
  m.classList.remove("hidden");
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(0, Math.min(x, innerWidth - r.width - 4)) + "px";
  m.style.top = Math.max(0, Math.min(y, innerHeight - r.height - 4)) + "px";
}
document.addEventListener("click", (event) => {
  hideContext();
  const menuButton = event.target.closest(".menu>button");
  if (menuButton) {
    const parent = menuButton.parentElement,
      open = parent.classList.contains("open");
    closeMenus();
    parent.classList.toggle("open", !open);
    return;
  }
  closeMenus();
  const button = event.target.closest("[data-action]");
  if (button) run(() => action(button.dataset.action));
  const toolBtn = event.target.closest("[data-tool]");
  if (toolBtn) setTool(toolBtn.dataset.tool);
  const head = event.target.closest("[data-collapse]");
  if (head) {
    head.classList.toggle("collapsed");
    $("#" + head.dataset.collapse + "-panel").classList.toggle("hidden");
    updateView();
  }
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
    run(async () => {
      if (gesture || !editor.doc) return;
      const id = row.dataset.layer,
        l = editor.doc.layers.find((x) => x.id === id);
      if (!l) return;
      if (event.target.closest("[data-visible]")) {
        if (event.altKey) {
          const solo =
            l.visible && editor.doc.layers.every((x) => x === l || !x.visible);
          editor.doc.layers.forEach((x) => (x.visible = solo || x === l));
          editor.commit(solo ? "显示全部图层" : "仅显示此图层");
        } else {
          l.visible = !l.visible;
          editor.commit("切换图层可见性");
        }
        return;
      }
      if (event.target.closest("[data-lock]")) {
        l.locked = false;
        editor.commit("解锁图层");
        return;
      }
      const target = event.target.closest("[data-target]");
      if (target && (event.ctrlKey || event.metaKey)) {
        selectLayer(id);
        await action("layer-selection");
        return;
      }
      if (target) l.target = target.dataset.target;
      selectLayer(id);
    });
  const history = event.target.closest("[data-history]");
  if (history)
    run(() => {
      if (xform) cancelTransform();
      return editor.goto(+history.dataset.history);
    });
});
document.addEventListener("mouseover", (e) => {
  const b = e.target.closest(".menu>button"),
    open = document.querySelector(".menu.open");
  if (b && open && open !== b.parentElement) {
    open.classList.remove("open");
    b.parentElement.classList.add("open");
  }
});
document.addEventListener("dblclick", (event) => {
  if (event.target.closest(".layer-row .name")) run(() => action("rename"));
  else if (
    event.target.closest('.layer-row img[data-target="pixels"]') &&
    editor.active?.text
  )
    run(() => action("edit-text"));
  const t = event.target.closest("[data-tool]")?.dataset.tool;
  if (t === "hand") fit();
  if (t === "zoom") setZoom(1);
});
document.addEventListener("contextmenu", (e) => {
  if (!e.target.closest("input,textarea")) e.preventDefault();
});
$(".layer-list").addEventListener("contextmenu", (e) => {
  const row = e.target.closest("[data-layer]");
  if (!row || !editor.doc || working || gesture) return;
  selectLayer(row.dataset.layer);
  const l = editor.active;
  showContext(e.clientX, e.clientY, [
    ["layer-selection", "选择像素", "Ctrl+单击"],
    null,
    ["duplicate", "复制图层"],
    ["delete-layer", "删除图层"],
    ["rename", "重命名图层…"],
    !!l.text && ["edit-text", "编辑文字…"],
    null,
    ["mask", l.mask ? "切换蒙版 / 像素编辑" : "添加图层蒙版"],
    !!l.mask && ["remove-mask", "移除蒙版…"],
    ["lock", l.locked ? "解锁图层" : "锁定图层", "Ctrl+/"],
    null,
    ["merge", "向下合并", "Ctrl+E"],
  ]);
});
view.addEventListener("contextmenu", (e) => {
  if (!editor.doc || working || gesture) return;
  const sel = !!editor.selection;
  showContext(e.clientX, e.clientY, [
    ["undo", "还原", "Ctrl+Z"],
    ["redo", "重做", "Shift+Ctrl+Z"],
    null,
    sel && ["deselect", "取消选择", "Ctrl+D"],
    !sel && ["select-all", "全部选择", "Ctrl+A"],
    ["copy-selection", "通过拷贝的图层", "Ctrl+J"],
    ["fill", "填充…", "Shift+F5"],
    sel && ["clear", "清除", "Delete"],
    sel && ["crop", "裁剪"],
    null,
    ["transform", "自由变换", "Ctrl+T"],
    ["flip-x", "水平翻转"],
    ["flip-y", "垂直翻转"],
    null,
    ["fit", "按屏幕大小缩放", "Ctrl+0"],
    ["actual", "100%", "Ctrl+1"],
  ]);
});
const layerList = $(".layer-list"),
  LAYER_MIME = "application/x-compositor-layer";
const clearDrop = () =>
  layerList
    .querySelectorAll(".drop-above,.drop-below,.dragging")
    .forEach((r) => r.classList.remove("drop-above", "drop-below", "dragging"));
layerList.addEventListener("dragstart", (e) => {
  const row = e.target.closest("[data-layer]");
  if (!row || gesture || working) return e.preventDefault();
  e.dataTransfer.setData(LAYER_MIME, row.dataset.layer);
  e.dataTransfer.effectAllowed = "move";
  row.classList.add("dragging");
});
layerList.addEventListener("dragover", (e) => {
  if (!e.dataTransfer.types.includes(LAYER_MIME)) return;
  e.preventDefault();
  layerList
    .querySelectorAll(".drop-above,.drop-below")
    .forEach((r) => r.classList.remove("drop-above", "drop-below"));
  const row = e.target.closest("[data-layer]");
  if (!row) return;
  const r = row.getBoundingClientRect();
  row.classList.add(
    e.clientY < r.top + r.height / 2 ? "drop-above" : "drop-below",
  );
});
layerList.addEventListener("drop", (e) => {
  const id = e.dataTransfer.getData(LAYER_MIME);
  if (!id) return;
  e.preventDefault();
  const row = e.target.closest("[data-layer]"),
    above = row?.classList.contains("drop-above");
  clearDrop();
  if (row?.dataset.layer === id) return;
  run(() => {
    requireDoc();
    if (xform) commitTransform();
    const layers = editor.doc.layers,
      from = layers.findIndex((l) => l.id === id);
    let to = 0;
    if (row) {
      const t = layers.findIndex((l) => l.id === row.dataset.layer);
      to = above ? t + 1 : t;
      if (from < to) to--;
    }
    editor.doc.active = id;
    if (from === to) sync();
    else editor.reorder(from, to);
  });
});
layerList.addEventListener("dragend", clearDrop);
layerList.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.target.closest("[data-layer]")?.click();
  }
});
$("#blend").onchange = () =>
  run(() => {
    if (xform) commitTransform();
    editable().blend = $("#blend").value;
    editor.commit("混合模式");
  });
$("#layer-opacity").onchange = () =>
  run(() => {
    const v = clamp(+$("#layer-opacity").value, 0, 100);
    if (xform) commitTransform();
    editable().opacity = v / 100;
    editor.commit("图层不透明度");
  });
$("#opacity-scrub").addEventListener("pointerdown", (e) => {
  if (!editor.doc || working || gesture) return;
  let l;
  try {
    if (xform) commitTransform();
    l = editable();
  } catch (err) {
    notify(err.message, true);
    return;
  }
  const el = e.currentTarget,
    start = e.clientX,
    origin = l.opacity;
  el.setPointerCapture(e.pointerId);
  const move = (ev) => {
    const v = clamp(
      Math.round(origin * 100 + (ev.clientX - start) / 2),
      0,
      100,
    );
    l.opacity = v / 100;
    $("#layer-opacity").value = v;
    renderPixels();
  };
  const up = () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    if (l.opacity !== origin) editor.commit("图层不透明度");
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
});
for (const key of ["x", "y", "w", "h", "rotation", "dpi"])
  $("#prop-" + key).onchange = () =>
    run(() => {
      const v = +$("#prop-" + key).value;
      if (xform) commitTransform();
      const l = editable();
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
$("#brush-size-range").oninput = () =>
  setBrushSize(+$("#brush-size-range").value);
$("#brush-size").onchange = () => setBrushSize(+$("#brush-size").value);
$("#brush-opacity-range").oninput = () =>
  setToolOpacity(+$("#brush-opacity-range").value);
$("#brush-opacity").onchange = () => setToolOpacity(+$("#brush-opacity").value);
$("#hardness").oninput = () => setHardness(+$("#hardness").value);
$("#show-transform").onchange = () => drawOverlay();
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
const nav = $("#navigator");
function navPan(e) {
  if (!navGeom || !editor.doc) return;
  const r = nav.getBoundingClientRect(),
    x = ((e.clientX - r.left) * nav.width) / r.width,
    y = ((e.clientY - r.top) * nav.height) / r.height,
    doc = { x: (x - navGeom.ox) / navGeom.s, y: (y - navGeom.oy) / navGeom.s };
  pan = {
    x: view.clientWidth / 2 - doc.x * zoom,
    y: view.clientHeight / 2 - doc.y * zoom,
  };
  updateView();
}
nav.addEventListener("pointerdown", (e) => {
  if (!editor.doc) return;
  nav.setPointerCapture(e.pointerId);
  navPan(e);
  nav.onpointermove = navPan;
});
nav.addEventListener("pointerup", () => (nav.onpointermove = null));
view.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    if (!editor.doc) return;
    if (e.ctrlKey || e.metaKey || e.altKey)
      setZoom(zoom * Math.exp(-e.deltaY * 0.0015), screenEvent(e));
    else {
      pan.x -= e.shiftKey ? e.deltaY || e.deltaX : e.deltaX;
      pan.y -= e.shiftKey ? 0 : e.deltaY;
      clampPan();
      updateView();
    }
  },
  { passive: false },
);
view.addEventListener("dragover", (e) => {
  if (!e.dataTransfer.types.includes("Files")) return;
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
  if (!files.length) return;
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
const ALT_PICK_TOOLS = [
  "brush",
  "eraser",
  "fill",
  "gradient",
  "rect",
  "ellipse",
  "text",
];
view.addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || working || editor.busy || modalOpen || !editor.doc)
    return;
  view.focus();
  const p = point(e),
    s = screenEvent(e),
    capture = () => view.setPointerCapture(e.pointerId);
  if (space && (e.ctrlKey || e.altKey)) {
    stepZoom(e.altKey ? -1 : 1, s);
    return;
  }
  if (space || tool === "hand") {
    gesture = { kind: "pan", start: s, pan: { ...pan } };
    capture();
    updateCursor();
    return;
  }
  run(async () => {
    let l = requireDoc();
    if (tool === "zoom") {
      gesture = {
        kind: "zoom",
        start: s,
        zoom0: zoom,
        moved: false,
        alt: e.altKey,
      };
      capture();
      return;
    }
    if (tool === "eyedropper" || (e.altKey && ALT_PICK_TOOLS.includes(tool))) {
      const target = tool === "eyedropper" && e.altKey ? "bg" : "fg";
      pickColor(p, target);
      gesture = { kind: "pick", target };
      capture();
      return;
    }
    if (tool === "text") {
      const hit = topLayerAt(p, (x) => !!x.text && inPolygon(s, bounds(x)));
      if (hit) {
        if (hit.locked) throw Error("图层已锁定，请先解锁");
        selectLayer(hit.id);
        await textDialog(hit);
      } else await textDialog(null, p);
      return;
    }
    if (tool === "fill") {
      flood(p);
      return;
    }
    if (tool === "crop") {
      if (!cropRect) cropRect = fullRect();
      const hit = cropHit(s);
      gesture =
        hit.mode === "scale"
          ? { kind: "crop-scale", u: hit.u, v: hit.v, origin: { ...cropRect } }
          : hit.mode === "move"
            ? { kind: "crop-move", start: p, origin: { ...cropRect } }
            : { kind: "crop-new", start: p };
      capture();
      return;
    }
    if (tool === "select") {
      gesture =
        editor.selection &&
        inRect(p, editor.selection) &&
        !e.shiftKey &&
        !e.altKey
          ? {
              kind: "move-selection",
              start: p,
              origin: { ...editor.selection },
            }
          : {
              kind: "select",
              start: p,
              end: p,
              shift: e.shiftKey,
              alt: e.altKey,
            };
      capture();
      drawOverlay();
      return;
    }
    if (tool === "move") {
      const hit =
        xform || $("#show-transform").checked
          ? transformHit(l, s, !!xform)
          : null;
      if (hit && hit.mode !== "move") {
        editable();
        gesture = {
          kind: "xform",
          mode: hit.mode,
          u: hit.u,
          v: hit.v,
          l,
          start: p,
          origin: transformState(l),
          changed: false,
        };
      } else {
        if (!xform && (e.ctrlKey || e.metaKey || $("#auto-select").checked)) {
          const picked = topLayerAt(p);
          if (!picked) return;
          if (picked.id !== l.id) {
            selectLayer(picked.id);
            l = editor.active;
          }
        }
        editable();
        let dup = false;
        if (e.altKey && !xform) {
          editor.ensureCapacity(l.canvas.width, l.canvas.height);
          const copy = cloneLayer(l);
          editor.doc.layers.splice(editor.doc.layers.indexOf(l) + 1, 0, copy);
          editor.doc.active = copy.id;
          l = copy;
          dup = true;
        }
        gesture = {
          kind: "move",
          l,
          start: p,
          origin: transformState(l),
          changed: dup,
          dup,
        };
      }
      capture();
      return;
    }
    if (PAINT_TOOLS.includes(tool)) {
      editable();
      if (l.text) {
        l.text = null;
        notify("文字已栅格化，可撤销恢复");
      }
      const target = l.target === "mask" && l.mask ? l.mask : l.canvas,
        base = canvas(target.width, target.height),
        stroke = canvas(target.width, target.height),
        line = e.shiftKey && lastPaint?.id === l.id;
      base.getContext("2d").drawImage(target, 0, 0);
      gesture = {
        kind: "paint",
        l,
        target,
        base,
        stroke,
        last: localPoint(l, line ? lastPaint.p : p),
        erase: l.target === "mask" ? tool === "brush" : tool === "eraser",
      };
      if (line) brushStamp(stroke.getContext("2d"), gesture.last);
      strokeTo(gesture, p);
      capture();
      return;
    }
    gesture = {
      kind: tool,
      start: p,
      end: p,
      shift: e.shiftKey,
      alt: e.altKey,
    };
    capture();
  });
});
function constrainAngle(a, b) {
  const angle =
      Math.round(Math.atan2(b.y - a.y, b.x - a.x) / (Math.PI / 4)) *
      (Math.PI / 4),
    len = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: a.x + Math.cos(angle) * len, y: a.y + Math.sin(angle) * len };
}
view.addEventListener("pointermove", (e) => {
  const s = screenEvent(e),
    p = point(e),
    g = gesture;
  hover = { s, p, alt: e.altKey };
  $("#cursor-pos").textContent = editor.doc
    ? `X ${Math.round(p.x)} · Y ${Math.round(p.y)}`
    : "X – · Y –";
  if (!g) {
    updateCursor();
    drawOverlay();
    drawRulers();
    return;
  }
  const dx0 = p.x - (g.start?.x ?? p.x),
    dy0 = p.y - (g.start?.y ?? p.y);
  switch (g.kind) {
    case "pan":
      pan.x = g.pan.x + s.x - g.start.x;
      pan.y = g.pan.y + s.y - g.start.y;
      clampPan();
      updateView();
      return;
    case "zoom": {
      const dx = s.x - g.start.x;
      if (Math.abs(dx) > 3) g.moved = true;
      if (g.moved) setZoom(g.zoom0 * Math.exp(dx * 0.01), g.start);
      return;
    }
    case "pick":
      pickColor(p, g.target);
      break;
    case "move": {
      let dx = dx0,
        dy = dy0;
      if (e.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      g.l.x = g.origin.x + dx;
      g.l.y = g.origin.y + dy;
      g.changed = g.changed || dx !== 0 || dy !== 0;
      renderPixels();
      break;
    }
    case "xform":
      if (g.mode === "rotate") applyRotate(g, p, e);
      else applyScale(g, p, e);
      g.changed = true;
      renderPixels();
      break;
    case "paint":
      strokeTo(g, p);
      break;
    case "move-selection":
      editor.selection = {
        ...g.origin,
        x: g.origin.x + Math.round(dx0),
        y: g.origin.y + Math.round(dy0),
      };
      break;
    case "crop-move":
      cropRect = {
        ...g.origin,
        x: Math.round(g.origin.x + dx0),
        y: Math.round(g.origin.y + dy0),
        touched: true,
      };
      break;
    case "crop-scale": {
      const o = g.origin;
      let x1 = o.x,
        y1 = o.y,
        x2 = o.x + o.w,
        y2 = o.y + o.h;
      if (g.u === 0) x1 = p.x;
      if (g.u === 1) x2 = p.x;
      if (g.v === 0) y1 = p.y;
      if (g.v === 1) y2 = p.y;
      cropRect = {
        x: Math.round(Math.min(x1, x2)),
        y: Math.round(Math.min(y1, y2)),
        w: Math.max(1, Math.round(Math.abs(x2 - x1))),
        h: Math.max(1, Math.round(Math.abs(y2 - y1))),
        touched: true,
      };
      break;
    }
    case "crop-new": {
      const r = norm(g.start, p, e.shiftKey);
      if (r.w >= 1 && r.h >= 1)
        cropRect = {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.w) || 1,
          h: Math.round(r.h) || 1,
          touched: true,
        };
      break;
    }
    default:
      g.end =
        g.kind === "gradient" && e.shiftKey ? constrainAngle(g.start, p) : p;
      g.shift = e.shiftKey;
      g.alt = e.altKey;
  }
  drawOverlay();
  drawRulers();
});
view.addEventListener("pointerleave", () => {
  if (gesture) return;
  hover = null;
  $("#cursor-pos").textContent = "X – · Y –";
  drawOverlay();
  drawRulers();
});
function finishGesture() {
  const g = gesture;
  if (!g) return;
  gesture = null;
  updateCursor();
  if (g.kind === "move" || g.kind === "xform") {
    if (xform) {
      if (g.changed) xform.changed = true;
      sync();
    } else if (g.changed)
      editor.commit(
        g.dup
          ? "复制图层"
          : g.kind === "move"
            ? "移动图层"
            : g.mode === "rotate"
              ? "旋转图层"
              : "缩放图层",
      );
    else drawOverlay();
    return;
  }
  if (g.kind === "paint") {
    lastPaint = { id: g.l.id, p: g.lastWorld };
    editor.commit(
      g.l.target === "mask" ? "绘画蒙版" : g.erase ? "橡皮擦" : "画笔",
    );
    return;
  }
  if (g.kind === "zoom") {
    if (!g.moved) stepZoom(g.alt ? -1 : 1, g.start);
    return;
  }
  if (g.kind === "pick") {
    notify(g.target === "bg" ? "已拾取背景色" : "已拾取前景色");
    return;
  }
  if (
    g.kind === "pan" ||
    g.kind === "move-selection" ||
    g.kind.startsWith("crop")
  ) {
    updateCommitGroup();
    drawOverlay();
    return;
  }
  const r = norm(g.start, g.end || g.start, g.shift, g.alt);
  if (g.kind === "select") {
    setSelection(r.w > 1 && r.h > 1 ? r : null);
    return;
  }
  if (g.kind === "gradient") {
    drawOverlay();
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
  if (["rect", "ellipse"].includes(g.kind)) {
    drawOverlay();
    if (r.w < 1 || r.h < 1) return;
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
function sizeStep(size, up) {
  const s = up ? size : size - 1;
  return s < 10 ? 1 : s < 100 ? 10 : s < 200 ? 25 : s < 500 ? 50 : 100;
}
function nudge(dx, dy) {
  if (tool === "select" && editor.selection) {
    editor.selection = {
      ...editor.selection,
      x: editor.selection.x + dx,
      y: editor.selection.y + dy,
    };
    drawOverlay();
    return;
  }
  if (tool === "crop" && cropRect) {
    cropRect = {
      ...cropRect,
      x: cropRect.x + dx,
      y: cropRect.y + dy,
      touched: true,
    };
    drawOverlay();
    return;
  }
  const l = editable();
  l.x += dx;
  l.y += dy;
  if (xform) {
    xform.changed = true;
    sync();
  } else editor.commit("微移图层");
}
document.addEventListener("keydown", (e) => {
  if (modalOpen) return;
  if (e.key === "Alt") {
    e.preventDefault();
    if (hover) {
      hover.alt = true;
      updateCursor();
    }
  }
  if (e.target.matches("input,textarea,select")) {
    if (
      e.key === "Enter" &&
      e.target.closest(".options,.properties,.layer-controls")
    )
      e.target.blur();
    return;
  }
  const ctrl = e.ctrlKey || e.metaKey,
    key = e.key.toLowerCase(),
    code = e.code;
  if (e.key === "Escape") {
    closeMenus();
    hideContext();
    if (xform) cancelTransform();
    else if (tool === "crop" && cropRect?.touched) run(() => action("cancel"));
    else if (document.body.classList.contains("fullscreen")) {
      document.body.classList.remove("fullscreen");
      updateView();
    } else setSelection(null);
    return;
  }
  if (e.key === "Enter") {
    if (xform || (tool === "crop" && cropRect)) {
      e.preventDefault();
      run(() => action("commit"));
    }
    return;
  }
  if (code === "Space") {
    e.preventDefault();
    if (!space) {
      space = true;
      updateCursor();
      drawOverlay();
    }
    return;
  }
  if (e.key === "Tab" && !ctrl && !e.altKey) {
    e.preventDefault();
    run(() => action("panels"));
    return;
  }
  if (e.key === "F5" && e.shiftKey) {
    e.preventDefault();
    run(() => action("fill"));
    return;
  }
  let name = null;
  if (ctrl) {
    if (code === "BracketLeft") name = e.shiftKey ? "back" : "down";
    else if (code === "BracketRight") name = e.shiftKey ? "front" : "up";
    else if (key === "backspace") name = "fill-background";
    else if (code === "Slash") name = "lock";
    else if (e.altKey && key === "i") name = "image-size";
    else if (e.altKey && key === "c") name = "size";
    else if (e.altKey && e.shiftKey && key === "w") name = "export-png";
    else if (e.altKey && key === "0") name = "actual";
    else
      name = {
        n: e.shiftKey ? "add" : "new",
        o: "open",
        s: e.shiftKey ? "save-as" : "save",
        z: e.shiftKey ? "redo" : "undo",
        y: "redo",
        j: "copy-selection",
        a: "select-all",
        d: e.shiftKey ? "reselect" : "deselect",
        t: "transform",
        e: "merge",
        i: e.shiftKey ? null : "invert",
        u: e.shiftKey ? "grayscale" : null,
        r: "rulers",
        0: "fit",
        1: "actual",
        "=": "zoom-in",
        "+": "zoom-in",
        "-": "zoom-out",
      }[key];
    if (name) {
      e.preventDefault();
      run(() => action(name));
    }
    return;
  }
  if (e.altKey) {
    if (key === "backspace") name = "fill-selection";
    else if (code === "BracketLeft") name = "layer-below";
    else if (code === "BracketRight") name = "layer-above";
    if (name) run(() => action(name));
    e.preventDefault();
    return;
  }
  if (key === "delete" || key === "backspace") {
    e.preventDefault();
    run(() => action(editor.selection ? "clear" : "delete-layer"));
    return;
  }
  if (key === "x") return run(() => action("swap"));
  if (key === "d") return run(() => action("default-colors"));
  if (key === "f") return run(() => action("fullscreen"));
  if (code === "BracketLeft" || code === "BracketRight") {
    const up = code === "BracketRight";
    if (e.shiftKey) setHardness(+$("#hardness").value + (up ? 25 : -25));
    else {
      const size = +$("#brush-size").value;
      setBrushSize(size + (up ? 1 : -1) * sizeStep(size, up));
    }
    return;
  }
  if (/^Digit[0-9]$/.test(code) && !e.shiftKey) {
    const d = +code.slice(5),
      v = d === 0 ? 100 : d * 10;
    if (tool === "move")
      run(() => {
        if (xform) commitTransform();
        editable().opacity = v / 100;
        editor.commit("图层不透明度");
      });
    else {
      setToolOpacity(v);
      notify(`工具不透明度 ${v}%`);
    }
    return;
  }
  const t = tools.find(
    (t) => t[3].toLowerCase() === (e.shiftKey ? "shift+" : "") + key,
  );
  if (t) {
    e.preventDefault();
    setTool(t[0]);
    return;
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    run(() =>
      nudge(
        e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0,
        e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0,
      ),
    );
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    space = false;
    updateCursor();
    drawOverlay();
  }
  if (e.key === "Alt" && hover) {
    hover.alt = false;
    updateCursor();
  }
});
new ResizeObserver(() => updateView()).observe(view);
setInterval(() => {
  if (!editor.doc || !(editor.selection || gesture?.kind === "select")) return;
  if (gesture?.kind === "paint") return;
  ants = (ants + 1) % 8;
  drawOverlay();
}, 120);
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
    if (xform) commitTransform();
    const values = await dialog(
      "关闭软件",
      '<p class="description">当前文档尚未保存。选择存储并关闭，或先取消继续编辑。</p><label>操作<select name="mode"><option value="save">存储项目并关闭</option><option value="discard">放弃修改并关闭</option></select></label>',
      "继续",
    );
    if (!values) return;
    if (values.mode === "save" && !(await saveProject(false))) return;
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
    state: () => ({
      tool,
      zoom,
      pan: { ...pan },
      transforming: !!xform,
      cropRect: cropRect && { ...cropRect },
      docPath: editor.filePath,
    }),
  };
