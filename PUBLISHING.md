# 发布到 GitHub / npm

这份目录已经是可直接上传的插件仓库。

## 1. 上传到 GitHub

```bash
cd dsh-model3d-studio-github
git init
git add .
git commit -m "feat: DSH 3D modeling plugin"
git branch -M main
git remote add origin git@github.com:<owner>/dsh-model3d-studio.git
git push -u origin main
```

建议同时打 tag：

```bash
git tag v1.0.0
git push origin v1.0.0
```

其他人安装：

```text
plugin_manager install_bundle target=github:<owner>/dsh-model3d-studio
```

> 仓库必须是公开的，否则 pnpm 在用户机器上无法匿名拉取。

## 2. 发布到 npm（可选）

先确认包名可用：

```bash
npm view dsh-model3d-studio version
```

如果 404，说明可以用。否则改成自己的 scope，例如 `@your-name/dsh-model3d-studio`。

需要同步修改：

- `package.json` 的 `name`
- `client.js` 顶部 `window.__ModuleLoader__.load({ id: '...' })`
- `cordis.patch.yml` 中两处 `name`
- `README.md` 中的安装命令

登录并发布：

```bash
npm login
npm publish --access public
```

用户安装：

```text
plugin_manager install_bundle target=dsh-model3d-studio@1.0.0
```

## 3. 发布前检查

```bash
node --check index.js
node --check preset.js
node --check client.js
npm pack --dry-run
```

确认：

- `package.json` 的 `files` 包含 `index.js`、`preset.js`、`client.js`、`runner.py`、`cordis.patch.yml`、`locale/*.json`、`icon.svg`。
- `cordis.patch.yml` 中没有本机绝对路径。
- `README.md` 中没有个人路径。
- `dsh.client.inject` 只保留实际需要的包。
- Python 环境说明清楚。

## 4. 用户侧要求

- 已安装可用的 `pnpm`。
- Python 3.10+ 与 `build123d`。
- Linux 需要 `libGL.so.1`（通常安装 `libgl1`）。
- 安装后刷新 DSH 页面，新建会话时选择 **3D 建模** 预设。
