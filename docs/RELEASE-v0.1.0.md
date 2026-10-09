# Compositor中文版 v0.1.0

首个 Windows x64 中文版本。参考开源 Compositor 的工作流和公开文件格式，独立实现 Windows 编辑核心。

## 下载与安装

| 文件 | 用途 |
| --- | --- |
| `Compositor-ZH-0.1.0-Setup.exe` | 中文安装向导，可选安装目录；创建桌面与开始菜单快捷方式 |
| `Compositor-Windows-zh-0.1.0-portable.zip` | 便携包，完整解压后运行 `Compositor 中文版.exe` |
| `Compositor-Windows-zh-0.1.0-source.zip` | 开发源码、锁定依赖、构建脚本、测试和说明 |
| `Compositor-ZH-0.1.0-Demo.cwin` | 分层示例项目，从文件菜单打开 |
| `SHA256SUMS.txt` | 以上文件的 SHA-256 校验值 |

软件运行不需要 Node.js、账号或网络图片处理服务。安装包未使用商业代码签名，Windows 可能显示未知发布者。

## 功能

中文深灰工作区，图层与历史记录，画笔/橡皮擦，矩形选区，填充与渐变，矩形/椭圆，中文文字，栅格蒙版，变换和翻转，基础滤镜，自动备份，原生 `.cwin` 项目，PNG/JPEG DPI 导出，基础栅格 PSD 读写，以及原版 `.comp` 基础图层与链接灰度蒙版导入。

## 验证范围

Windows 桌面程序已通过 19 项实际检查，包括真实指针绘画、像素撤销、选区、文字、蒙版、实际文件保存重开、PNG/JPEG DPI、PSD 程序回读及 `.comp` 导入。NSIS 安装器已经实际静默安装，安装后的程序再次通过全部 19 项检查。中文交互式安装向导尚未人工验证。详见仓库 `docs/VALIDATION.md`。

本版是基础编辑版本，单文档、RGB 8 位。尚无 CMYK、智能对象、Camera Raw、图层组与完整 PSD 高级语义；PSD 输出尚未经过 Photoshop 实机验证。高级 PSD / `.comp` 结构会拒绝有损打开。请保存 `.cwin` 保留可编辑项目。

## 授权

MIT。原项目 [robbietilton/Compositor](https://github.com/robbietilton/Compositor) 的授权声明随源码与发行包保留。本软件不是 Adobe 官方产品。
