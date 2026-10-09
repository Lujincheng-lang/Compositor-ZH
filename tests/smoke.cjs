const { _electron: electron } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
let app,
  page,
  passed = 0;
const errors = [];
async function test(name, fn) {
  await fn();
  passed++;
  console.log("PASS " + name);
}
async function main() {
  await fs.mkdir(path.join(root, "test-output"), { recursive: true });
  app = await electron.launch({
    executablePath: process.env.COMPOSITOR_EXE || require("electron"),
    args: process.env.COMPOSITOR_EXE ? [] : [root],
    env: { ...process.env, COMPOSITOR_TEST: "1" },
    timeout: 60000,
  });
  page = await app.firstWindow();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.waitForFunction(() => window.compositor);
  await test("安全桌面窗口与中文首页", async () => {
    assert.equal(await page.title(), "Compositor 中文版");
    assert.equal(await page.evaluate(() => typeof window.require), "undefined");
    assert.equal(
      await page.locator(".welcome h1").textContent(),
      "让创作回到画布",
    );
  });
  await test("通过中文对话框新建 640×480 / 300ppi", async () => {
    await page.locator('.welcome [data-action="new"]').click();
    await page.locator('[name="w"]').fill("640");
    await page.locator('[name="h"]').fill("480");
    await page.locator('[name="name"]').fill("中文验证");
    await page.locator('.dialog [type="submit"]').click();
    await page.waitForFunction(
      () => window.compositor.editor.doc?.width === 640,
    );
    assert.equal(
      await page.evaluate(() => window.compositor.editor.doc.dpi),
      300,
    );
  });
  const pos = await page.locator(".stage").boundingBox();
  const p = (x, y) => ({
    x: pos.x + x * (pos.width / 640),
    y: pos.y + y * (pos.height / 480),
  });
  const drag = async (a, b) => {
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y, { steps: 16 });
    await page.mouse.up();
  };
  await test("真实指针画笔、撤销与重做像素结果", async () => {
    await page.locator('[data-tool="brush"]').click();
    await drag(p(80, 80), p(210, 160));
    const value = await page.evaluate(
      () =>
        window.compositor.editor.active.canvas
          .getContext("2d")
          .getImageData(140, 117, 1, 1).data[3],
    );
    assert(value > 0);
    await page.keyboard.press("Control+z");
    await page.waitForFunction(() => window.compositor.editor.index === 0);
    assert.equal(
      await page.evaluate(
        () =>
          window.compositor.editor.active.canvas
            .getContext("2d")
            .getImageData(140, 117, 1, 1).data[3],
      ),
      0,
    );
    await page.keyboard.press("Control+Shift+z");
    await page.waitForFunction(() => window.compositor.editor.index === 1);
    assert(
      (await page.evaluate(
        () =>
          window.compositor.editor.active.canvas
            .getContext("2d")
            .getImageData(140, 117, 1, 1).data[3],
      )) > 0,
    );
  });
  await test("选区约束绘画 / Ctrl+D", async () => {
    await page.locator('[data-tool="select"]').click();
    await drag(p(300, 250), p(450, 350));
    await page.locator('[data-tool="brush"]').click();
    await drag(p(250, 300), p(500, 300));
    const rgba = await page.evaluate(() => {
      const c = window.compositor.editor.active.canvas.getContext("2d");
      return [
        c.getImageData(280, 300, 1, 1).data[3],
        c.getImageData(380, 300, 1, 1).data[3],
        c.getImageData(480, 300, 1, 1).data[3],
      ];
    });
    assert.equal(rgba[0], 0);
    assert(rgba[1] > 0);
    assert.equal(rgba[2], 0);
    await page.keyboard.press("Control+d");
    assert.equal(
      await page.evaluate(() => window.compositor.editor.selection),
      null,
    );
  });
  await test("图层蒙版隐藏像素、撤销恢复", async () => {
    await page.locator('.layer-footer [data-action="mask"]').click();
    await drag(p(110, 95), p(190, 145));
    const alpha = await page.evaluate(
      () =>
        document
          .querySelector("#display")
          .getContext("2d")
          .getImageData(140, 117, 1, 1).data[3],
    );
    assert.equal(alpha, 0);
    assert(
      (await page.evaluate(
        () =>
          window.compositor.editor.active.canvas
            .getContext("2d")
            .getImageData(140, 117, 1, 1).data[3],
      )) > 0,
    );
    await page.keyboard.press("Control+z");
    await page.waitForFunction(
      () =>
        document
          .querySelector("#display")
          .getContext("2d")
          .getImageData(140, 117, 1, 1).data[3] > 0,
    );
  });
  await test("形状图层、精确移动、混合与图层顺序", async () => {
    await page.locator('[data-tool="rect"]').click();
    await drag(p(470, 100), p(550, 180));
    assert.equal(
      await page.evaluate(() => window.compositor.editor.doc.layers.length),
      2,
    );
    await page.locator("#prop-x").fill("450");
    await page.locator("#prop-x").press("Tab");
    assert.equal(
      await page.evaluate(() => window.compositor.editor.active.x),
      450,
    );
    await page.locator("#blend").selectOption("multiply");
    assert.equal(
      await page.evaluate(() => window.compositor.editor.active.blend),
      "multiply",
    );
    await page.locator('.layer-footer [data-action="duplicate"]').click();
    assert.equal(
      await page.evaluate(() => window.compositor.editor.doc.layers.length),
      3,
    );
  });
  await test("文字创建和再次编辑", async () => {
    await page.locator('[data-tool="text"]').click();
    await page.mouse.click(p(250, 60).x, p(250, 60).y);
    await page.locator('[name="content"]').fill("中文排版\n本地编辑");
    await page.locator('[name="size"]').fill("24");
    await page.locator('.dialog [type="submit"]').click();
    await page.waitForFunction(() => !!window.compositor.editor.active.text);
    await page.locator('[data-action="edit-text"]').click();
    await page.locator('[name="content"]').fill("继续编辑");
    await page.locator('.dialog [type="submit"]').click();
    await page.waitForFunction(
      () => window.compositor.editor.active.text?.content === "继续编辑",
    );
  });
  await test("项目无损保存重开 / 蒙版文字变换往返", async () => {
    const result = await page.evaluate(async () => {
      const api = window.compositor,
        e = api.editor;
      const before = JSON.stringify(e.snapshot());
      const bytes = await e.saveProject();
      await window.desktop.autosave(bytes);
      e.doc.name = "改动";
      await e.openProject(bytes);
      return {
        same: JSON.stringify(e.snapshot()) === before,
        dirty: e.dirty,
        len: bytes.length,
      };
    });
    assert(result.same);
    assert.equal(result.dirty, false);
    assert(result.len > 1000);
  });
  await test("实际文件对话框路径保存并重新读取", async () => {
    const dest = path.join(root, "test-output", "中文验证.cwin");
    await app.evaluate(({ dialog }, dest) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: dest });
    }, dest);
    await page.keyboard.press("Control+s");
    await page.waitForFunction(
      (dest) => document.querySelector("#status").textContent.includes(dest),
      dest,
    );
    const bytes = await fs.readFile(dest);
    assert(bytes.length > 1000);
    await app.evaluate(({ dialog }, file) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [file],
      });
    }, dest);
    await page.keyboard.press("Control+o");
    await page.waitForFunction(
      () => window.compositor.editor.history.length === 1,
    );
    assert.equal(
      await page.evaluate(() => window.compositor.editor.doc.layers.length),
      4,
    );
  });
  await test("PNG/JPEG 像素尺寸和 DPI 实际文件", async () => {
    for (const type of ["png", "jpg"]) {
      const dest = path.join(root, "test-output", "中文验证." + type);
      await app.evaluate(({ dialog }, dest) => {
        dialog.showSaveDialog = async () => ({
          canceled: false,
          filePath: dest,
        });
      }, dest);
      await page.evaluate((type) => {
        window.compositor.action("export-" + type);
      }, type);
      await page.locator('.dialog [type="submit"]').click();
      await page.waitForFunction(
        (dest) => document.querySelector("#status").textContent.includes(dest),
        dest,
      );
      const bytes = await fs.readFile(dest);
      if (type === "png") {
        assert.equal(bytes.readUInt32BE(16), 640);
        assert.equal(bytes.readUInt32BE(20), 480);
        const i = bytes.indexOf(Buffer.from("pHYs"));
        assert(i > 0);
        assert.equal(bytes.readUInt32BE(i + 4), 11811);
      } else {
        const i = bytes.indexOf(Buffer.from("JFIF\0"));
        assert(i > 0);
        assert.equal(bytes[i + 7], 1);
        assert.equal(bytes.readUInt16BE(i + 8), 300);
      }
    }
  });
  await test("PSD 图层导出及程序回读尺寸与图层属性", async () => {
    const result = await page.evaluate(async () => {
      const e = window.compositor.editor;
      const raw = e.snapshot(),
        bytes = await e.exportPsd();
      await e.importPsd(bytes, "roundtrip.psd");
      const result = {
        w: e.doc.width,
        h: e.doc.height,
        layers: e.doc.layers.map((l) => ({
          name: l.name,
          blend: l.blend,
          opacity: l.opacity,
        })),
        size: bytes.length,
      };
      await e.restore(raw);
      e.commit("PSD 测试恢复");
      return result;
    });
    assert.equal(result.w, 640);
    assert.equal(result.h, 480);
    assert.equal(result.layers.length, 4);
    assert(result.layers.some((l) => l.blend === "multiply"));
    assert(result.size > 1000);
  });
  await test("非法项目拒绝后当前内容仍保留", async () => {
    const result = await page.evaluate(async () => {
      const e = window.compositor.editor,
        before = JSON.stringify(e.snapshot());
      let rejected = false;
      try {
        await e.openProject(new Uint8Array([1, 2, 3]));
      } catch {
        rejected = true;
      }
      return { rejected, same: JSON.stringify(e.snapshot()) === before };
    });
    assert(result.rejected && result.same);
  });
  await test("锁定图层阻止修改", async () => {
    const result = await page.evaluate(() => {
      const e = window.compositor.editor;
      e.active.locked = true;
      let rejected = false;
      try {
        e.applyFilter("invert");
      } catch {
        rejected = true;
      }
      e.active.locked = false;
      return rejected;
    });
    assert(result);
  });
  await test("桌面自动备份读取", async () => {
    const result = await page.evaluate(async () => {
      const b = await window.desktop.recover();
      return b?.length;
    });
    assert(result > 1000);
  });
  await test("导入原版 .comp 文件夹、灰度蒙版与精确变换", async () => {
    const folder = path.join(root, "test-output", "原版测试.comp"),
      id = "0C5E7A91-3B2D-4F6A-8E1C-9D0B7A6F5E4D";
    await fs.mkdir(path.join(folder, "images"), { recursive: true });
    await fs.copyFile(
      path.join(root, "test-output", "中文验证.png"),
      path.join(folder, "images", id + ".png"),
    );
    const mask = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 640;
      c.height = 480;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 320, 480);
      return c.toDataURL().split(",")[1];
    });
    await fs.writeFile(
      path.join(folder, "images", id + ".mask.png"),
      Buffer.from(mask, "base64"),
    );
    await fs.writeFile(
      path.join(folder, "manifest.json"),
      JSON.stringify({
        format: "com.compositor.project",
        version: 11,
        colorSpace: "sRGB",
        width: 640,
        height: 480,
        resolution: 300,
        activeLayerID: id,
        layers: [
          {
            id,
            name: "原版图层",
            imageFile: id + ".png",
            maskFile: id + ".mask.png",
            isVisible: true,
            opacity: 0.8,
            blendMode: "Normal",
            transform: {
              origin: [12, 20],
              size: [640, 480],
              rotation: 0,
              flipX: false,
              flipY: false,
            },
          },
        ],
      }),
    );
    await app.evaluate(({ dialog }, folder) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [folder],
      });
    }, folder);
    const result = await page.evaluate(async () => {
      const e = window.compositor.editor,
        raw = e.snapshot(),
        input = await window.desktop.openComp();
      await e.importComp(input);
      const result = {
        x: e.active.x,
        opacity: e.active.opacity,
        dpi: e.doc.dpi,
        mask: [
          e.active.mask.getContext("2d").getImageData(100, 100, 1, 1).data[3],
          e.active.mask.getContext("2d").getImageData(400, 100, 1, 1).data[3],
        ],
      };
      await e.restore(raw);
      e.commit("原版导入测试恢复");
      return result;
    });
    assert.equal(result.x, 12);
    assert.equal(result.opacity, 0.8);
    assert.equal(result.dpi, 300);
    assert.deepEqual(result.mask, [0, 255]);
  });
  await test("选区内反相和裁切、撤销保留原尺寸", async () => {
    const result = await page.evaluate(async () => {
      const e = window.compositor.editor,
        raw = e.snapshot();
      e.newDocument(100, 80, 72, "滤镜验证", true);
      e.selection = { x: 20, y: 10, w: 40, h: 30 };
      e.applyFilter("invert");
      const ctx = e.active.canvas.getContext("2d"),
        samples = [
          ctx.getImageData(1, 1, 1, 1).data[0],
          ctx.getImageData(30, 20, 1, 1).data[0],
        ];
      e.crop();
      const size = [e.doc.width, e.doc.height];
      await e.undo();
      const undoSize = [e.doc.width, e.doc.height];
      await e.restore(raw);
      e.commit("滤镜裁切测试恢复");
      return { samples, size, undoSize };
    });
    assert.deepEqual(result.samples, [255, 0]);
    assert.deepEqual(result.size, [40, 30]);
    assert.deepEqual(result.undoSize, [100, 80]);
  });
  await test("所有工具图标均实际渲染", async () => {
    assert.equal(await page.locator(".tools [data-tool] svg").count(), 12);
  });
  await test("16 位 PSD 在解码前拒绝，保留当前项目", async () => {
    const result = await page.evaluate(async () => {
      const e = window.compositor.editor,
        before = JSON.stringify(e.snapshot());
      const header = new Uint8Array(26),
        v = new DataView(header.buffer);
      v.setUint32(0, 0x38425053);
      v.setUint16(4, 1);
      v.setUint32(14, 20);
      v.setUint32(18, 20);
      v.setUint16(22, 16);
      v.setUint16(24, 3);
      let rejected = false;
      try {
        await e.importPsd(header, "16bit.psd");
      } catch {
        rejected = true;
      }
      return rejected && JSON.stringify(e.snapshot()) === before;
    });
    assert(result);
  });
  await page.evaluate(() => {
    window.compositor.editor.dirty = false;
    window.desktop.dirty(false);
  });
  await page.evaluate(() => window.compositor.action("demo"));
  await page.waitForFunction(
    () => window.compositor.editor.doc?.name === "光与形 · 示例",
  );
  await page.locator(".toast").waitFor({ state: "hidden" });
  const demoBytes = await page.evaluate(async () =>
    Array.from(await window.compositor.editor.saveProject()),
  );
  await fs.writeFile(
    path.join(root, "test-output", "光与形-示例.cwin"),
    Buffer.from(demoBytes),
  );
  await page.screenshot({
    path: path.join(root, "test-output", "workspace.png"),
  });
  await test("无前端运行错误", async () => assert.deepEqual(errors, []));
  await page.evaluate(() => window.desktop.dirty(false));
  console.log(`${passed} checks passed`);
  await fs.writeFile(
    path.join(root, "test-output", "test-report.json"),
    JSON.stringify(
      {
        time: new Date().toISOString(),
        passed,
        errors,
        host: process.platform,
        packaged: !!process.env.COMPOSITOR_EXE,
      },
      null,
      2,
    ),
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (app) {
      await app.evaluate(({ app }) => app.exit(0)).catch(() => {});
      await app.close().catch(() => {});
    }
  });
