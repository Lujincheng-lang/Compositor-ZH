import JSZip from "jszip";
import { readPsd, writePsd, initializeCanvas } from "ag-psd";

export const MODES = [
  ["source-over", "正常"],
  ["multiply", "正片叠底"],
  ["screen", "滤色"],
  ["overlay", "叠加"],
  ["darken", "变暗"],
  ["lighten", "变亮"],
  ["color-dodge", "颜色减淡"],
  ["color-burn", "颜色加深"],
  ["hard-light", "强光"],
  ["soft-light", "柔光"],
  ["difference", "差值"],
  ["exclusion", "排除"],
  ["hue", "色相"],
  ["saturation", "饱和度"],
  ["color", "颜色"],
  ["luminosity", "明度"],
];
const PSD_MODES = {
  "source-over": "normal",
  multiply: "multiply",
  screen: "screen",
  overlay: "overlay",
  darken: "darken",
  lighten: "lighten",
  "color-dodge": "color dodge",
  "color-burn": "color burn",
  "hard-light": "hard light",
  "soft-light": "soft light",
  difference: "difference",
  exclusion: "exclusion",
  hue: "hue",
  saturation: "saturation",
  color: "color",
  luminosity: "luminosity",
};
export const canvas = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};
initializeCanvas(canvas);
export async function loadImage(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}
export function checkSize(w, h) {
  if (
    !Number.isInteger(w) ||
    !Number.isInteger(h) ||
    w < 1 ||
    h < 1 ||
    w > 8192 ||
    h > 8192 ||
    w * h > 16777216
  )
    throw Error("画布限制：边长 1–8192 px，总像素不超过 1600 万");
}
export function layer(name, w, h) {
  checkSize(w, h);
  return {
    id: crypto.randomUUID(),
    name,
    visible: true,
    locked: false,
    opacity: 1,
    blend: "source-over",
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    canvas: canvas(w, h),
    mask: null,
    target: "pixels",
    text: null,
  };
}
export function localPoint(l, p) {
  const a = (-l.rotation * Math.PI) / 180,
    dx = p.x - l.x,
    dy = p.y - l.y;
  return {
    x: (dx * Math.cos(a) - dy * Math.sin(a)) / l.scaleX,
    y: (dx * Math.sin(a) + dy * Math.cos(a)) / l.scaleY,
  };
}
export function worldPoint(l, p) {
  const a = (l.rotation * Math.PI) / 180;
  return {
    x: l.x + p.x * l.scaleX * Math.cos(a) - p.y * l.scaleY * Math.sin(a),
    y: l.y + p.x * l.scaleX * Math.sin(a) + p.y * l.scaleY * Math.cos(a),
  };
}
export function pixels(l) {
  if (!l.mask) return l.canvas;
  const c = canvas(l.canvas.width, l.canvas.height),
    ctx = c.getContext("2d");
  ctx.drawImage(l.canvas, 0, 0);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(l.mask, 0, 0);
  return c;
}
export function drawLayer(ctx, l, appearance = true) {
  if (!l.visible) return;
  ctx.save();
  ctx.globalAlpha = appearance ? l.opacity : 1;
  ctx.globalCompositeOperation = appearance ? l.blend : "source-over";
  ctx.translate(l.x, l.y);
  ctx.rotate((l.rotation * Math.PI) / 180);
  ctx.scale(l.scaleX, l.scaleY);
  ctx.drawImage(pixels(l), 0, 0);
  ctx.restore();
}
export function composite(doc, background = null) {
  const c = canvas(doc.width, doc.height),
    ctx = c.getContext("2d");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  doc.layers.forEach((l) => drawLayer(ctx, l));
  return c;
}
function serializeLayer(l) {
  return {
    ...l,
    canvas: l.canvas.toDataURL(),
    mask: l.mask?.toDataURL() || null,
  };
}
export async function deserializeLayer(raw) {
  const img = await loadImage(raw.canvas);
  checkSize(img.width, img.height);
  const l = layer(String(raw.name || "图层"), img.width, img.height);
  for (const key of [
    "id",
    "name",
    "visible",
    "locked",
    "opacity",
    "blend",
    "x",
    "y",
    "scaleX",
    "scaleY",
    "rotation",
    "text",
    "target",
  ])
    if (raw[key] !== undefined) l[key] = raw[key];
  if (
    typeof l.id !== "string" ||
    typeof l.name !== "string" ||
    typeof l.visible !== "boolean" ||
    typeof l.locked !== "boolean" ||
    !MODES.some((m) => m[0] === l.blend) ||
    !["x", "y", "scaleX", "scaleY", "rotation", "opacity"].every((k) =>
      Number.isFinite(l[k]),
    ) ||
    l.opacity < 0 ||
    l.opacity > 1 ||
    Math.abs(l.scaleX) < 0.001 ||
    Math.abs(l.scaleY) < 0.001 ||
    Math.abs(l.scaleX) > 1000 ||
    Math.abs(l.scaleY) > 1000
  )
    throw Error("图层参数不合法");
  l.canvas.getContext("2d").drawImage(img, 0, 0);
  if (raw.mask) {
    const mask = await loadImage(raw.mask);
    if (mask.width !== img.width || mask.height !== img.height)
      throw Error("蒙版尺寸不匹配");
    l.mask = canvas(img.width, img.height);
    l.mask.getContext("2d").drawImage(mask, 0, 0);
  }
  return l;
}
export class Editor {
  constructor() {
    this.doc = null;
    this.history = [];
    this.index = -1;
    this.dirty = false;
    this.selection = null;
    this.onchange = () => {};
    this.busy = false;
  }
  get active() {
    return this.doc?.layers.find((l) => l.id === this.doc.active);
  }
  notify() {
    this.onchange();
  }
  newDocument(w, h, dpi = 72, name = "未标题", white = false) {
    checkSize(w, h);
    if (!Number.isFinite(dpi) || dpi < 1 || dpi > 9600)
      throw Error("分辨率需为 1–9600");
    const l = layer(white ? "背景" : "图层 1", w, h);
    if (white) {
      const c = l.canvas.getContext("2d");
      c.fillStyle = "#fff";
      c.fillRect(0, 0, w, h);
    }
    this.doc = { width: w, height: h, dpi, name, layers: [l], active: l.id };
    this.selection = null;
    this.history = [];
    this.index = -1;
    this.commit("新建文档");
    this.markSaved();
  }
  snapshot() {
    return {
      width: this.doc.width,
      height: this.doc.height,
      dpi: this.doc.dpi,
      name: this.doc.name,
      active: this.doc.active,
      layers: this.doc.layers.map(serializeLayer),
    };
  }
  commit(label) {
    if (!this.doc) return;
    this.history.splice(this.index + 1);
    const snapshot = this.snapshot();
    this.history.push({
      label,
      snapshot,
      size: JSON.stringify(snapshot).length * 2,
    });
    let size = this.history.reduce((s, h) => s + h.size, 0);
    while (
      this.history.length > 1 &&
      (this.history.length > 30 || size > 96 * 1024 * 1024)
    )
      size -= this.history.shift().size;
    this.index = this.history.length - 1;
    this.dirty = true;
    this.notify();
  }
  markSaved() {
    this.saved = JSON.stringify(this.snapshot());
    this.dirty = false;
    this.notify();
  }
  async restore(raw) {
    checkSize(raw.width, raw.height);
    if (
      !Array.isArray(raw.layers) ||
      raw.layers.length < 1 ||
      raw.layers.length > 100
    )
      throw Error("项目需包含 1–100 个图层");
    if (!Number.isFinite(raw.dpi) || raw.dpi < 1 || raw.dpi > 9600)
      throw Error("项目分辨率无效");
    const layers = [];
    let total = 0;
    const ids = new Set();
    for (const item of raw.layers) {
      const l = await deserializeLayer(item);
      total += l.canvas.width * l.canvas.height;
      if (total > 80000000) throw Error("图层总像素超过 8000 万");
      if (ids.has(l.id)) throw Error("图层 ID 重复");
      ids.add(l.id);
      layers.push(l);
    }
    if (!ids.has(raw.active)) throw Error("当前图层不存在");
    this.doc = { ...raw, name: String(raw.name || "未标题"), layers };
    this.selection = null;
  }
  async goto(index) {
    if (index < 0 || index >= this.history.length || this.busy) return;
    this.busy = true;
    try {
      await this.restore(this.history[index].snapshot);
      this.index = index;
      this.dirty = JSON.stringify(this.snapshot()) !== this.saved;
      this.notify();
    } finally {
      this.busy = false;
    }
  }
  undo() {
    return this.goto(this.index - 1);
  }
  redo() {
    return this.goto(this.index + 1);
  }
  ensureCapacity(w, h) {
    if (
      this.doc.layers.length >= 100 ||
      this.doc.layers.reduce(
        (s, l) => s + l.canvas.width * l.canvas.height,
        0,
      ) +
        w * h >
        80000000
    )
      throw Error("达到图层限制：100 层 / 8000 万总像素");
  }
  add(l, label = "新建图层") {
    this.ensureCapacity(l.canvas.width, l.canvas.height);
    const pos = this.doc.layers.indexOf(this.active) + 1;
    this.doc.layers.splice(pos, 0, l);
    this.doc.active = l.id;
    this.commit(label);
  }
  duplicate() {
    const l = this.active;
    if (!l) return;
    const copy = layer(l.name + " 副本", l.canvas.width, l.canvas.height);
    Object.assign(copy, {
      ...l,
      id: copy.id,
      name: copy.name,
      canvas: copy.canvas,
      mask: null,
    });
    copy.canvas.getContext("2d").drawImage(l.canvas, 0, 0);
    if (l.mask) {
      copy.mask = canvas(l.mask.width, l.mask.height);
      copy.mask.getContext("2d").drawImage(l.mask, 0, 0);
    }
    if (l.text) copy.text = structuredClone(l.text);
    this.add(copy, "复制图层");
  }
  remove() {
    if (this.doc.layers.length === 1) throw Error("请保留至少一个图层");
    const i = this.doc.layers.indexOf(this.active);
    this.doc.layers.splice(i, 1);
    this.doc.active = this.doc.layers[Math.max(0, i - 1)].id;
    this.commit("删除图层");
  }
  moveLayer(direction) {
    const i = this.doc.layers.indexOf(this.active),
      j = i + direction;
    if (j < 0 || j >= this.doc.layers.length) return;
    [this.doc.layers[i], this.doc.layers[j]] = [
      this.doc.layers[j],
      this.doc.layers[i],
    ];
    this.commit("调整图层顺序");
  }
  mask() {
    const l = this.active;
    if (l.locked) throw Error("图层已锁定");
    if (!l.mask) {
      l.mask = canvas(l.canvas.width, l.canvas.height);
      const c = l.mask.getContext("2d");
      c.fillStyle = "#fff";
      c.fillRect(0, 0, l.mask.width, l.mask.height);
    }
    l.target = l.target === "mask" ? "pixels" : "mask";
    this.commit("切换图层蒙版");
  }
  merge() {
    const i = this.doc.layers.indexOf(this.active);
    if (i < 1) throw Error("下方没有可合并图层");
    const pair = this.doc.layers.slice(i - 1, i + 1);
    if (pair.some((l) => l.locked || l.blend !== "source-over" || !l.visible))
      throw Error("合并要求两个图层可见、未锁定且为正常混合模式");
    const l = layer(pair[0].name, this.doc.width, this.doc.height);
    const ctx = l.canvas.getContext("2d");
    pair.forEach((p) => drawLayer(ctx, p));
    this.doc.layers.splice(i - 1, 2, l);
    this.doc.active = l.id;
    this.commit("向下合并");
  }
  async importImage(bytes, name, replace = false) {
    const img = await loadImage(URL.createObjectURL(new Blob([bytes])));
    try {
      checkSize(img.width, img.height);
      if (replace || !this.doc)
        this.newDocument(
          img.width,
          img.height,
          72,
          name.replace(/\.[^.]+$/, ""),
        );
      const l = layer(name, img.width, img.height);
      l.canvas.getContext("2d").drawImage(img, 0, 0);
      l.x = Math.round((this.doc.width - img.width) / 2);
      l.y = Math.round((this.doc.height - img.height) / 2);
      if (replace) {
        this.doc.layers = [l];
        this.doc.active = l.id;
        this.commit("打开图片");
        this.markSaved();
      } else this.add(l, "置入图片");
    } finally {
      URL.revokeObjectURL(img.src);
    }
  }
  async saveProject() {
    const zip = new JSZip(),
      raw = this.snapshot();
    raw.format = "org.compositor.windows";
    raw.version = 1;
    for (const l of raw.layers) {
      zip.file("images/" + l.id + ".png", l.canvas.split(",")[1], {
        base64: true,
      });
      l.canvas = "images/" + l.id + ".png";
      if (l.mask) {
        zip.file("images/" + l.id + ".mask.png", l.mask.split(",")[1], {
          base64: true,
        });
        l.mask = "images/" + l.id + ".mask.png";
      }
    }
    zip.file("manifest.json", JSON.stringify(raw));
    return zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 3 },
    });
  }
  async openProject(bytes) {
    const zip = await JSZip.loadAsync(bytes),
      manifest = zip.file("manifest.json");
    if (!manifest) throw Error("项目缺少 manifest.json");
    const manifestText = await manifest.async("string");
    if (manifestText.length > 4 * 1024 * 1024) throw Error("项目清单过大");
    const raw = JSON.parse(manifestText);
    if (raw.format !== "org.compositor.windows" || raw.version !== 1)
      throw Error("项目格式或版本不支持");
    if (!Array.isArray(raw.layers) || raw.layers.length > 100)
      throw Error("图层清单不合法");
    let total = 0;
    for (const l of raw.layers)
      for (const k of ["canvas", "mask"])
        if (l[k]) {
          if (l[k] !== `images/${l.id}${k === "mask" ? ".mask" : ""}.png`)
            throw Error("项目资源路径不合法");
          const file = zip.file(l[k]);
          if (!file) throw Error("缺失图层图片");
          const data = await file.async("uint8array");
          total += data.length;
          if (total > 512 * 1024 * 1024) throw Error("解压图片总量过大");
          l[k] = "data:image/png;base64," + (await file.async("base64"));
        }
    await this.restore(raw);
    this.history = [];
    this.index = -1;
    this.commit("打开项目");
    this.markSaved();
  }
  async exportPsd() {
    const children = this.doc.layers
      .slice()
      .reverse()
      .map((l) => {
        const c = canvas(this.doc.width, this.doc.height);
        drawLayer(c.getContext("2d"), { ...l, visible: true }, false);
        return {
          name: l.name,
          hidden: !l.visible,
          opacity: l.opacity,
          blendMode: PSD_MODES[l.blend],
          canvas: c,
        };
      });
    return new Uint8Array(
      writePsd({
        width: this.doc.width,
        height: this.doc.height,
        canvas: composite(this.doc),
        children,
        imageResources: {
          resolutionInfo: {
            horizontalResolution: this.doc.dpi,
            horizontalResolutionUnit: "PPI",
            widthUnit: "Inches",
            verticalResolution: this.doc.dpi,
            verticalResolutionUnit: "PPI",
            heightUnit: "Inches",
          },
        },
      }),
    );
  }
  async importComp(input) {
    const m = input.manifest;
    if (
      m.format !== "com.compositor.project" ||
      !Number.isInteger(m.version) ||
      m.version < 1 ||
      m.version > 11 ||
      m.colorSpace !== "sRGB"
    )
      throw Error("不支持的 Compositor 项目格式、版本或工作色域");
    checkSize(m.width, m.height);
    if (!Array.isArray(m.layers) || !m.layers.length || m.layers.length > 100)
      throw Error("图层数量不支持");
    const names = [
      "Normal",
      "Multiply",
      "Screen",
      "Overlay",
      "Darken",
      "Lighten",
      "Color Dodge",
      "Color Burn",
      "Hard Light",
      "Soft Light",
      "Difference",
      "Exclusion",
      "Hue",
      "Saturation",
      "Color",
      "Luminosity",
    ];
    const modes = [
      "source-over",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
      "hue",
      "saturation",
      "color",
      "luminosity",
    ];
    const leaves = [];
    for (const r of m.layers) {
      if (
        r.isGroup ||
        r.parentID ||
        r.adjustment ||
        r.maskSourceID ||
        r.text ||
        r.shape ||
        r.effects ||
        r.maskPlacement ||
        r.maskLinked === false
      )
        throw Error(
          "此 .comp 含组、文字、效果、矢量形状或高级蒙版。当前仅支持普通像素图层及链接栅格蒙版；原文件保持原样。",
        );
      const mode = modes[names.indexOf(r.blendMode || "Normal")];
      if (!mode) throw Error("尚未支持混合模式：" + r.blendMode);
      const t = r.transform;
      if (
        !t ||
        !Array.isArray(t.origin) ||
        !Array.isArray(t.size) ||
        t.origin.length !== 2 ||
        t.size.length !== 2 ||
        t.size.some((v) => !Number.isFinite(v) || v <= 0)
      )
        throw Error("图层变换不合法");
      let img = null,
        url = null;
      if (r.imageFile) {
        url = URL.createObjectURL(new Blob([input.assets[r.imageFile]]));
        try {
          img = await loadImage(url);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      const l = layer(
        r.name || "图层",
        img?.width || m.width,
        img?.height || m.height,
      );
      l.id = r.id;
      if (img) l.canvas.getContext("2d").drawImage(img, 0, 0);
      Object.assign(l, {
        x: t.origin[0],
        y: t.origin[1],
        scaleX: t.size[0] / l.canvas.width,
        scaleY: t.size[1] / l.canvas.height,
        rotation: t.rotation || 0,
        visible: r.isVisible !== false,
        opacity: r.opacity ?? 1,
        blend: mode,
      });
      if (t.flipX) {
        const p = worldPoint(l, { x: l.canvas.width, y: 0 });
        l.x = p.x;
        l.y = p.y;
        l.scaleX *= -1;
      }
      if (t.flipY) {
        const p = worldPoint(l, { x: 0, y: l.canvas.height });
        l.x = p.x;
        l.y = p.y;
        l.scaleY *= -1;
      }
      if (r.maskFile) {
        if (r.maskEnabled === false)
          throw Error("当前不支持保存禁用的原版蒙版，请先在原版启用蒙版");
        url = URL.createObjectURL(new Blob([input.assets[r.maskFile]]));
        let mask;
        try {
          mask = await loadImage(url);
        } finally {
          URL.revokeObjectURL(url);
        }
        l.mask = canvas(l.canvas.width, l.canvas.height);
        const ctx = l.mask.getContext("2d");
        ctx.drawImage(mask, 0, 0, l.mask.width, l.mask.height);
        const rgba = ctx.getImageData(0, 0, l.mask.width, l.mask.height);
        for (let j = 0; j < rgba.data.length; j += 4) {
          rgba.data[j + 3] = rgba.data[j];
          rgba.data[j] = rgba.data[j + 1] = rgba.data[j + 2] = 255;
        }
        ctx.putImageData(rgba, 0, 0);
      }
      leaves.push(serializeLayer(l));
    }
    const raw = {
      width: m.width,
      height: m.height,
      dpi: m.resolution || 72,
      name: input.name || "Compositor 项目",
      active: leaves.some((l) => l.id === m.activeLayerID)
        ? m.activeLayerID
        : leaves.at(-1).id,
      layers: leaves,
    };
    await this.restore(raw);
    this.history = [];
    this.index = -1;
    this.commit("导入原版 Compositor");
    this.markSaved();
  }
  async importPsd(bytes, name) {
    // Read only the header before decoding any layer pixels.
    const header = new DataView(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    );
    if (
      bytes.length < 26 ||
      header.getUint32(0) !== 0x38425053 ||
      header.getUint16(4) !== 1
    )
      throw Error("不支持的 PSD / PSB 文件头");
    checkSize(header.getUint32(18), header.getUint32(14));
    if (header.getUint16(22) !== 8 || header.getUint16(24) !== 3)
      throw Error("当前仅支持 RGB 8 位 PSD，请在 PS 中转换后另存");
    const psd = readPsd(bytes, { useImageData: false });
    checkSize(psd.width, psd.height);
    const leaves = [];
    let advanced = false;
    function visit(nodes, parentOpacity = 1, parentHidden = false) {
      for (const p of nodes || []) {
        if (p.children) {
          advanced = true;
          visit(
            p.children,
            parentOpacity * (p.opacity ?? 1),
            parentHidden || p.hidden,
          );
          continue;
        }
        if (
          p.text ||
          p.effects ||
          p.adjustment ||
          p.mask ||
          p.vectorMask ||
          p.clipping
        )
          advanced = true;
        const source = p.canvas;
        if (!source) {
          advanced = true;
          continue;
        }
        checkSize(source.width, source.height);
        const l = layer(p.name || "PSD 图层", source.width, source.height);
        l.canvas.getContext("2d").drawImage(source, 0, 0);
        l.x = p.left || 0;
        l.y = p.top || 0;
        l.visible = !(p.hidden || parentHidden);
        l.opacity = (p.opacity ?? 1) * parentOpacity;
        l.blend =
          Object.entries(PSD_MODES).find(([, v]) => v === p.blendMode)?.[0] ||
          "source-over";
        if (p.blendMode && !Object.values(PSD_MODES).includes(p.blendMode))
          advanced = true;
        leaves.push(l);
      }
    }
    visit(psd.children);
    if (advanced)
      throw Error(
        "此 PSD 包含组、文字、蒙版、效果或调整等高级结构。当前版本拒绝有损打开；请在 PS 导出普通栅格图层 PSD，或 PNG 后置入。",
      );
    if (!leaves.length && psd.canvas) {
      const l = layer("合成图像", psd.width, psd.height);
      l.canvas.getContext("2d").drawImage(psd.canvas, 0, 0);
      leaves.push(l);
    }
    if (!leaves.length) throw Error("PSD 无可读取栅格内容");
    const raw = {
      width: psd.width,
      height: psd.height,
      dpi: psd.imageResources?.resolutionInfo?.horizontalResolution || 72,
      name: name.replace(/\.psd$/i, ""),
      active: leaves[0].id,
      layers: leaves.reverse().map(serializeLayer),
    };
    await this.restore(raw);
    this.history = [];
    this.index = -1;
    this.commit("打开栅格 PSD");
    this.markSaved();
  }
  applyFilter(type, value = 100) {
    const l = this.active;
    if (l.locked) throw Error("图层已锁定");
    const c = canvas(l.canvas.width, l.canvas.height),
      ctx = c.getContext("2d");
    const filters = {
      invert: "invert(1)",
      grayscale: "grayscale(1)",
      brightness: `brightness(${value}%)`,
      contrast: `contrast(${value}%)`,
      saturate: `saturate(${value}%)`,
      blur: `blur(${value}px)`,
    };
    if (!filters[type]) throw Error("未知滤镜");
    ctx.filter = filters[type];
    ctx.drawImage(l.canvas, 0, 0);
    ctx.filter = "none";
    const target = l.canvas.getContext("2d");
    target.save();
    if (this.selection) {
      const corners = [
        { x: this.selection.x, y: this.selection.y },
        { x: this.selection.x + this.selection.w, y: this.selection.y },
        {
          x: this.selection.x + this.selection.w,
          y: this.selection.y + this.selection.h,
        },
        { x: this.selection.x, y: this.selection.y + this.selection.h },
      ].map((p) => localPoint(l, p));
      target.beginPath();
      corners.forEach((p, i) =>
        i ? target.lineTo(p.x, p.y) : target.moveTo(p.x, p.y),
      );
      target.closePath();
      target.clip();
    }
    target.clearRect(0, 0, l.canvas.width, l.canvas.height);
    target.drawImage(c, 0, 0);
    target.restore();
    l.text = null;
    this.commit("滤镜 / " + type);
  }
  crop() {
    const r = this.selection;
    if (!r) throw Error("先用矩形选框选定裁切区域");
    const x = Math.max(0, Math.floor(r.x)),
      y = Math.max(0, Math.floor(r.y)),
      w = Math.min(this.doc.width - x, Math.round(r.w)),
      h = Math.min(this.doc.height - y, Math.round(r.h));
    checkSize(w, h);
    this.doc.layers = this.doc.layers.map((l) => {
      const out = layer(l.name, w, h),
        c = canvas(this.doc.width, this.doc.height);
      drawLayer(c.getContext("2d"), { ...l, visible: true }, false);
      out.canvas.getContext("2d").drawImage(c, x, y, w, h, 0, 0, w, h);
      Object.assign(out, {
        id: l.id,
        visible: l.visible,
        locked: l.locked,
        opacity: l.opacity,
        blend: l.blend,
      });
      return out;
    });
    this.doc.width = w;
    this.doc.height = h;
    this.selection = null;
    this.commit("裁切画布（栅格化）");
  }
}
