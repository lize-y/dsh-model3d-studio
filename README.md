# DSH 3D 建模插件

一个复用 DSH 原生工作区对话的 3D 建模插件。

新建会话时选择 **3D 建模** Agent 预设，即可在原生 **对话 / 轨迹** 页面顶部获得 **规格 / 模型** 两个 View 标签。AI 会用机械工程师方式追问，然后自己写 `part.py`（build123d 代码）和 `part.spec.md`（工程规格），再调用 `model3d_build` 编译运行并导出模型。

普通会话不会显示这两个标签，也不会加载建模工具。

## 功能

- **会话类型选择**：通过 Agent 预设选择普通会话或 3D 建模会话。
- **原生对话**：不替换聊天、轨迹或会话输入框。
- **规格标签**：自动生成的主视图/俯视图/左视图三视图（虚线为不可见轮廓），并显示 `part.spec.md` 的工程制图描述。
- **模型标签**：可旋转、缩放、线框切换的 WebGL STL 预览，支持等轴测/前视/俯视。
- **Agent 直接写代码**：AI 用普通文件工具写 `part.py` 与 `part.spec.md`，不通过工具传代码。
- **唯一工具** `model3d_build`：编译运行 `part.py`、校验几何、导出 STL/STEP 并刷新“模型”标签。
- **工作区文件**：生成文件写入当前会话工作区。
- **会话级隔离**：规格和模型按 Session ID 分开保存。

## 三视图

`model3d_build` 会从模型自动投影出三个正交视图（HLR 消隐）：

```text
drawing-front.svg   主视图
drawing-top.svg     俯视图
drawing-right.svg   左视图
drawing.svg         合并图纸
```

“规格”标签以卡片形式并排显示三个视图，虚线表示不可见轮廓，可下载合并后的 SVG。

每个会话拥有独立目录 `<workspace>/model3d/<session-id>/`，不会与其他会话共用 `part.py`。

## 生成文件

```text
<workspace>/model3d/<session-id>/
├─ part.py
├─ part.stl
├─ part.step
├─ part.json
└─ .model3d/
   └─ sessions/<session-id>/
      ├─ spec.json
      ├─ state.json
      ├─ part.py
      ├─ part.stl
      ├─ part.step
      └─ runs/<run-id>/
```

## 安装

### 从 GitHub 安装

仓库公开后，在 DSH 中执行：

```text
plugin_manager install_bundle target=github:<owner>/dsh-model3d-studio
```

也可以使用完整 URL：

```text
plugin_manager install_bundle target=https://github.com/<owner>/dsh-model3d-studio
```

`plugin_manager` 需要可用的 `pnpm`。安装完成后刷新页面。

### 从 npm 安装（可选）

```text
npm publish --access public
```

然后在 DSH 中：

```text
plugin_manager install_bundle target=dsh-model3d-studio@1.0.0
```

### 本地开发安装

```text
plugin_manager install_bundle target=/absolute/path/to/dsh-model3d-studio
```

## Python 环境

插件需要 Python 3.10+ 和 `build123d`。推荐把虚拟环境放在启动 DSH 的工作区：

```bash
python3 -m venv .model3d-venv
.model3d-venv/bin/pip install --upgrade pip
.model3d-venv/bin/pip install build123d
```

Linux 上如果缺少 `libGL.so.1`：

```bash
sudo apt-get install -y libgl1 libegl1
```

插件按以下顺序探测 Python：

1. 插件配置 `pythonPath`
2. 环境变量 `DSH_MODEL3D_PYTHON`
3. `<workspace>/.model3d-venv/bin/python`
4. 进程当前目录的 `.model3d-venv/bin/python`
5. `python3`

如果自动探测失败，可在 DSH profile 的 patch 中覆盖配置：

```yaml
- id: model3d-studio
  name: dsh-model3d-studio
  config:
    pythonPath: /path/to/python
    ldLibraryPath: /path/to/libgl-directory
    workDir: /path/to/workspace
```

3D 预设中的 `model3d-agent` 行也需要同样配置，或通过环境变量/工作区自动探测。

## 使用

1. 新建会话。
2. 在 Agent 预设选择器中选择 **3D 建模**。
3. 描述零件；AI 追问关键尺寸、结构、材料与安装接口。
4. 需求明确后 AI 自动保存规格并生成模型。
5. 切换顶部 **规格** / **模型** 标签查看结果。

## 开发

```bash
node --check index.js
node --check client.js
node --check preset.js

cd /path/to/workspace
LD_LIBRARY_PATH=.model3d-libs/usr/lib/x86_64-linux-gnu \
  .model3d-venv/bin/python /path/to/dsh-model3d-studio/runner.py <script.py>
```

## 安全边界

生成的脚本只允许 `build123d` 与 `math` 导入；禁止文件、网络、子进程、动态执行与反射访问。执行使用独立目录、资源限制和超时。这是纵深防御，不构成强沙箱；只应对可信的本地模型使用。

## License

MIT
