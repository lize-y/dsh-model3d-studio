window.__ModuleLoader__.load({
  id: 'dsh-model3d-studio',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'model3d.studio'
    const LAST_PROJECT_KEY = 'model3d.lastProject'
    const UNTITLED_TITLE = '未命名建模会话'

    const zh = {
      panel: '3D 建模',
      title: '3D 建模',
      subtitle: 'AI 辅助工程建模',
      new: '新建',
      newHint: '新建一个建模会话',
      project: {
        defaultTitle: '未命名建模会话',
        loading: '正在加载建模会话…',
        sessions: '建模会话',
        new: '新建建模会话',
        add: '加入工作区',
        added: '已加入工作区',
        location: '位置',
        hasModel: '已生成模型',
        inWorkspace: '工作区',
        loadFailed: '加载建模会话失败：{error}',
        createFailed: '新建建模会话失败：{error}',
        created: '已新建建模会话',
        saveFailed: '会话保存失败，请检查工作区权限',
        workspaceAdded: '已加入工作区',
        workspaceFailed: '加入工作区失败：{error}',
        busy: '请等待当前操作完成',
        back: '返回建模',
        search: '搜索会话',
        filterLabel: '筛选建模会话',
        filterAll: '全部',
        filterModel: '已生成模型',
        filterWorkspace: '已加入工作区',
        noMatches: '没有匹配的会话',
        emptyModel: '还没有生成模型的会话',
        emptyWorkspace: '还没有加入工作区的会话',
        empty: '还没有建模会话',
        emptyHint: '新建一个会话，描述零件后开始建模。',
        noModel: '尚无模型',
        more: '会话操作',
        rename: '重命名',
        delete: '删除会话',
        deleteConfirm: '确定删除“{title}”吗？该会话的对话记录、part.py、STL、STEP 和模型历史都会被删除，且无法恢复。',
        cancel: '取消',
        save: '保存',
        renamed: '会话已重命名',
        deleted: '会话已删除',
        renameFailed: '重命名失败：{error}',
        deleteFailed: '删除失败：{error}',
      },
      phase: {
        chat: '需求澄清中',
        ready: '工程规格已锁定',
        build: '正在建模',
        done: '模型已生成',
        error: '生成失败',
      },
      env: {
        checking: '检查环境…',
        ready: 'build123d {version}',
        missing: '环境待配置',
        setup: 'Python / build123d 未就绪',
        setupBody: '需求访谈仍可使用；生成模型前请配置 Python 解释器。',
        noModel: '未配置模型',
      },
      chat: {
        kicker: 'REQUIREMENT INTAKE',
        title: '需求澄清',
        badge: 'AI 工程师',
        sub: '描述零件用途与关键尺寸，AI 会逐步澄清并生成模型。',
        placeholder: '描述你要建模的零件，例如：一个 100×60×20 mm 的安装支架，四角有 M5 沉头孔…',
        readyPlaceholder: '继续补充或修改规格，例如：把中心孔改成 Ø20…',
        send: '发送',
        hint: 'Enter 发送 · Shift+Enter 换行',
        thinking: '正在分析需求…',
        missing: '待确认',
        answerHint: '所有问题答完后一起提交',
        answerRequired: '请为每个问题选择一个选项',
        submitAnswers: '提交回答',
        answerSent: '已提交',
        finalize: '信息已足够，直接定稿并建模',
        finalizeInstruction: '信息已经足够，请停止追问，直接输出最终工程规格并开始建模。所有未决细节按你的工程推荐值写入 assumptions。',
      },
      stage: {
        requirements: '需求',
        spec: '规格',
        model: '模型',
      },
      greeting: '你好，我是你的机械设计工程师。告诉我你想做的零件、用途和大致尺寸，我会逐步追问关键细节，直到形成可直接建模的工程制图描述。',
      suggest: {
        flange: '设计一个 DN50 法兰，4 个螺栓孔',
        bracket: '做一个电机安装支架，承重 5 kg',
        gear: '建模一个 20 齿直齿轮，模数 2',
        enclosure: '设计一个 120×80×35 mm 的电子外壳',
      },
      generation: {
        title: '正在生成模型',
        step1: 'AI 正在编写 build123d 脚本',
        step2: '执行 Python 布尔运算与校验',
        step3: '导出 STL / STEP 并准备预览',
        failed: '模型生成失败',
        retry: '重试生成',
        retryHint: '会带着失败原因重新请求 AI 修正建模脚本。',
      },
      viewer: {
        emptyTitle: '模型将在这里出现',
        emptyBody: 'AI 锁定工程规格后，会自动编写 build123d 脚本并生成可旋转查看的 3D 模型。',
        hint: '拖动旋转 · 滚轮缩放 · 双击复位',
        iso: '等轴测',
        front: '前视',
        top: '俯视',
        reset: '复位视图',
        wireframe: '线框',
        loading: '正在加载模型…',
        loadFailed: '模型预览加载失败',
        label: '模型视图',
        sizeShort: '尺寸',
        volumeShort: '体积',
        triangles: '三角面',
        emptyTag: '自动生成 STL / STEP',
        stats: '尺寸 {size} mm · 体积 {volume} cm³ · {faces} 面',
        valid: '实体有效',
        invalid: '实体待检查',
      },
      session: {
        spec: '规格',
        model: '模型',
        loading: '正在读取建模结果…',
        noSession: '当前没有可用会话',
        noSessionBody: '请先在左侧打开一个会话。',
        emptySpecTitle: '还没有工程规格',
        emptySpecBody: '在对话中描述零件，AI 会先调用 model3d_spec 保存工程规格。',
        emptyModelTitle: '还没有生成模型',
        emptyModelBody: '规格确认后，AI 会调用 model3d_build 生成可旋转查看的模型。',
        errorTitle: '无法读取建模数据',
        errorBody: '{error}',
        notModelingTitle: '这不是 3D 建模会话',
        notModelingBody: '新建会话时选择“3D 建模”预设即可使用规格和模型标签。',
      },
      tab: {
        model: '3D 模型',
        spec: '工程规格',
        code: 'Python',
      },
      download: {
        stl: '下载 STL',
        step: '下载 STEP',
      },
      spec: {
        empty: '工程规格会在需求明确后生成。',
        draft: '规格草稿',
        title: '工程规格',
        features: '几何特征',
        overall: '总体尺寸',
        material: '材料',
        process: '工艺',
        tolerance: '公差',
        surface: '表面',
        units: '单位',
        assumptions: '建模假设',
        notes: '制图备注',
        drawing: '图号',
        scale: '比例',
        rebuild: '按此规格重新生成',
        copy: '复制规格 JSON',
        notSpecified: '未指定',
      },
      code: {
        empty: '模型生成后，这里会显示 AI 编写的 build123d 脚本。',
        title: 'build123d 脚本',
        copy: '复制代码',
        copied: '代码已复制',
        hint: '参数化脚本 · 单位 mm · 可下载 Python 文件',
      },
      message: {
        generated: '模型已生成：{title}。你可以在右侧旋转查看、下载 STL / STEP，或切换到 Python 查看完整建模脚本。',
        ready: '工程规格已经清晰，我正在按这份规格生成模型。',
        chatFailed: '需求分析失败：{error}',
        buildFailed: '生成失败：{error}',
      },
      toast: {
        newProject: '已新建空白项目',
        generated: '模型生成完成',
        copied: '已复制',
      },
      common: {
        retry: '重试',
        close: '关闭',
        settings: '环境详情',
      },
    }

    const en = {
      panel: '3D Studio',
      title: '3D Modeling',
      subtitle: 'AI-assisted engineering modeling',
      new: 'New',
      newHint: 'Start a new modeling session',
      project: {
        defaultTitle: 'Untitled modeling session',
        loading: 'Loading modeling session…',
        sessions: 'Modeling sessions',
        new: 'New modeling session',
        add: 'Add to workspace',
        added: 'In workspace',
        location: 'Location',
        hasModel: 'Model generated',
        inWorkspace: 'Workspace',
        loadFailed: 'Could not load modeling session: {error}',
        createFailed: 'Could not create modeling session: {error}',
        created: 'Modeling session created',
        saveFailed: 'Could not save this session. Check workspace permissions.',
        workspaceAdded: 'Added to workspace',
        workspaceFailed: 'Could not add to workspace: {error}',
        busy: 'Wait for the current operation to finish',
        back: 'Back to studio',
        search: 'Search sessions',
        filterLabel: 'Filter modeling sessions',
        filterAll: 'All',
        filterModel: 'With model',
        filterWorkspace: 'In workspace',
        noMatches: 'No matching sessions',
        emptyModel: 'No sessions with a generated model',
        emptyWorkspace: 'No sessions added to a workspace yet',
        empty: 'No modeling sessions yet',
        emptyHint: 'Create a session, describe a part, and start modeling.',
        noModel: 'No model yet',
        more: 'Session actions',
        rename: 'Rename',
        delete: 'Delete session',
        deleteConfirm: 'Delete “{title}”? Its conversation, part.py, STL, STEP, and model history will be removed permanently.',
        cancel: 'Cancel',
        save: 'Save',
        renamed: 'Session renamed',
        deleted: 'Session deleted',
        renameFailed: 'Rename failed: {error}',
        deleteFailed: 'Delete failed: {error}',
      },
      phase: {
        chat: 'Clarifying requirements',
        ready: 'Specification locked',
        build: 'Building model',
        done: 'Model ready',
        error: 'Generation failed',
      },
      env: {
        checking: 'Checking environment…',
        ready: 'build123d {version}',
        missing: 'Environment needs setup',
        setup: 'Python / build123d unavailable',
        setupBody: 'Requirement intake still works; configure Python before generating.',
        noModel: 'No model selected',
      },
      chat: {
        kicker: 'REQUIREMENT INTAKE',
        title: 'Requirements',
        badge: 'AI engineer',
        sub: 'Describe the part and its key dimensions; the AI will clarify details and build the model.',
        placeholder: 'Describe the part you need, e.g. a 100×60×20 mm mounting bracket with four M5 counterbores…',
        readyPlaceholder: 'Refine the locked specification, e.g. change the center hole to Ø20…',
        send: 'Send',
        hint: 'Enter to send · Shift+Enter for a new line',
        thinking: 'Analyzing requirements…',
        missing: 'Missing',
        answerHint: 'Answer every question, then submit together',
        answerRequired: 'Choose one option for each question',
        submitAnswers: 'Submit answers',
        answerSent: 'Submitted',
        finalize: 'Enough detail — finalize and build',
        finalizeInstruction: 'That is enough detail. Stop asking questions, output the final engineering specification, and start modeling. Put every unresolved detail into assumptions using your recommended engineering defaults.',
      },
      stage: {
        requirements: 'Requirements',
        spec: 'Specification',
        model: 'Model',
      },
      greeting: 'Hello — I am your mechanical design engineer. Tell me the part, its purpose, and rough dimensions. I will ask focused follow-up questions until we have a specification precise enough to model.',
      suggest: {
        flange: 'Design a DN50 flange with 4 bolt holes',
        bracket: 'Make a motor bracket rated for 5 kg',
        gear: 'Model a 20-tooth spur gear, module 2',
        enclosure: 'Design a 120×80×35 mm electronics enclosure',
      },
      generation: {
        title: 'Building the model',
        step1: 'AI is writing the build123d script',
        step2: 'Running Python booleans and validation',
        step3: 'Exporting STL / STEP for preview',
        failed: 'Model generation failed',
        retry: 'Retry generation',
        retryHint: 'The failure details are sent back to the AI to repair the script.',
      },
      viewer: {
        emptyTitle: 'Your model will appear here',
        emptyBody: 'Once the specification is locked, the AI writes build123d code and generates a rotatable 3D model automatically.',
        hint: 'Drag to orbit · scroll to zoom · double-click to reset',
        iso: 'Isometric',
        front: 'Front',
        top: 'Top',
        reset: 'Reset view',
        wireframe: 'Wireframe',
        loading: 'Loading model…',
        loadFailed: 'Could not load the model preview',
        label: 'Model view',
        sizeShort: 'Size',
        volumeShort: 'Volume',
        triangles: 'Triangles',
        emptyTag: 'STL / STEP generated automatically',
        stats: 'Size {size} mm · Volume {volume} cm³ · {faces} faces',
        valid: 'Valid solid',
        invalid: 'Needs review',
      },
      session: {
        spec: 'Spec',
        model: 'Model',
        loading: 'Reading modeling result…',
        noSession: 'No active session',
        noSessionBody: 'Open a conversation first.',
        emptySpecTitle: 'No engineering specification yet',
        emptySpecBody: 'Describe the part in the conversation; the AI will save a specification with model3d_spec.',
        emptyModelTitle: 'No model generated yet',
        emptyModelBody: 'Once the specification is confirmed, the AI will call model3d_build to generate a model.',
        errorTitle: 'Could not read modeling data',
        errorBody: '{error}',
        notModelingTitle: 'This is not a 3D modeling session',
        notModelingBody: 'Create a session with the 3D Modeling preset to use the Specification and Model tabs.',
      },
      tab: {
        model: '3D Model',
        spec: 'Specification',
        code: 'Python',
      },
      download: {
        stl: 'Download STL',
        step: 'Download STEP',
      },
      spec: {
        empty: 'A specification appears once requirements are clear.',
        draft: 'Specification draft',
        title: 'Specification',
        features: 'Features',
        overall: 'Overall size',
        material: 'Material',
        process: 'Process',
        tolerance: 'Tolerances',
        surface: 'Surface',
        units: 'Units',
        assumptions: 'Assumptions',
        notes: 'Drawing notes',
        drawing: 'Drawing no.',
        scale: 'Scale',
        rebuild: 'Rebuild from this specification',
        copy: 'Copy specification JSON',
        notSpecified: 'Not specified',
      },
      code: {
        empty: 'The build123d script written by the AI will appear here.',
        title: 'build123d script',
        copy: 'Copy code',
        copied: 'Code copied',
        hint: 'Parametric script · units mm · Python file available',
      },
      message: {
        generated: 'Model generated: {title}. Orbit the preview, download STL / STEP, or open the Python tab to inspect the complete script.',
        ready: 'The specification is clear. I am generating the model now.',
        chatFailed: 'Requirement analysis failed: {error}',
        buildFailed: 'Generation failed: {error}',
      },
      toast: {
        newProject: 'Started a blank project',
        generated: 'Model generated',
        copied: 'Copied',
      },
      common: {
        retry: 'Retry',
        close: 'Close',
        settings: 'Environment details',
      },
    }

    const CSS = `
.m3d-page {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-family: var(--dsw-font-family, Inter, "Segoe UI", system-ui, -apple-system, sans-serif);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.m3d-top {
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.m3d-mark {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l1);
  flex: none;
}
.m3d-brand { min-width: 0; }
.m3d-brand-title { font-size: 13px; font-weight: 600; white-space: nowrap; }
.m3d-brand-sub { font-size: 11px; color: var(--dsw-alias-label-secondary); white-space: nowrap; margin-top: 1px; }
.m3d-project {
  height: 28px;
  min-width: 0;
  max-width: 240px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.m3d-project:hover { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-border-l2); }
.m3d-project:disabled { opacity: .55; cursor: default; }
.m3d-project > svg:first-child { color: var(--dsw-alias-label-secondary); flex: none; }
.m3d-project > svg:last-child { color: var(--dsw-alias-label-secondary); flex: none; }
.m3d-project-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m3d-detail-head { gap: 8px; }
.m3d-top-spacer { flex: 1; }
.m3d-detail-title {
  min-width: 0;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
}
.m3d-env {
  min-width: 0;
  max-width: 220px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}
.m3d-detail-actions { position: relative; flex: none; }
.m3d-icon-btn {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.m3d-icon-btn:hover { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-border-l1); color: var(--dsw-alias-label-primary); }
.m3d-detail-menu {
  position: absolute;
  top: 32px;
  right: 0;
  z-index: 30;
  width: 190px;
  padding: 4px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .14);
}
.m3d-detail-menu-item {
  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 7px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 11.5px;
  text-align: left;
  cursor: pointer;
}
.m3d-detail-menu-item:hover { background: var(--dsw-alias-bg-layer-2); }
.m3d-detail-menu-item.danger { color: var(--dsw-alias-state-error-primary); }
.m3d-detail-menu-path {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  margin-top: 4px;
  padding: 5px 7px 4px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
}
.m3d-detail-menu-path span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m3d-pill {
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  white-space: nowrap;
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.m3d-pill b { color: var(--dsw-alias-label-primary); font-weight: 550; }
.m3d-pill.model svg { flex: none; }
.m3d-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); flex: none; }
.m3d-dot.ok { background: var(--dsw-alias-state-success-primary); }
.m3d-dot.bad { background: var(--dsw-alias-state-error-primary); }
.m3d-dot.wait { background: var(--dsw-alias-state-warn-primary); animation: m3d-pulse 1.4s ease-in-out infinite; }
.m3d-btn {
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 9px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}
.m3d-btn:hover { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
.m3d-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.m3d-btn.primary {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary-foreground);
}
.m3d-btn.primary:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 88%, black); }
.m3d-btn.ghost { background: transparent; }
.m3d-btn.sm { height: 26px; padding: 0 8px; font-size: 11.5px; }
.m3d-btn:disabled { opacity: .45; cursor: not-allowed; }
.m3d-banner {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 9px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary) 24%, var(--dsw-alias-border-l1));
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 7%, var(--dsw-alias-bg-base));
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 1.5;
}
.m3d-banner b { color: var(--dsw-alias-label-primary); font-weight: 600; margin-right: 6px; }
.m3d-banner svg { color: var(--dsw-alias-state-warn-primary); flex: none; margin-top: 1px; }
.m3d-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(330px, 360px) minmax(0, 1fr);
}
.m3d-sessions { flex: 1; min-height: 0; overflow: hidden; background: var(--dsw-alias-bg-base); }
.m3d-sessions-scroll { height: 100%; overflow: auto; scrollbar-gutter: stable; }
.m3d-sessions-content { width: 100%; max-width: 960px; margin: 0 auto; padding: 28px 32px 40px; }
.m3d-sessions-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.m3d-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 11.5px;
  cursor: pointer;
}
.m3d-back:hover { color: var(--dsw-alias-label-primary); }
.m3d-sessions-head h1 { margin: 6px 0 0; font-size: 20px; font-weight: 500; line-height: 1.4; }
.m3d-sessions-actions { display: flex; align-items: center; gap: 8px; flex: none; }
.m3d-sessions-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-bottom: 12px; }
.m3d-sfilter {
  height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
}
.m3d-sfilter:hover, .m3d-sfilter.active { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.m3d-sessions-search {
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  margin-bottom: 14px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
}
.m3d-sessions-search:focus-within { border-color: var(--dsw-alias-brand-primary); }
.m3d-sessions-search input {
  min-width: 0;
  flex: 1;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
}
.m3d-sessions-search input::placeholder { color: var(--dsw-alias-label-secondary); }
.m3d-session-list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.m3d-session-item { position: relative; }
.m3d-session-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.m3d-session-row:hover, .m3d-session-row.active { background: var(--dsw-alias-bg-layer-2); }
.m3d-session-row:disabled { opacity: .6; cursor: default; }
.m3d-session-glyph {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  flex: none;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
}
.m3d-session-body { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 1px; }
.m3d-session-title { font-size: 14px; font-weight: 500; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m3d-session-meta { font-size: 13px; color: var(--dsw-alias-label-secondary); line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m3d-session-row > svg { flex: none; color: var(--dsw-alias-brand-primary); }
.m3d-session-tail { display: flex; align-items: center; gap: 4px; flex: none; }
.m3d-session-tail > svg { color: var(--dsw-alias-brand-primary); }
.m3d-row-more {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  opacity: 0;
  flex: none;
}
.m3d-session-row:hover .m3d-row-more, .m3d-session-row:focus-within .m3d-row-more, .m3d-row-more[aria-expanded="true"] { opacity: 1; }
.m3d-row-more:hover { background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
.m3d-row-more:disabled { opacity: .3; cursor: default; }
.m3d-row-menu {
  position: absolute;
  top: calc(100% - 4px);
  right: 8px;
  z-index: 10;
  width: 150px;
  padding: 4px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .14);
}
.m3d-row-menu-item {
  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 7px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 11.5px;
  text-align: left;
  cursor: pointer;
}
.m3d-row-menu-item:hover { background: var(--dsw-alias-bg-layer-2); }
.m3d-row-menu-item.danger { color: var(--dsw-alias-state-error-primary); }
.m3d-btn.danger {
  border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l1));
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 6%, var(--dsw-alias-bg-base));
  color: var(--dsw-alias-state-error-primary);
}
.m3d-btn.danger:hover { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, var(--dsw-alias-bg-base)); }
.m3d-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, .32);
}
.m3d-modal {
  width: min(380px, 100%);
  padding: 18px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 16px 48px rgba(0, 0, 0, .2);
}
.m3d-modal-title { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 14px; font-weight: 600; }
.m3d-modal-title svg { color: var(--dsw-alias-state-error-primary); }
.m3d-modal-input {
  width: 100%;
  height: 34px;
  padding: 0 9px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  outline: 0;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
}
.m3d-modal-input:focus { border-color: var(--dsw-alias-brand-primary); }
.m3d-modal-text { margin: 0 0 16px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; line-height: 1.6; }
.m3d-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
@media (hover: none) {
  .m3d-row-more { opacity: 1; }
}
.m3d-sessions-loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 48px 20px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }
.m3d-sessions-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 20px; color: var(--dsw-alias-label-secondary); }
.m3d-sessions-empty > svg { margin-bottom: 10px; color: var(--dsw-alias-label-secondary); }
.m3d-sessions-empty b { font-size: 14px; font-weight: 500; color: var(--dsw-alias-label-primary); }
.m3d-sessions-empty p { margin: 4px 0 14px; font-size: 13px; }
.m3d-sessions-location { display: flex; align-items: center; gap: 5px; min-width: 0; margin-top: 18px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.m3d-sessions-location-label { flex: none; }
.m3d-sessions-location-path { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m3d-chat {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.m3d-chat-head { padding: 14px 16px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.m3d-chat-title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.m3d-chat-title { font-size: 13px; font-weight: 600; }
.m3d-chat-sub { font-size: 11.5px; color: var(--dsw-alias-label-secondary); margin-top: 3px; line-height: 1.5; }
.m3d-phase {
  flex: none;
  padding: 2px 7px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  white-space: nowrap;
}
.m3d-stages { display: flex; align-items: center; gap: 14px; margin-top: 10px; }
.m3d-stage-node { display: flex; flex-direction: row; align-items: center; gap: 5px; min-width: 0; }
.m3d-stage-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  font-size: 9px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  flex: none;
}
.m3d-stage-node.done .m3d-stage-dot {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary-foreground);
}
.m3d-stage-node.active .m3d-stage-dot {
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-brand-primary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-base));
}
.m3d-stage-node.error .m3d-stage-dot {
  border-color: var(--dsw-alias-state-error-primary);
  color: var(--dsw-alias-state-error-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, var(--dsw-alias-bg-base));
}
.m3d-stage-label { font-size: 11px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.m3d-stage-node.active .m3d-stage-label, .m3d-stage-node.done .m3d-stage-label { color: var(--dsw-alias-label-primary); }
.m3d-stage-line { display: none; }
.m3d-msgs {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 16px 16px;
  scrollbar-width: thin;
}
.m3d-msg { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
.m3d-msg.user { flex-direction: row-reverse; }
.m3d-avatar {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  flex: none;
  margin-top: 1px;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l1);
}
.m3d-msg.user .m3d-avatar { display: none; }
.m3d-msg-main { min-width: 0; max-width: calc(100% - 30px); display: flex; flex-direction: column; gap: 7px; }
.m3d-msg.user .m3d-msg-main { align-items: flex-end; max-width: 86%; margin-left: auto; }
.m3d-bubble {
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--dsw-alias-label-primary);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.m3d-msg.user .m3d-bubble {
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  padding: 7px 10px;
}
.m3d-msg.error .m3d-bubble {
  color: var(--dsw-alias-state-error-primary);
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 6%, var(--dsw-alias-bg-base));
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 22%, var(--dsw-alias-border-l1));
  border-radius: 8px;
  padding: 8px 10px;
}
.m3d-msg.welcome .m3d-avatar { display: none; }
.m3d-msg.welcome .m3d-msg-main { max-width: 100%; width: 100%; gap: 8px; }
.m3d-msg.welcome .m3d-bubble {
  background: var(--dsw-alias-bg-base);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  padding: 12px 13px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12.5px;
  line-height: 1.7;
}
.m3d-questions { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.m3d-q {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-base);
}
.m3d-q-text { font-size: 12px; color: var(--dsw-alias-label-primary); line-height: 1.5; }
.m3d-options { display: flex; flex-direction: column; gap: 5px; }
.m3d-option {
  width: 100%;
  padding: 7px 9px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 11.5px;
  line-height: 1.45;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.m3d-option-label { flex: 1; min-width: 0; }
.m3d-option svg { flex: none; color: var(--dsw-alias-brand-primary); }
.m3d-option:hover {
  border-color: var(--dsw-alias-brand-primary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-layer-1));
}
.m3d-option.selected {
  border-color: var(--dsw-alias-brand-primary);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-layer-1));
}
.m3d-option:disabled { cursor: default; opacity: .8; }
.m3d-answer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 2px;
}
.m3d-answer-hint { font-size: 10.5px; color: var(--dsw-alias-label-secondary); line-height: 1.4; }
.m3d-answer-actions .m3d-btn { flex: none; }
.m3d-missing { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.m3d-missing-tag {
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
  border-radius: 4px;
  padding: 1px 6px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.m3d-missing-tag:first-child { border: 0; background: transparent; padding-left: 0; }
.m3d-typing { display: inline-flex; align-items: center; gap: 4px; padding: 5px 0; }
.m3d-typing i { width: 4px; height: 4px; border-radius: 50%; background: var(--dsw-alias-label-secondary); animation: m3d-bounce 1.2s ease-in-out infinite; }
.m3d-typing i:nth-child(2) { animation-delay: .14s; }
.m3d-typing i:nth-child(3) { animation-delay: .28s; }
.m3d-suggestions { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.m3d-suggestion {
  width: 100%;
  min-height: 34px;
  padding: 7px 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 7px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  line-height: 1.45;
  text-align: left;
  cursor: pointer;
}
.m3d-suggestion:hover { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
.m3d-composer { flex: none; padding: 10px 16px 12px; border-top: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); }
.m3d-input-wrap {
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-base);
  padding: 8px 9px 7px 10px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.m3d-input-wrap:focus-within {
  border-color: var(--dsw-alias-brand-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent);
}
.m3d-page textarea.m3d-input {
  width: 100%;
  min-height: 38px;
  max-height: 140px;
  resize: none;
  border: 0;
  outline: 0;
  padding: 0;
  background: var(--dsw-alias-bg-base) !important;
  color: var(--dsw-alias-label-primary) !important;
  -webkit-text-fill-color: var(--dsw-alias-label-primary);
  caret-color: var(--dsw-alias-brand-primary);
  appearance: none;
  font: inherit;
  font-size: 13px;
  line-height: 1.55;
  display: block;
}
.m3d-page textarea.m3d-input:-webkit-autofill,
.m3d-page textarea.m3d-input:-webkit-autofill:hover,
.m3d-page textarea.m3d-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--dsw-alias-label-primary);
  -webkit-box-shadow: 0 0 0 1000px var(--dsw-alias-bg-base) inset;
  caret-color: var(--dsw-alias-brand-primary);
}
.m3d-page textarea.m3d-input::placeholder { color: var(--dsw-alias-label-secondary); -webkit-text-fill-color: var(--dsw-alias-label-secondary); opacity: .8; }
.m3d-compose-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 6px; }
.m3d-hint { font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.m3d-send {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary-foreground);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex: none;
}
.m3d-send:disabled { opacity: .4; cursor: not-allowed; }
.m3d-send:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 88%, black); }
.m3d-chat-foot { padding: 8px 16px 0; font-size: 10.5px; color: var(--dsw-alias-label-secondary); display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.m3d-finalize-row { display: flex; justify-content: flex-start; padding-top: 8px; }
.m3d-finalize {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 9px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 11.5px;
  cursor: pointer;
}
.m3d-finalize:hover { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-label-primary); }
.m3d-finalize:disabled { opacity: .45; cursor: not-allowed; }
.m3d-model-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m3d-workspace { min-width: 0; min-height: 0; display: flex; flex-direction: column; background: var(--dsw-alias-bg-layer-1); }
.m3d-tabs {
  flex: 0 0 44px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.m3d-tab {
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.m3d-tab:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.m3d-tab.active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.m3d-tab:disabled { opacity: .4; cursor: not-allowed; }
.m3d-tab-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--dsw-alias-brand-primary); }
.m3d-tabs-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.m3d-download {
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 7px;
  border-radius: 5px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  text-decoration: none;
  font-size: 10.5px;
  font-weight: 500;
}
.m3d-download:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
.m3d-option:focus-visible, .m3d-suggestion:focus-visible, .m3d-tab:focus-visible, .m3d-vbtn:focus-visible, .m3d-download:focus-visible, .m3d-send:focus-visible, .m3d-finalize:focus-visible, .m3d-code-btn:focus-visible, .m3d-project:focus-visible, .m3d-sfilter:focus-visible, .m3d-session-row:focus-visible, .m3d-back:focus-visible, .m3d-row-more:focus-visible, .m3d-row-menu-item:focus-visible, .m3d-modal-input:focus-visible, .m3d-btn.danger:focus-visible, .m3d-icon-btn:focus-visible, .m3d-detail-menu-item:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.m3d-content { flex: 1; min-height: 0; position: relative; overflow: hidden; }
.m3d-session-view { position: relative; height: 100%; min-height: 0; overflow: hidden; background: var(--dsw-alias-bg-base); }
.m3d-session-stage { position: absolute; inset: 0; overflow: hidden; background: #14171a; }
.m3d-session-loading { height: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--dsw-alias-label-secondary); font-size: 12.5px; }
.m3d-viewport { position: absolute; inset: 0; overflow: hidden; background: var(--dsw-alias-bg-base); }
.m3d-viewport.has-model { background: #14171a; }
.m3d-canvas { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }
.m3d-canvas:active { cursor: grabbing; }
.m3d-grid-fade { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at center, transparent 56%, rgba(0, 0, 0, .18) 100%); }
.m3d-view-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, .08);
  background: rgba(20, 23, 26, .92);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, .18);
}
.m3d-vbtn {
  height: 26px;
  text-decoration: none;
  min-width: 27px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 7px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #a9b2bd;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}
.m3d-vbtn:hover, .m3d-vbtn.active { background: rgba(255, 255, 255, .08); color: #f1f4f6; }
.m3d-vsep { width: 1px; height: 14px; background: rgba(255, 255, 255, .1); margin: 0 2px; }
.m3d-view-label {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;
  max-width: calc(100% - 320px);
}
.m3d-view-label span { font-size: 10px; color: #8b95a0; font-weight: 500; }
.m3d-view-label b { font-size: 12px; color: #e7ebef; font-weight: 550; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.m3d-view-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 12px;
  border-top: 1px solid rgba(255, 255, 255, .07);
  background: rgba(20, 23, 26, .88);
  backdrop-filter: blur(8px);
  pointer-events: none;
}
.m3d-view-hint { display: inline-flex; align-items: center; gap: 5px; color: #8f99a4; font-size: 10.5px; }
.m3d-stats { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 12px; max-width: 70%; }
.m3d-stat { display: flex; align-items: baseline; gap: 4px; color: #8f99a4; font-size: 10.5px; white-space: nowrap; }
.m3d-stat b { color: #d6dbe1; font-size: 10.5px; font-weight: 550; }
.m3d-stat.good b { color: #67c99a; }
.m3d-stat.bad b { color: #ff8b8b; }
.m3d-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  pointer-events: none;
  background: var(--dsw-alias-bg-base);
}
.m3d-empty-art {
  width: 40px;
  height: 40px;
  margin-bottom: 14px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  display: grid;
  place-items: center;
}
.m3d-empty-art::before, .m3d-empty-art::after { display: none; }
.m3d-empty-art svg { width: 24px; height: 24px; }
.m3d-empty-title { font-size: 13px; font-weight: 600; color: var(--dsw-alias-label-primary); margin-bottom: 5px; }
.m3d-empty-body { max-width: 360px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.6; }
.m3d-empty-tag {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  padding: 3px 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.m3d-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 76%, transparent);
  backdrop-filter: blur(2px);
  z-index: 4;
}
.m3d-gen-card {
  width: min(380px, 100%);
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-overlay);
  box-shadow: 0 10px 30px rgba(0, 0, 0, .12);
  padding: 18px;
  color: var(--dsw-alias-label-primary);
}
.m3d-gen-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.m3d-orbit {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-bg-layer-1);
  border: 1px solid var(--dsw-alias-border-l1);
  position: relative;
  flex: none;
}
.m3d-orbit::after {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 9px;
  border: 1px solid transparent;
  border-top-color: var(--dsw-alias-brand-primary);
  animation: m3d-spin 1.6s linear infinite;
}
.m3d-gen-title { font-size: 13px; font-weight: 600; }
.m3d-gen-sub { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 2px; }
.m3d-steps { display: flex; flex-direction: column; gap: 8px; }
.m3d-step { display: flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-secondary); font-size: 11.5px; }
.m3d-step i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid var(--dsw-alias-border-l2);
  font-size: 8px;
  font-style: normal;
  flex: none;
}
.m3d-step.active { color: var(--dsw-alias-label-primary); }
.m3d-step.active i { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); }
.m3d-step.done { color: var(--dsw-alias-label-secondary); }
.m3d-step.done i { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-label-primary-foreground); }
.m3d-progress { height: 3px; border-radius: 999px; background: var(--dsw-alias-bg-layer-2); overflow: hidden; margin-top: 14px; }
.m3d-progress span { display: block; height: 100%; width: 38%; border-radius: 999px; background: var(--dsw-alias-brand-primary); animation: m3d-slide 1.4s ease-in-out infinite; }
.m3d-fail-card {
  width: min(420px, 100%);
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 28%, var(--dsw-alias-border-l1));
  background: var(--dsw-alias-bg-overlay);
  padding: 18px;
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 10px 30px rgba(0, 0, 0, .12);
}
.m3d-fail-head { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--dsw-alias-state-error-primary); }
.m3d-fail-body {
  margin: 10px 0 14px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.55;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-base);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  padding: 9px 10px;
}
.m3d-fail-actions { display: flex; gap: 8px; }
.m3d-spec-scroll { height: 100%; overflow: auto; padding: 20px; background: var(--dsw-alias-bg-base); }
.m3d-spec-sheet {
  width: min(860px, 100%);
  margin: 0 auto;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  overflow: hidden;
}
.m3d-spec-top { display: flex; align-items: flex-start; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.m3d-spec-top-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  flex: none;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l1);
}
.m3d-spec-heading { min-width: 0; flex: 1; }
.m3d-spec-title { font-size: 16px; line-height: 1.35; font-weight: 600; margin-top: 1px; }
.m3d-spec-summary { font-size: 12px; color: var(--dsw-alias-label-secondary); margin-top: 3px; line-height: 1.55; }
.m3d-titleblock {
  display: flex;
  flex: none;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  overflow: hidden;
  background: var(--dsw-alias-bg-base);
}
.m3d-titleblock div { padding: 5px 8px; min-width: 56px; border-left: 1px solid var(--dsw-alias-border-l1); }
.m3d-titleblock div:first-child { border-left: 0; }
.m3d-titleblock span { display: block; font-size: 9.5px; color: var(--dsw-alias-label-secondary); line-height: 1.3; }
.m3d-titleblock b { display: block; font-size: 10.5px; font-weight: 600; margin-top: 2px; white-space: nowrap; }
.m3d-spec-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.m3d-spec-cell { padding: 13px 18px; min-width: 0; border-top: 1px solid var(--dsw-alias-border-l1); }
.m3d-spec-cell:nth-child(odd) { border-right: 1px solid var(--dsw-alias-border-l1); }
.m3d-spec-cell.wide { grid-column: 1 / -1; border-right: 0; }
.m3d-spec-key { font-size: 10.5px; color: var(--dsw-alias-label-secondary); font-weight: 500; }
.m3d-spec-value { font-size: 12.5px; margin-top: 3px; overflow-wrap: anywhere; }
.m3d-spec-overall { font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
.m3d-feature-list { display: flex; flex-direction: column; gap: 0; margin-top: 2px; }
.m3d-feature { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 9px; padding: 8px 0; border-top: 1px solid var(--dsw-alias-border-l1); }
.m3d-feature:first-child { border-top: 0; }
.m3d-feature-idx {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: grid;
  place-items: center;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l1);
  font-size: 9.5px;
  font-weight: 600;
}
.m3d-feature-name { font-size: 12px; font-weight: 600; }
.m3d-feature-desc { font-size: 11.5px; color: var(--dsw-alias-label-secondary); margin-top: 1px; white-space: pre-wrap; }
.m3d-feature-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.m3d-feature-tag { font-size: 10.5px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-secondary); padding: 1px 6px; border-radius: 4px; }
.m3d-spec-list { margin-top: 5px; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.m3d-spec-list li { position: relative; padding-left: 12px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); line-height: 1.55; }
.m3d-spec-list li::before { content: ""; position: absolute; left: 2px; top: 7px; width: 3px; height: 3px; border-radius: 50%; background: var(--dsw-alias-border-l2); }
.m3d-spec-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 12px 18px; background: var(--dsw-alias-bg-layer-1); border-top: 1px solid var(--dsw-alias-border-l1); }
.m3d-empty-pane { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 30px; color: var(--dsw-alias-label-secondary); text-align: center; font-size: 12.5px; }
.m3d-empty-pane b { color: var(--dsw-alias-label-primary); font-size: 13px; }
.m3d-code-wrap { height: 100%; display: flex; flex-direction: column; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); }
.m3d-code-head { flex: 0 0 40px; display: flex; align-items: center; gap: 8px; padding: 0 14px; border-bottom: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1); }
.m3d-code-title { color: var(--dsw-alias-label-primary); font-size: 12px; font-weight: 600; white-space: nowrap; }
.m3d-code-sub { color: var(--dsw-alias-label-secondary); font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.m3d-code-actions { margin-left: auto; display: flex; gap: 5px; }
.m3d-code-btn {
  height: 24px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 7px;
  border-radius: 5px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 10.5px;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}
.m3d-code-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.m3d-code-scroll { flex: 1; overflow: auto; padding: 10px 0 24px; }
.m3d-code { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 11.5px; line-height: 1.6; min-width: max-content; }
.m3d-code-row { display: grid; grid-template-columns: 44px minmax(0, 1fr); }
.m3d-code-row:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent); }
.m3d-ln { text-align: right; padding-right: 12px; color: var(--dsw-alias-label-secondary); opacity: .72; user-select: none; }
.m3d-line { padding-right: 22px; white-space: pre; color: var(--dsw-alias-label-primary); }
.m3d-toast {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  z-index: 20;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-overlay);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, .12);
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: m3d-toast-in .18s ease-out;
}
.m3d-spin { animation: m3d-spin 1s linear infinite; }
@keyframes m3d-spin { to { transform: rotate(360deg); } }
@keyframes m3d-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
@keyframes m3d-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .35; } 30% { transform: translateY(-3px); opacity: 1; } }
@keyframes m3d-slide { 0% { transform: translateX(-120%); } 100% { transform: translateX(360%); } }
@keyframes m3d-toast-in { from { opacity: 0; transform: translate(-50%, 4px); } to { opacity: 1; transform: translate(-50%, 0); } }
body:not([data-model3d-session="1"]) [data-conversation-tabs] button:nth-last-child(-n+2) { display: none !important; }
@media (max-width: 1100px) {
  .m3d-brand-sub { display: none; }
  .m3d-pill.model { display: none; }
  .m3d-env, .m3d-workspace-label { display: none; }
  .m3d-detail-title { max-width: 260px; }
}
@media (max-width: 860px) {
  .m3d-body { grid-template-columns: 320px minmax(0, 1fr); }
  .m3d-detail-title { max-width: 200px; }
  .m3d-detail-head .m3d-phase { display: none; }
  .m3d-sessions-content { padding: 20px 20px 32px; }
  .m3d-titleblock { display: none; }
  .m3d-code-sub { display: none; }
  .m3d-view-hint { display: none; }
  .m3d-view-label { display: none; }
}
@media (max-width: 720px) {
  .m3d-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 46%) minmax(0, 1fr); }
  .m3d-chat { border-right: 0; border-bottom: 1px solid var(--dsw-alias-border-l1); }
  .m3d-pill { display: none; }
  .m3d-top { padding: 0 12px; }
  .m3d-tabs { padding: 0 8px; }
  .m3d-sessions-head { align-items: flex-start; flex-direction: column; }
  .m3d-sessions-actions { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .m3d-typing i, .m3d-orbit::after, .m3d-progress span, .m3d-dot.wait { animation: none; }
}
`

    function Icon({ name, size = 16, className, strokeWidth = 1.7 }) {
      const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className,
        'aria-hidden': true,
        focusable: 'false',
      }
      const paths = {
        cube: [
          ['M12 2.7 21 7.4v9.2L12 21.3 3 16.6V7.4L12 2.7Z'],
          ['M3.4 7.5 12 12l8.6-4.5'],
          ['M12 12v9.1'],
        ],
        spark: [
          ['M12 3.1 13.7 8.6 19 10.3l-5.3 1.7L12 17.5l-1.7-5.5L5 10.3l5.3-1.7L12 3.1Z'],
          ['M18.6 3.4v3.2'],
          ['M17 5h3.2'],
        ],
        send: [
          ['M4.2 11.4 20 4.2l-4.5 15.5-4.1-6.2-7.2-2.1Z'],
          ['M11.4 13.5 20 4.2'],
        ],
        ellipsis: [
          ['M5 12h.01'],
          ['M12 12h.01'],
          ['M19 12h.01'],
        ],
        edit: [
          ['M4 20h4L19 9l-4-4L4 16v4Z'],
          ['m13.5 6.5 4 4'],
        ],
        trash: [
          ['M4 7h16'],
          ['M7 7v13h10V7'],
          ['M9 7V4h6v3'],
          ['M10 11v5'],
          ['M14 11v5'],
        ],
        search: [
          ['M10.8 4.5a6.3 6.3 0 1 0 0 12.6 6.3 6.3 0 0 0 0-12.6Z'],
          ['m15.4 15.4 4.1 4.1'],
        ],
        back: [['m14.5 6.5-5.5 5.5 5.5 5.5']],
        folder: [
          ['M3 6.5h6l2 2h10v10.5H3V6.5Z'],
          ['M3 10.5h18'],
        ],
        plus: [
          ['M12 5v14'],
          ['M5 12h14'],
        ],
        download: [
          ['M12 3v11.5'],
          ['M7.5 10.5 12 15l4.5-4.5'],
          ['M4 19.5h16'],
        ],
        code: [
          ['m8.5 7-5 5 5 5'],
          ['m15.5 7 5 5-5 5'],
        ],
        spec: [
          ['M6 3.2h8l4.2 4.2V21H6V3.2Z'],
          ['M14 3.4v4.3h4.2'],
          ['M9 12h6'],
          ['M9 15.5h6'],
          ['M9 18h3.5'],
        ],
        wire: [
          ['M12 2.7 21 7.4v9.2L12 21.3 3 16.6V7.4L12 2.7Z'],
          ['M3.4 7.5 12 12l8.6-4.5'],
          ['M12 12v9.1'],
          ['M7.7 5 16.3 9.5'],
          ['M7.7 9.5 16.3 5'],
        ],
        reset: [
          ['M4.5 4.5v5h5'],
          ['M4.7 9.4a8 8 0 1 1-.2 5.3'],
        ],
        check: [['m5 12.5 4.2 4.2L19 7']],
        alert: [
          ['M12 3 2.8 20h18.4L12 3Z'],
          ['M12 9v4.6'],
          ['M12 17.2v.1'],
        ],
        copy: [
          ['M9 9h10.5v10.5H9V9Z'],
          ['M6 15H4.5V3.5H16V6'],
        ],
        chevron: [['m8 10 4 4 4-4']],
        layers: [
          ['m12 3 9 4.6-9 4.6-9-4.6L12 3Z'],
          ['m3 12.2 9 4.6 9-4.6'],
          ['m3 16.7 9 4.6 9-4.6'],
        ],
        sparkles: [
          ['M12 3.5 13.4 7.6 17.5 9l-4.1 1.4L12 14.5l-1.4-4.1L6.5 9l4.1-1.4L12 3.5Z'],
          ['M18.5 14v4.5'],
          ['M16.2 16.2h4.6'],
        ],
      }
      const children = (paths[name] || []).map((item, index) =>
        h('path', { key: index, d: item[0] }),
      )
      return h('svg', common, children)
    }

    function flattenDict(input, prefix = '', output = {}) {
      for (const [key, value] of Object.entries(input)) {
        const next = prefix ? `${prefix}.${key}` : key
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flattenDict(value, next, output)
        } else {
          output[next] = String(value)
        }
      }
      return output
    }

    function useT(locale) {
      const [, force] = React.useState(0)
      React.useEffect(
        () => locale.subscribe(() => force((value) => value + 1)),
        [locale],
      )
      return locale.bind(NS)
    }

    const API = '/api/model3d'

    async function api(path, options) {
      const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          ...(options && options.body ? { 'content-type': 'application/json' } : {}),
          ...(options && options.headers ? options.headers : {}),
        },
        cache: 'no-store',
      })
      let payload
      try {
        payload = await response.json()
      } catch {
        payload = undefined
      }
      if (!response.ok || (payload && payload.ok === false)) {
        const message = payload && payload.error ? payload.error : `HTTP ${response.status}`
        const error = new Error(message)
        error.code = payload && payload.code
        throw error
      }
      return payload || {}
    }

    function formatNumber(value, digits = 1) {
      let number = Number(value)
      if (!Number.isFinite(number) && typeof value === 'string') {
        number = parseFloat(value.replace(/[^\d.+-]/g, ''))
      }
      if (!Number.isFinite(number)) return '—'
      return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0,
      }).format(number)
    }

    function sizeText(meta) {
      const size = meta && meta.bbox && meta.bbox.size
      if (!Array.isArray(size)) return '—'
      return size.map((value) => formatNumber(value, 2)).join(' × ')
    }

    function volumeText(meta) {
      if (!meta || !Number.isFinite(Number(meta.volume))) return '—'
      return formatNumber(Number(meta.volume) / 1000, 2)
    }

    function valueText(value, fallback) {
      if (value === undefined || value === null || value === '') return fallback
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
      }
      if (Array.isArray(value)) return value.map((item) => valueText(item, '')).filter(Boolean).join(' · ')
      if (typeof value === 'object') {
        return Object.entries(value)
          .map(([key, item]) => `${key}: ${valueText(item, '')}`)
          .join(' · ')
      }
      return fallback
    }

    function overallText(overall) {
      if (!overall) return '—'
      if (typeof overall === 'string') return overall
      const length = overall.length ?? overall.L ?? overall.x
      const width = overall.width ?? overall.W ?? overall.y
      const height = overall.height ?? overall.H ?? overall.z
      if ([length, width, height].every((value) => value !== undefined && value !== null)) {
        return `${formatNumber(length, 2)} × ${formatNumber(width, 2)} × ${formatNumber(height, 2)} mm`
      }
      return valueText(overall, '—')
    }

    function Spinner({ size = 14 }) {
      return h(Icon, { name: 'reset', size, className: 'm3d-spin' })
    }

    function Avatar({ user }) {
      return h(
        'div',
        { className: 'm3d-avatar' },
        h(Icon, { name: user ? 'cube' : 'sparkles', size: 14 }),
      )
    }

    function StageBar({ stage, t }) {
      const labels = [t('stage.requirements'), t('stage.spec'), t('stage.model')]
      const index = stage === 'chat' ? 0 : stage === 'ready' ? 1 : 2
      return h(
        'div',
        { className: 'm3d-stages', role: 'list', 'aria-label': labels.join(' / ') },
        labels.flatMap((label, i) => {
          const state =
            i < index || stage === 'done'
              ? 'done'
              : i === index
                ? stage === 'error'
                  ? 'error'
                  : 'active'
                : 'idle'
          const node = h(
            'div',
            {
              className: `m3d-stage-node ${state}`,
              key: `stage-${i}`,
              role: 'listitem',
              'aria-current': state === 'active' ? 'step' : undefined,
            },
            h(
              'div',
              { className: 'm3d-stage-dot' },
              state === 'done' ? h(Icon, { name: 'check', size: 10, strokeWidth: 2.2 }) : String(i + 1),
            ),
            h('div', { className: 'm3d-stage-label' }, label),
          )
          if (i === labels.length - 1) return [node]
          return [
            node,
            h('div', {
              key: `line-${i}`,
              className: `m3d-stage-line ${i < index || stage === 'done' ? 'done' : ''}`,
            }),
          ]
        }),
      )
    }

    function Message({ message, t, onAnswer }) {
      const isUser = message.role === 'user'
      const isError = message.kind === 'error'
      const isWelcome = message.kind === 'welcome'
      const questions = Array.isArray(message.questions) ? message.questions : []
      const [answers, setAnswers] = React.useState({})
      const [submitted, setSubmitted] = React.useState(false)
      const answeredCount = questions.filter((question) => answers[question.id]).length
      const allAnswered = questions.length > 0 && answeredCount === questions.length

      function choose(question, option) {
        if (submitted) return
        const value = String(option.value || option.label || '').trim()
        if (!value) return
        setAnswers((current) => ({ ...current, [question.id]: value }))
      }

      function submitAnswers() {
        if (submitted || !allAnswered) return
        const text = questions
          .map((question) => `${question.text}\n${answers[question.id] || ''}`)
          .join('\n\n')
        setSubmitted(true)
        onAnswer(text)
      }

      return h(
        'div',
        { className: `m3d-msg ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''} ${isWelcome ? 'welcome' : ''}` },
        h(Avatar, { user: isUser }),
        h(
          'div',
          { className: 'm3d-msg-main' },
          h(
            'div',
            { className: 'm3d-bubble' },
            message.kind === 'welcome' ? t('greeting') : message.content,
          ),
          !isUser && message.missing && message.missing.length > 0
            ? h(
                'div',
                { className: 'm3d-missing' },
                h('span', { className: 'm3d-missing-tag' }, t('chat.missing')),
                message.missing.slice(0, 5).map((item, index) =>
                  h('span', { className: 'm3d-missing-tag', key: `${item}-${index}` }, item),
                ),
              )
            : null,
          !isUser && questions.length > 0
            ? h(
                'div',
                { className: 'm3d-questions' },
                questions.map((question) =>
                  h(
                    'div',
                    { className: 'm3d-q', key: question.id },
                    h('div', { className: 'm3d-q-text' }, question.text),
                    question.options && question.options.length > 0
                      ? h(
                          'div',
                          { className: 'm3d-options' },
                          question.options.map((option, index) => {
                            const selected = answers[question.id] === String(option.value || option.label || '').trim()
                            return h(
                              'button',
                              {
                                type: 'button',
                                className: `m3d-option ${selected ? 'selected' : ''}`,
                                key: `${question.id}-${index}`,
                                onClick: () => choose(question, option),
                                disabled: submitted,
                                'aria-pressed': selected,
                              },
                              h('span', { className: 'm3d-option-label' }, option.label),
                              selected ? h(Icon, { name: 'check', size: 11, strokeWidth: 2.2 }) : null,
                            )
                          }),
                        )
                      : null,
                  ),
                ),
                h(
                  'div',
                  { className: 'm3d-answer-actions' },
                  h(
                    'span',
                    { className: 'm3d-answer-hint' },
                    submitted
                      ? t('chat.answerSent')
                      : allAnswered
                        ? t('chat.answerHint')
                        : t('chat.answerRequired'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'm3d-btn sm primary',
                      onClick: submitAnswers,
                      disabled: submitted || !allAnswered,
                      title: allAnswered ? t('chat.submitAnswers') : t('chat.answerRequired'),
                    },
                    h(Icon, { name: 'send', size: 11 }),
                    submitted ? t('chat.answerSent') : t('chat.submitAnswers'),
                  ),
                ),
              )
            : null,
          message.kind === 'welcome'
            ? h(
                'div',
                { className: 'm3d-suggestions' },
                ['flange', 'bracket', 'gear', 'enclosure'].map((key) =>
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'm3d-suggestion',
                      key,
                      onClick: () => onAnswer(t(`suggest.${key}`)),
                    },
                    t(`suggest.${key}`),
                  ),
                ),
              )
            : null,
        ),
      )
    }

    function SpecView({ spec, model, t, busy, onRebuild, onCopy, readOnly }) {
      if (!spec) {
        return h(
          'div',
          { className: 'm3d-empty-pane' },
          h(Icon, { name: 'spec', size: 30 }),
          h('b', null, t('spec.empty')),
        )
      }
      const features = Array.isArray(spec.features) ? spec.features : []
      const assumptions = Array.isArray(spec.assumptions) ? spec.assumptions : []
      const notes = Array.isArray(spec.drawingNotes)
        ? spec.drawingNotes
        : Array.isArray(spec.notes)
          ? spec.notes
          : []
      const drawingNo = model && model.id ? model.id.slice(-8).toUpperCase() : 'DRAFT-001'
      return h(
        'div',
        { className: 'm3d-spec-scroll' },
        h(
          'article',
          { className: 'm3d-spec-sheet' },
          h(
            'div',
            { className: 'm3d-spec-top' },
            h('div', { className: 'm3d-spec-top-icon' }, h(Icon, { name: 'spec', size: 18 })),
            h(
              'div',
              { className: 'm3d-spec-heading' },
              h('h2', { className: 'm3d-spec-title' }, spec.title || spec.name || '3D Part'),
              spec.summary ? h('div', { className: 'm3d-spec-summary' }, spec.summary) : null,
            ),
            h(
              'div',
              { className: 'm3d-titleblock' },
              h('div', null, h('span', null, t('spec.drawing')), h('b', null, drawingNo)),
              h('div', null, h('span', null, t('spec.units')), h('b', null, spec.units || 'mm')),
              h('div', null, h('span', null, t('spec.scale')), h('b', null, '1:1')),
            ),
          ),
          h(
            'div',
            { className: 'm3d-spec-grid' },
            h(
              'div',
              { className: 'm3d-spec-cell' },
              h('div', { className: 'm3d-spec-key' }, t('spec.overall')),
              h('div', { className: 'm3d-spec-value m3d-spec-overall' }, overallText(spec.overall || spec.dimensions || spec.size)),
            ),
            h(
              'div',
              { className: 'm3d-spec-cell' },
              h('div', { className: 'm3d-spec-key' }, t('spec.material')),
              h('div', { className: 'm3d-spec-value' }, valueText(spec.material, t('spec.notSpecified'))),
            ),
            h(
              'div',
              { className: 'm3d-spec-cell' },
              h('div', { className: 'm3d-spec-key' }, t('spec.process')),
              h('div', { className: 'm3d-spec-value' }, valueText(spec.process, t('spec.notSpecified'))),
            ),
            h(
              'div',
              { className: 'm3d-spec-cell' },
              h('div', { className: 'm3d-spec-key' }, t('spec.tolerance')),
              h('div', { className: 'm3d-spec-value' }, valueText(spec.tolerances, t('spec.notSpecified'))),
            ),
            h(
              'div',
              { className: 'm3d-spec-cell' },
              h('div', { className: 'm3d-spec-key' }, t('spec.surface')),
              h('div', { className: 'm3d-spec-value' }, valueText(spec.surface, t('spec.notSpecified'))),
            ),
            features.length > 0
              ? h(
                  'div',
                  { className: 'm3d-spec-cell wide' },
                  h('div', { className: 'm3d-spec-key' }, t('spec.features')),
                  h(
                    'div',
                    { className: 'm3d-feature-list' },
                    features.map((feature, index) => {
                      const item = typeof feature === 'string' ? { name: feature } : feature || {}
                      const description =
                        item.description || item.detail || item.note || item.notes || ''
                      const tags = [item.dimensions, item.position, item.kind, item.type]
                        .filter((value) => value !== undefined && value !== null && value !== '')
                        .map((value) => valueText(value, ''))
                      return h(
                        'div',
                        { className: 'm3d-feature', key: `${item.name || 'feature'}-${index}` },
                        h('div', { className: 'm3d-feature-idx' }, String(index + 1).padStart(2, '0')),
                        h(
                          'div',
                          null,
                          h('div', { className: 'm3d-feature-name' }, item.name || item.label || `Feature ${index + 1}`),
                          description ? h('div', { className: 'm3d-feature-desc' }, valueText(description, '')) : null,
                          tags.length > 0
                            ? h(
                                'div',
                                { className: 'm3d-feature-tags' },
                                tags.map((tag, tagIndex) =>
                                  h('span', { className: 'm3d-feature-tag', key: tagIndex }, tag),
                                ),
                              )
                            : null,
                        ),
                      )
                    }),
                  ),
                )
              : null,
            assumptions.length > 0
              ? h(
                  'div',
                  { className: 'm3d-spec-cell wide' },
                  h('div', { className: 'm3d-spec-key' }, t('spec.assumptions')),
                  h(
                    'ul',
                    { className: 'm3d-spec-list' },
                    assumptions.map((item, index) =>
                      h('li', { key: index }, valueText(item, '')),
                    ),
                  ),
                )
              : null,
            notes.length > 0
              ? h(
                  'div',
                  { className: 'm3d-spec-cell wide' },
                  h('div', { className: 'm3d-spec-key' }, t('spec.notes')),
                  h(
                    'ul',
                    { className: 'm3d-spec-list' },
                    notes.map((item, index) => h('li', { key: index }, valueText(item, ''))),
                  ),
                )
              : null,
          ),
          readOnly
            ? null
            : h(
                'div',
                { className: 'm3d-spec-actions' },
                h(
                  'button',
                  { type: 'button', className: 'm3d-btn sm ghost', onClick: onCopy },
                  h(Icon, { name: 'copy', size: 12 }),
                  t('spec.copy'),
                ),
                h(
                  'button',
                  { type: 'button', className: 'm3d-btn sm primary', onClick: onRebuild, disabled: busy },
                  h(Icon, { name: 'spark', size: 12 }),
                  t('spec.rebuild'),
                ),
              ),
        ),
      )
    }

    function CodeView({ code, t, onCopy, downloadUrl }) {
      if (!code) {
        return h(
          'div',
          { className: 'm3d-empty-pane' },
          h(Icon, { name: 'code', size: 30 }),
          h('b', null, t('code.empty')),
        )
      }
      const lines = code.split('\n')
      return h(
        'div',
        { className: 'm3d-code-wrap' },
        h(
          'div',
          { className: 'm3d-code-head' },
          h(Icon, { name: 'code', size: 14 }),
          h('span', { className: 'm3d-code-title' }, t('code.title')),
          h('span', { className: 'm3d-code-sub' }, t('code.hint')),
          h(
            'div',
            { className: 'm3d-code-actions' },
            h(
              'button',
              { type: 'button', className: 'm3d-code-btn', onClick: onCopy },
              h(Icon, { name: 'copy', size: 11 }),
              t('code.copy'),
            ),
            downloadUrl
              ? h(
                  'a',
                  {
                    className: 'm3d-code-btn',
                    href: `${downloadUrl}?download=1`,
                    download: 'generated.py',
                  },
                  h(Icon, { name: 'download', size: 11 }),
                  'PY',
                )
              : null,
          ),
        ),
        h(
          'div',
          { className: 'm3d-code-scroll' },
          h(
            'pre',
            { className: 'm3d-code' },
            lines.map((line, index) =>
              h(
                'div',
                { className: 'm3d-code-row', key: index },
                h('span', { className: 'm3d-ln' }, String(index + 1)),
                h('span', { className: 'm3d-line' }, line || ' '),
              ),
            ),
          ),
        ),
      )
    }

    // ---------------------------------------------------------------------
    // Minimal STL parser and WebGL renderer (no external dependencies).
    // ---------------------------------------------------------------------
    function parseBinaryStl(buffer) {
      const view = new DataView(buffer)
      if (buffer.byteLength < 84) return undefined
      const count = view.getUint32(80, true)
      if (count <= 0) return undefined
      if (84 + count * 50 !== buffer.byteLength) return undefined
      const positions = new Float32Array(count * 9)
      const normals = new Float32Array(count * 9)
      let offset = 84
      for (let triangle = 0; triangle < count; triangle += 1) {
        const nx = view.getFloat32(offset, true)
        const ny = view.getFloat32(offset + 4, true)
        const nz = view.getFloat32(offset + 8, true)
        const base = triangle * 9
        for (let vertex = 0; vertex < 3; vertex += 1) {
          const at = offset + 12 + vertex * 12
          positions[base + vertex * 3] = view.getFloat32(at, true)
          positions[base + vertex * 3 + 1] = view.getFloat32(at + 4, true)
          positions[base + vertex * 3 + 2] = view.getFloat32(at + 8, true)
          normals[base + vertex * 3] = nx
          normals[base + vertex * 3 + 1] = ny
          normals[base + vertex * 3 + 2] = nz
        }
        offset += 50
      }
      return { positions, normals, triangles: count }
    }

    function parseAsciiStl(text) {
      const positions = []
      const normals = []
      let normal = [0, 0, 0]
      let vertices = []
      for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim()
        if (line.startsWith('facet normal')) {
          const parts = line.split(/\s+/)
          normal = [Number(parts[2]), Number(parts[3]), Number(parts[4])]
          vertices = []
        } else if (line.startsWith('vertex')) {
          const parts = line.split(/\s+/)
          vertices.push([Number(parts[1]), Number(parts[2]), Number(parts[3])])
          if (vertices.length === 3) {
            for (const vertex of vertices) {
              positions.push(vertex[0], vertex[1], vertex[2])
              normals.push(normal[0], normal[1], normal[2])
            }
          }
        }
      }
      if (positions.length === 0) return undefined
      return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        triangles: positions.length / 9,
      }
    }

    function parseStl(buffer) {
      const binary = parseBinaryStl(buffer)
      if (binary) return binary
      const text = new TextDecoder('utf-8').decode(buffer)
      const ascii = parseAsciiStl(text)
      if (ascii) return ascii
      throw new Error('无法解析 STL 文件')
    }

    function boundsOf(positions) {
      const min = [Infinity, Infinity, Infinity]
      const max = [-Infinity, -Infinity, -Infinity]
      for (let i = 0; i < positions.length; i += 3) {
        for (let axis = 0; axis < 3; axis += 1) {
          const value = positions[i + axis]
          if (value < min[axis]) min[axis] = value
          if (value > max[axis]) max[axis] = value
        }
      }
      const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
      const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]
      return { min, max, size, center, maxDim: Math.max(size[0], size[1], size[2], 0.001) }
    }

    function edgeBuffer(positions) {
      const count = positions.length / 9
      if (count > 80000) return undefined
      const output = new Float32Array(positions.length * 2)
      let at = 0
      for (let triangle = 0; triangle < count; triangle += 1) {
        const base = triangle * 9
        const pairs = [
          [0, 1],
          [1, 2],
          [2, 0],
        ]
        for (const pair of pairs) {
          for (const vertex of pair) {
            const source = base + vertex * 3
            output[at] = positions[source]
            output[at + 1] = positions[source + 1]
            output[at + 2] = positions[source + 2]
            at += 3
          }
        }
      }
      return output
    }

    function perspective(fov, aspect, near, far) {
      const f = 1 / Math.tan(fov / 2)
      const range = 1 / (near - far)
      return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * range, -1,
        0, 0, 2 * near * far * range, 0,
      ])
    }

    function normalize3(value) {
      const length = Math.hypot(value[0], value[1], value[2]) || 1
      return [value[0] / length, value[1] / length, value[2] / length]
    }

    function cross3(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
    }

    function dot3(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
    }

    function lookAt(eye, target, up) {
      const z = normalize3([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]])
      const x = normalize3(cross3(up, z))
      const y = cross3(z, x)
      return new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -dot3(x, eye), -dot3(y, eye), -dot3(z, eye), 1,
      ])
    }

    function compileShader(gl, type, source) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader)
        throw new Error(`Shader compile failed: ${log}`)
      }
      return shader
    }

    function createProgram(gl) {
      const vertex = `
        attribute vec3 aPos;
        attribute vec3 aNormal;
        uniform mat4 uView;
        uniform mat4 uProj;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 p = uView * vec4(aPos, 1.0);
          vView = p.xyz;
          vNormal = mat3(uView) * aNormal;
          gl_Position = uProj * p;
        }
      `
      const fragment = `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vView;
        uniform vec3 uColor;
        uniform float uAlpha;
        uniform float uFlat;
        void main() {
          if (uFlat > 0.5) {
            gl_FragColor = vec4(uColor, uAlpha);
            return;
          }
          vec3 n = normalize(vNormal);
          if (!gl_FrontFacing) n = -n;
          vec3 viewDir = normalize(-vView);
          vec3 lightA = normalize(vec3(-0.35, 0.45, 0.82));
          vec3 lightB = normalize(vec3(0.68, -0.22, 0.28));
          float diffuse = max(dot(n, lightA), 0.0);
          float fill = max(dot(n, lightB), 0.0) * 0.28;
          float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.1);
          vec3 color = uColor * (0.30 + 0.70 * diffuse) + uColor * fill;
          color += vec3(0.26, 0.56, 0.83) * rim * 0.62;
          gl_FragColor = vec4(color, uAlpha);
        }
      `
      const vs = compileShader(gl, gl.VERTEX_SHADER, vertex)
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment)
      const program = gl.createProgram()
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`)
      }
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      return program
    }

    function makeBuffer(gl, data) {
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      return buffer
    }

    function niceStep(value) {
      const power = Math.pow(10, Math.floor(Math.log10(value)))
      const normalized = value / power
      const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
      return step * power
    }

    function gridGeometry(bounds) {
      const extent = bounds.maxDim * 1.8
      const step = niceStep(extent / 8)
      const half = Math.ceil(extent / 2 / step) * step
      const z = bounds.min[2] - bounds.maxDim * 0.001
      const cx = bounds.center[0]
      const cy = bounds.center[1]
      const lines = []
      for (let value = -half; value <= half + 1e-6; value += step) {
        lines.push(cx + value, cy - half, z, cx + value, cy + half, z)
        lines.push(cx - half, cy + value, z, cx + half, cy + value, z)
      }
      return new Float32Array(lines)
    }

    function axisGeometry(bounds) {
      const length = bounds.maxDim * 0.55
      const z = bounds.min[2] + bounds.maxDim * 0.001
      const cx = bounds.center[0]
      const cy = bounds.center[1]
      return {
        x: new Float32Array([cx, cy, z, cx + length, cy, z]),
        y: new Float32Array([cx, cy, z, cx, cy + length, z]),
        z: new Float32Array([cx, cy, z, cx, cy, z + length]),
      }
    }

    function MeshViewer({ url, wireframe, viewCommand, t, onReady }) {
      const canvasRef = React.useRef(null)
      const hostRef = React.useRef(null)
      const rendererRef = React.useRef(null)
      const [state, setState] = React.useState({ status: 'loading', error: '' })

      React.useEffect(() => {
        let disposed = false
        const canvas = canvasRef.current
        const host = hostRef.current
        if (!canvas || !host) return undefined
        let gl
        try {
          gl = canvas.getContext('webgl', {
            alpha: true,
            antialias: true,
            premultipliedAlpha: false,
          })
        } catch {
          gl = null
        }
        if (!gl) {
          setState({ status: 'error', error: '当前浏览器不支持 WebGL' })
          return undefined
        }
        const program = createProgram(gl)
        const locations = {
          pos: gl.getAttribLocation(program, 'aPos'),
          normal: gl.getAttribLocation(program, 'aNormal'),
          view: gl.getUniformLocation(program, 'uView'),
          proj: gl.getUniformLocation(program, 'uProj'),
          color: gl.getUniformLocation(program, 'uColor'),
          alpha: gl.getUniformLocation(program, 'uAlpha'),
          flat: gl.getUniformLocation(program, 'uFlat'),
        }
        const renderer = {
          gl,
          program,
          locations,
          mesh: undefined,
          edges: undefined,
          grid: undefined,
          axes: undefined,
          bounds: undefined,
          wireframe: Boolean(wireframe),
          azimuth: -0.72,
          elevation: 0.52,
          distance: 2.35,
          frame: 0,
          dirty: true,
          scheduled: false,
          raf: 0,
          width: 0,
          height: 0,
        }
        rendererRef.current = renderer

        function requestDraw() {
          if (renderer.scheduled || disposed) return
          renderer.scheduled = true
          renderer.raf = requestAnimationFrame(() => {
            renderer.scheduled = false
            if (!disposed) draw()
          })
        }

        function resize() {
          const rect = host.getBoundingClientRect()
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          const width = Math.max(1, Math.round(rect.width * dpr))
          const height = Math.max(1, Math.round(rect.height * dpr))
          if (renderer.width === width && renderer.height === height) return
          renderer.width = width
          renderer.height = height
          canvas.width = width
          canvas.height = height
          gl.viewport(0, 0, width, height)
        }

        function drawBuffer(buffer, mode, count, color, alpha, flat, depthTest) {
          if (!buffer) return
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
          gl.enableVertexAttribArray(locations.pos)
          gl.vertexAttribPointer(locations.pos, 3, gl.FLOAT, false, 0, 0)
          if (locations.normal >= 0) {
            gl.disableVertexAttribArray(locations.normal)
            gl.vertexAttrib3f(locations.normal, 0, 0, 1)
          }
          gl.uniform3f(locations.color, color[0], color[1], color[2])
          gl.uniform1f(locations.alpha, alpha)
          gl.uniform1f(locations.flat, flat ? 1 : 0)
          if (depthTest) gl.enable(gl.DEPTH_TEST)
          else gl.disable(gl.DEPTH_TEST)
          gl.drawArrays(mode, 0, count)
        }

        function draw() {
          if (!renderer.bounds) return
          resize()
          const aspect = renderer.width / renderer.height
          const bounds = renderer.bounds
          const radius = bounds.maxDim * renderer.distance
          const ce = Math.cos(renderer.elevation)
          const eye = [
            bounds.center[0] + radius * ce * Math.cos(renderer.azimuth),
            bounds.center[1] + radius * ce * Math.sin(renderer.azimuth),
            bounds.center[2] + radius * Math.sin(renderer.elevation),
          ]
          const view = lookAt(eye, bounds.center, [0, 0, 1])
          const near = Math.max(bounds.maxDim * 0.012, 0.02)
          const far = Math.max(bounds.maxDim * 40, 100)
          const projection = perspective((38 * Math.PI) / 180, aspect, near, far)

          gl.clearColor(0, 0, 0, 0)
          gl.clearDepth(1)
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          gl.useProgram(program)
          gl.uniformMatrix4fv(locations.view, false, view)
          gl.uniformMatrix4fv(locations.proj, false, projection)
          gl.enable(gl.BLEND)
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
          gl.depthMask(false)
          drawBuffer(renderer.grid, gl.LINES, renderer.grid ? renderer.grid.length / 3 : 0, [0.32, 0.48, 0.64], 0.2, true, true)
          gl.depthMask(true)
          if (renderer.axes) {
            drawBuffer(renderer.axes.x, gl.LINES, 2, [0.92, 0.36, 0.38], 0.85, true, false)
            drawBuffer(renderer.axes.y, gl.LINES, 2, [0.34, 0.84, 0.6], 0.85, true, false)
            drawBuffer(renderer.axes.z, gl.LINES, 2, [0.38, 0.64, 1], 0.85, true, false)
          }
          gl.enable(gl.DEPTH_TEST)
          gl.depthFunc(gl.LEQUAL)
          gl.depthMask(true)
          gl.disable(gl.BLEND)
          gl.bindBuffer(gl.ARRAY_BUFFER, renderer.mesh.positions)
          gl.enableVertexAttribArray(locations.pos)
          gl.vertexAttribPointer(locations.pos, 3, gl.FLOAT, false, 0, 0)
          gl.bindBuffer(gl.ARRAY_BUFFER, renderer.mesh.normals)
          gl.enableVertexAttribArray(locations.normal)
          gl.vertexAttribPointer(locations.normal, 3, gl.FLOAT, false, 0, 0)
          gl.uniform3f(locations.color, 0.18, 0.76, 0.69)
          gl.uniform1f(locations.alpha, 1)
          gl.uniform1f(locations.flat, 0)
          gl.drawArrays(gl.TRIANGLES, 0, renderer.mesh.count)
          if (renderer.wireframe && renderer.edges) {
            gl.disable(gl.DEPTH_TEST)
            gl.enable(gl.BLEND)
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
            drawBuffer(renderer.edges, gl.LINES, renderer.edges.length / 3, [0.66, 0.87, 0.97], 0.24, true, false)
            gl.disable(gl.BLEND)
          }
        }

        function fit() {
          if (!renderer.bounds) return
          renderer.azimuth = -0.72
          renderer.elevation = 0.52
          renderer.distance = 2.35
          requestDraw()
        }

        function setView(name) {
          if (!renderer.bounds) return
          if (name === 'iso') {
            renderer.azimuth = -0.72
            renderer.elevation = 0.52
          } else if (name === 'front') {
            renderer.azimuth = -Math.PI / 2
            renderer.elevation = 0
          } else if (name === 'top') {
            renderer.azimuth = -Math.PI / 2
            renderer.elevation = 1.5
          } else if (name === 'reset') {
            fit()
            return
          }
          renderer.distance = 2.35
          requestDraw()
        }

        renderer.setView = setView
        renderer.fit = fit
        renderer.setWireframe = (value) => {
          renderer.wireframe = Boolean(value)
          requestDraw()
        }

        const resizeObserver = new ResizeObserver(requestDraw)
        resizeObserver.observe(host)

        let dragging = false
        let lastX = 0
        let lastY = 0
        const onPointerDown = (event) => {
          dragging = true
          lastX = event.clientX
          lastY = event.clientY
          canvas.setPointerCapture?.(event.pointerId)
          canvas.style.cursor = 'grabbing'
        }
        const onPointerMove = (event) => {
          if (!dragging) return
          const dx = event.clientX - lastX
          const dy = event.clientY - lastY
          lastX = event.clientX
          lastY = event.clientY
          renderer.azimuth -= dx * 0.007
          renderer.elevation = Math.max(-1.48, Math.min(1.52, renderer.elevation - dy * 0.006))
          requestDraw()
        }
        const onPointerUp = (event) => {
          dragging = false
          canvas.releasePointerCapture?.(event.pointerId)
          canvas.style.cursor = 'grab'
        }
        const onWheel = (event) => {
          event.preventDefault()
          renderer.distance = Math.max(1.15, Math.min(6.2, renderer.distance * Math.exp(event.deltaY * 0.001)))
          requestDraw()
        }
        const onDoubleClick = () => fit()
        canvas.addEventListener('pointerdown', onPointerDown)
        canvas.addEventListener('pointermove', onPointerMove)
        canvas.addEventListener('pointerup', onPointerUp)
        canvas.addEventListener('pointercancel', onPointerUp)
        canvas.addEventListener('wheel', onWheel, { passive: false })
        canvas.addEventListener('dblclick', onDoubleClick)

        setState({ status: 'loading', error: '' })
        fetch(url, { cache: 'no-store' })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.arrayBuffer()
          })
          .then((buffer) => {
            if (disposed) return
            const parsed = parseStl(buffer)
            const bounds = boundsOf(parsed.positions)
            renderer.mesh = {
              positions: makeBuffer(gl, parsed.positions),
              normals: makeBuffer(gl, parsed.normals),
              count: parsed.triangles * 3,
            }
            const edges = edgeBuffer(parsed.positions)
            renderer.edges = edges ? makeBuffer(gl, edges) : undefined
            const grid = gridGeometry(bounds)
            renderer.grid = makeBuffer(gl, grid)
            const axes = axisGeometry(bounds)
            renderer.axes = {
              x: makeBuffer(gl, axes.x),
              y: makeBuffer(gl, axes.y),
              z: makeBuffer(gl, axes.z),
            }
            renderer.bounds = bounds
            setState({ status: 'ready', error: '' })
            if (onReady) onReady({ triangles: parsed.triangles, bounds })
            requestDraw()
          })
          .catch((error) => {
            if (disposed) return
            setState({ status: 'error', error: error instanceof Error ? error.message : String(error) })
          })

        return () => {
          disposed = true
          cancelAnimationFrame(renderer.raf)
          resizeObserver.disconnect()
          canvas.removeEventListener('pointerdown', onPointerDown)
          canvas.removeEventListener('pointermove', onPointerMove)
          canvas.removeEventListener('pointerup', onPointerUp)
          canvas.removeEventListener('pointercancel', onPointerUp)
          canvas.removeEventListener('wheel', onWheel)
          canvas.removeEventListener('dblclick', onDoubleClick)
          const buffers = [renderer.mesh?.positions, renderer.mesh?.normals, renderer.edges, renderer.grid]
          if (renderer.axes) buffers.push(renderer.axes.x, renderer.axes.y, renderer.axes.z)
          for (const buffer of buffers) if (buffer) gl.deleteBuffer(buffer)
          gl.deleteProgram(program)
          rendererRef.current = null
        }
      }, [url])

      React.useEffect(() => {
        const renderer = rendererRef.current
        if (!renderer) return
        renderer.setWireframe(wireframe)
      }, [wireframe])

      React.useEffect(() => {
        const renderer = rendererRef.current
        if (!renderer || !viewCommand || !viewCommand.name) return
        renderer.setView(viewCommand.name)
      }, [viewCommand])

      return h(
        'div',
        { ref: hostRef, style: { position: 'absolute', inset: 0 } },
        h('canvas', { ref: canvasRef, className: 'm3d-canvas', 'aria-label': t('viewer.label') }),
        h('div', { className: 'm3d-grid-fade' }),
        state.status === 'loading'
          ? h(
              'div',
              {
                style: {
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#9bb4ca',
                  fontSize: 11,
                  pointerEvents: 'none',
                },
              },
              h(Spinner, { size: 18 }),
              h('span', { style: { marginLeft: 8 } }, t('viewer.loading')),
            )
          : null,
        state.status === 'error'
          ? h(
              'div',
              {
                style: {
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#ff9a9a',
                  fontSize: 11,
                  background: 'rgba(5,12,20,.55)',
                },
              },
              `${t('viewer.loadFailed')} · ${state.error}`,
            )
          : null,
      )
    }

    function EmptyViewport({ t }) {
      return h(
        'div',
        { className: 'm3d-empty' },
        h(
          'div',
          { className: 'm3d-empty-art' },
          h(
            'svg',
            { width: 104, height: 104, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 0.45 },
            h('path', { d: 'M12 2.7 21 7.4v9.2L12 21.3 3 16.6V7.4L12 2.7Z' }),
            h('path', { d: 'M3.4 7.5 12 12l8.6-4.5' }),
            h('path', { d: 'M12 12v9.1' }),
            h('path', { d: 'M7.7 5 16.3 9.5', strokeDasharray: '0.8 0.9' }),
            h('path', { d: 'M7.7 9.5 16.3 5', strokeDasharray: '0.8 0.9' }),
          ),
        ),
        h('div', { className: 'm3d-empty-title' }, t('viewer.emptyTitle')),
        h('div', { className: 'm3d-empty-body' }, t('viewer.emptyBody')),
        h(
          'div',
          { className: 'm3d-empty-tag' },
          h(Icon, { name: 'spark', size: 11 }),
          t('viewer.emptyTag'),
        ),
      )
    }

    function GeneratingOverlay({ t, step }) {
      const steps = [t('generation.step1'), t('generation.step2'), t('generation.step3')]
      return h(
        'div',
        { className: 'm3d-overlay' },
        h(
          'div',
          { className: 'm3d-gen-card' },
          h(
            'div',
            { className: 'm3d-gen-head' },
            h('div', { className: 'm3d-orbit' }, h(Icon, { name: 'cube', size: 21 })),
            h(
              'div',
              null,
              h('div', { className: 'm3d-gen-title' }, t('generation.title')),
              h('div', { className: 'm3d-gen-sub' }, 'build123d · headless Python'),
            ),
          ),
          h(
            'div',
            { className: 'm3d-steps' },
            steps.map((label, index) =>
              h(
                'div',
                { className: `m3d-step ${index < step ? 'done' : index === step ? 'active' : ''}`, key: index },
                h('i', null, index < step ? h(Icon, { name: 'check', size: 8, strokeWidth: 2.4 }) : ''),
                h('span', null, label),
              ),
            ),
          ),
          h('div', { className: 'm3d-progress' }, h('span')),
        ),
      )
    }

    function FailureOverlay({ t, error, onRetry }) {
      return h(
        'div',
        { className: 'm3d-overlay' },
        h(
          'div',
          { className: 'm3d-fail-card' },
          h(
            'div',
            { className: 'm3d-fail-head' },
            h(Icon, { name: 'alert', size: 17 }),
            t('generation.failed'),
          ),
          h('div', { className: 'm3d-fail-body' }, error || 'Unknown error'),
          h(
            'div',
            { className: 'm3d-fail-actions' },
            h(
              'button',
              { type: 'button', className: 'm3d-btn sm primary', onClick: onRetry },
              h(Icon, { name: 'reset', size: 12 }),
              t('generation.retry'),
            ),
          ),
        ),
      )
    }

    function useSessionData(sessionId) {
      const [state, setState] = React.useState({ status: 'loading' })
      const serialRef = React.useRef('')
      React.useEffect(() => {
        if (!sessionId) {
          setState({ status: 'empty' })
          return undefined
        }
        let alive = true
        let inFlight = false
        serialRef.current = ''
        setState({ status: 'loading' })
        const load = async () => {
          if (inFlight || !alive) return
          inFlight = true
          try {
            const data = await api(`/session-state?sessionId=${encodeURIComponent(sessionId)}`)
            if (!alive) return
            const serialized = JSON.stringify(data)
            if (serialized !== serialRef.current) {
              serialRef.current = serialized
              setState({ status: 'ready', data })
            } else {
              setState((current) => (current.status === 'ready' ? current : { status: 'ready', data }))
            }
          } catch (error) {
            if (!alive) return
            setState((current) =>
              current.status === 'ready'
                ? current
                : { status: 'error', error: error instanceof Error ? error.message : String(error) },
            )
          } finally {
            inFlight = false
          }
        }
        load()
        const timer = setInterval(load, 1800)
        const onVisibility = () => {
          if (!document.hidden) load()
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
          alive = false
          clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisibility)
        }
      }, [sessionId])
      return state
    }

    function SessionLoading({ t }) {
      return h(
        'div',
        { className: 'm3d-session-view' },
        h(
          'div',
          { className: 'm3d-session-loading', role: 'status' },
          h(Spinner, { size: 18 }),
          h('span', null, t('session.loading')),
        ),
      )
    }

    function SessionEmpty({ t, icon, title, body, tag }) {
      return h(
        'div',
        { className: 'm3d-session-view' },
        h(
          'div',
          { className: 'm3d-empty' },
          h('div', { className: 'm3d-empty-art' }, h(Icon, { name: icon, size: 24 })),
          h('div', { className: 'm3d-empty-title' }, title),
          h('div', { className: 'm3d-empty-body' }, body),
          tag ? h('div', { className: 'm3d-empty-tag' }, tag) : null,
        ),
      )
    }

    function SessionSpecView({ sessionId, t, useProjection }) {
      const preset = useProjection('agentPreset')
      const state = useSessionData(sessionId)
      if (preset === undefined) return h(SessionLoading, { t })
      if (preset !== 'model3d') {
        return h(SessionEmpty, {
          t,
          icon: 'spec',
          title: t('session.notModelingTitle'),
          body: t('session.notModelingBody'),
        })
      }
      if (!sessionId) {
        return h(SessionEmpty, { t, icon: 'spec', title: t('session.noSession'), body: t('session.noSessionBody') })
      }
      if (state.status === 'loading' || state.status === 'empty') return h(SessionLoading, { t })
      if (state.status === 'error') {
        return h(SessionEmpty, {
          t,
          icon: 'alert',
          title: t('session.errorTitle'),
          body: t('session.errorBody', { error: state.error }),
        })
      }
      const spec = state.data && state.data.spec
      if (!spec) {
        return h(SessionEmpty, {
          t,
          icon: 'spec',
          title: t('session.emptySpecTitle'),
          body: t('session.emptySpecBody'),
        })
      }
      return h('div', { className: 'm3d-session-view' }, h(SpecView, { spec, model: state.data.model, t, readOnly: true }))
    }

    function SessionModelView({ sessionId, t, useProjection }) {
      const preset = useProjection('agentPreset')
      const state = useSessionData(sessionId)
      const [wireframe, setWireframe] = React.useState(false)
      const [viewCommand, setViewCommand] = React.useState({ name: 'iso', seq: 0 })
      const [meshInfo, setMeshInfo] = React.useState(null)
      const model = state.status === 'ready' ? state.data?.model : null
      const stlUrl = model?.stlUrl || ''
      React.useEffect(() => {
        setMeshInfo(null)
      }, [stlUrl])
      if (preset === undefined) return h(SessionLoading, { t })
      if (preset !== 'model3d') {
        return h(SessionEmpty, {
          t,
          icon: 'cube',
          title: t('session.notModelingTitle'),
          body: t('session.notModelingBody'),
        })
      }
      if (!sessionId) {
        return h(SessionEmpty, { t, icon: 'cube', title: t('session.noSession'), body: t('session.noSessionBody') })
      }
      if (state.status === 'loading' || state.status === 'empty') return h(SessionLoading, { t })
      if (state.status === 'error') {
        return h(SessionEmpty, {
          t,
          icon: 'alert',
          title: t('session.errorTitle'),
          body: t('session.errorBody', { error: state.error }),
        })
      }
      if (!model) {
        return h(SessionEmpty, {
          t,
          icon: 'cube',
          title: t('session.emptyModelTitle'),
          body: t('session.emptyModelBody'),
        })
      }
      const issueView = (name) => setViewCommand({ name, seq: Date.now() })
      return h(
        'div',
        { className: 'm3d-session-view' },
        h(
          'div',
          { className: 'm3d-session-stage' },
          h(MeshViewer, { key: stlUrl, url: stlUrl, wireframe, viewCommand, t, onReady: setMeshInfo }),
          h('div', { className: 'm3d-grid-fade' }),
          h(
            'div',
            { className: 'm3d-view-label' },
            h('span', null, t('viewer.label')),
            h('b', null, model.title || '3D Model'),
          ),
          h(
            'div',
            { className: 'm3d-view-toolbar', role: 'toolbar' },
            h(
              'button',
              { type: 'button', className: 'm3d-vbtn', onClick: () => issueView('iso'), title: t('viewer.iso') },
              h(Icon, { name: 'cube', size: 13 }),
              t('viewer.iso'),
            ),
            h(
              'button',
              { type: 'button', className: 'm3d-vbtn', onClick: () => issueView('front'), title: t('viewer.front') },
              t('viewer.front'),
            ),
            h(
              'button',
              { type: 'button', className: 'm3d-vbtn', onClick: () => issueView('top'), title: t('viewer.top') },
              t('viewer.top'),
            ),
            h('span', { className: 'm3d-vsep' }),
            h(
              'button',
              {
                type: 'button',
                className: `m3d-vbtn ${wireframe ? 'active' : ''}`,
                onClick: () => setWireframe((value) => !value),
                title: t('viewer.wireframe'),
                'aria-pressed': wireframe,
              },
              h(Icon, { name: 'wire', size: 13 }),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'm3d-vbtn',
                onClick: () => issueView('reset'),
                title: t('viewer.reset'),
                'aria-label': t('viewer.reset'),
              },
              h(Icon, { name: 'reset', size: 13 }),
            ),
            h('span', { className: 'm3d-vsep' }),
            h(
              'a',
              { className: 'm3d-vbtn', href: `${model.stlUrl}?download=1`, download: 'part.stl', title: t('download.stl') },
              'STL',
            ),
            h(
              'a',
              { className: 'm3d-vbtn', href: `${model.stepUrl}?download=1`, download: 'part.step', title: t('download.step') },
              'STEP',
            ),
          ),
          h(
            'div',
            { className: 'm3d-view-footer' },
            h(
              'div',
              { className: 'm3d-view-hint' },
              h(Icon, { name: 'layers', size: 11 }),
              t('viewer.hint'),
            ),
            h(
              'div',
              { className: 'm3d-stats' },
              h('span', { className: 'm3d-stat' }, t('viewer.sizeShort'), h('b', null, sizeText(model.meta))),
              h('span', { className: 'm3d-stat' }, t('viewer.volumeShort'), h('b', null, `${volumeText(model.meta)} cm³`)),
              meshInfo
                ? h('span', { className: 'm3d-stat' }, t('viewer.triangles'), h('b', null, formatNumber(meshInfo.triangles, 0)))
                : null,
              h(
                'span',
                { className: `m3d-stat ${model.meta && model.meta.valid ? 'good' : 'bad'}` },
                model.meta && model.meta.valid ? t('viewer.valid') : t('viewer.invalid'),
              ),
            ),
          ),
        ),
      )
    }

    function SessionTypeMarker({ sessionId, useProjection }) {
      const preset = useProjection('agentPreset')
      React.useEffect(() => {
        if (preset === undefined) return undefined
        const value = preset === 'model3d' ? '1' : '0'
        document.body.dataset.model3dSession = value
        return () => {
          if (document.body.dataset.model3dSession === value) {
            delete document.body.dataset.model3dSession
          }
        }
      }, [preset, sessionId])
      return null
    }

    function SessionsView({ projects, currentId, t, busy, loading, onOpen, onNew, timeText }) {
      const [search, setSearch] = React.useState('')
      const [filter, setFilter] = React.useState('all')
      const query = search.trim().toLowerCase()
      const filtered = projects.filter((item) => {
        if (filter === 'model' && !item.hasModel) return false
        if (filter === 'workspace' && !item.workspaceId) return false
        if (!query) return true
        return `${item.title || ''} ${item.modelTitle || ''} ${item.path || ''}`.toLowerCase().includes(query)
      })
      const emptyTitle = query
        ? t('project.noMatches')
        : filter === 'model'
          ? t('project.emptyModel')
          : filter === 'workspace'
            ? t('project.emptyWorkspace')
            : t('project.empty')
      const filters = [
        ['all', t('project.filterAll')],
        ['model', t('project.filterModel')],
        ['workspace', t('project.filterWorkspace')],
      ]
      return h(
        'section',
        { className: 'm3d-sessions', 'aria-label': t('project.sessions') },
        h(
          'div',
          { className: 'm3d-sessions-scroll' },
          h(
            'div',
            { className: 'm3d-sessions-content' },
            h(
              'div',
              { className: 'm3d-sessions-head' },
              h('h1', null, t('project.sessions')),
              h(
                'div',
                { className: 'm3d-sessions-actions' },
                h(
                  'button',
                  { type: 'button', className: 'm3d-btn sm primary', onClick: onNew, disabled: busy },
                  h(Icon, { name: 'plus', size: 12 }),
                  t('project.new'),
                ),
              ),
            ),
            h(
              'div',
              { className: 'm3d-sessions-filters', role: 'group', 'aria-label': t('project.filterLabel') },
              filters.map(([value, label]) =>
                h(
                  'button',
                  {
                    type: 'button',
                    key: value,
                    className: `m3d-sfilter ${filter === value ? 'active' : ''}`,
                    'aria-pressed': filter === value,
                    onClick: () => setFilter(value),
                  },
                  label,
                ),
              ),
            ),
            h(
              'div',
              { className: 'm3d-sessions-search' },
              h(Icon, { name: 'search', size: 13 }),
              h('input', {
                type: 'search',
                value: search,
                placeholder: t('project.search'),
                'aria-label': t('project.search'),
                onChange: (event) => setSearch(event.target.value),
              }),
            ),
            loading && filtered.length === 0
              ? h(
                  'div',
                  { className: 'm3d-sessions-loading', role: 'status' },
                  h(Spinner, { size: 16 }),
                  h('span', null, t('project.loading')),
                )
              : filtered.length > 0
              ? h(
                  'ul',
                  { className: 'm3d-session-list' },
                  filtered.map((item) =>
                    h(
                      'li',
                      { key: item.id, className: 'm3d-session-item' },
                      h(
                        'button',
                        {
                          type: 'button',
                          className: `m3d-session-row ${item.id === currentId ? 'active' : ''}`,
                          onClick: () => onOpen(item.id),
                          disabled: busy,
                        },
                        h(
                          'span',
                          { className: 'm3d-session-glyph' },
                          h(Icon, { name: item.hasModel ? 'cube' : 'folder', size: 15 }),
                        ),
                        h(
                          'span',
                          { className: 'm3d-session-body' },
                          h('span', { className: 'm3d-session-title' }, item.title || t('project.defaultTitle')),
                          h(
                            'span',
                            { className: 'm3d-session-meta' },
                            [
                              item.hasModel ? item.modelTitle || t('project.hasModel') : t('project.noModel'),
                              item.workspaceId ? t('project.inWorkspace') : null,
                              timeText(item.updatedAt),
                            ]
                              .filter(Boolean)
                              .join(' · '),
                          ),
                        ),
                        item.id === currentId ? h(Icon, { name: 'check', size: 14 }) : null,
                      ),
                    ),
                  ),
                )
              : h(
                  'div',
                  { className: 'm3d-sessions-empty' },
                  h(Icon, { name: 'folder', size: 24 }),
                  h('b', null, emptyTitle),
                  h('p', null, t('project.emptyHint')),
                  h(
                    'button',
                    { type: 'button', className: 'm3d-btn sm', onClick: onNew, disabled: busy },
                    h(Icon, { name: 'plus', size: 12 }),
                    t('project.new'),
                  ),
                ),
          ),
        ),
      )
    }


    function StudioPanel({ locale }) {
      const t = useT(locale)
      const [messages, setMessages] = React.useState([
        { id: 'welcome', role: 'assistant', kind: 'welcome', content: '' },
      ])
      const [input, setInput] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [stage, setStage] = React.useState('chat')
      const [spec, setSpec] = React.useState(null)
      const [model, setModel] = React.useState(null)
      const [code, setCode] = React.useState('')
      const [activeTab, setActiveTab] = React.useState('model')
      const [wireframe, setWireframe] = React.useState(false)
      const [viewCommand, setViewCommand] = React.useState({ name: 'iso', seq: 0 })
      const [status, setStatus] = React.useState({ state: 'loading' })
      const [genStep, setGenStep] = React.useState(0)
      const [generationError, setGenerationError] = React.useState('')
      const [toast, setToast] = React.useState('')
      const [meshInfo, setMeshInfo] = React.useState(null)
      const [projects, setProjects] = React.useState([])
      const [project, setProject] = React.useState(null)
      const [view, setView] = React.useState('list')
      const [detailMenuOpen, setDetailMenuOpen] = React.useState(false)
      const [renameTarget, setRenameTarget] = React.useState(null)
      const [renameValue, setRenameValue] = React.useState('')
      const [deleteTarget, setDeleteTarget] = React.useState(null)
      const [actionBusy, setActionBusy] = React.useState(false)
      const [projectBusy, setProjectBusy] = React.useState(false)
      const [hydrating, setHydrating] = React.useState(true)
      const scrollRef = React.useRef(null)
      const inputRef = React.useRef(null)
      const saveTimerRef = React.useRef(null)
      const detailMenuRef = React.useRef(null)
      const skipSaveRef = React.useRef(true)
      const saveErrorRef = React.useRef(false)
      const idRef = React.useRef(0)
      const autoSpecRef = React.useRef('')
      const aliveRef = React.useRef(true)

      React.useEffect(() => {
        aliveRef.current = true
        api('/status')
          .then((value) => {
            if (aliveRef.current) setStatus({ state: 'ready', ...value })
          })
          .catch((error) => {
            if (aliveRef.current) {
              setStatus({ state: 'error', ok: false, message: error.message })
            }
          })
        return () => {
          aliveRef.current = false
        }
      }, [])

      React.useEffect(() => {
        let cancelled = false
        ;(async () => {
          try {
            const data = await api('/projects')
            if (cancelled || !aliveRef.current) return
            const list = Array.isArray(data.projects) ? data.projects : []
            setProjects(list)
            setHydrating(false)
            skipSaveRef.current = false
          } catch (error) {
            if (cancelled || !aliveRef.current) return
            setHydrating(false)
            skipSaveRef.current = false
            const message = error instanceof Error ? error.message : String(error)
            setToast(t('project.loadFailed', { error: message }))
          }
        })()
        return () => {
          cancelled = true
        }
      }, [])

      React.useEffect(() => {
        const node = scrollRef.current
        if (node) node.scrollTop = node.scrollHeight
      }, [messages, busy])

      React.useEffect(() => {
        if (!project?.id || hydrating || skipSaveRef.current) return undefined
        const hasContent = messages.some((message) => message.role === 'user') || Boolean(spec) || Boolean(model)
        if (!hasContent) return undefined
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(async () => {
          const payload = projectPayload(project)
          try {
            const saved = await api(`/projects/${encodeURIComponent(project.id)}`, {
              method: 'PUT',
              body: JSON.stringify(payload),
            })
            if (!aliveRef.current) return
            saveErrorRef.current = false
            const next = saved.project
            if (next?.title && next.title !== project.title) {
              setProject((current) => (current && current.id === project.id ? { ...current, title: next.title } : current))
            }
            setProjects((current) =>
              current.map((item) =>
                item.id === project.id
                  ? {
                      ...item,
                      title: next?.title || item.title,
                      updatedAt: next?.updatedAt || Date.now(),
                      hasModel: Boolean(next?.model || item.hasModel),
                      workspaceId: next?.workspaceId ?? item.workspaceId,
                    }
                  : item,
              ),
            )
          } catch {
            if (!aliveRef.current || saveErrorRef.current) return
            saveErrorRef.current = true
            setToast(t('project.saveFailed'))
          }
        }, 500)
        return () => clearTimeout(saveTimerRef.current)
      }, [project?.id, project?.title, messages, spec, model, code, stage, activeTab, generationError, hydrating])

      React.useEffect(() => {
        if (stage !== 'generating') return undefined
        setGenStep(0)
        const timer = setInterval(() => {
          setGenStep((value) => (value < 2 ? value + 1 : value))
        }, 1700)
        return () => clearInterval(timer)
      }, [stage])

      React.useEffect(() => {
        if (!toast) return undefined
        const timer = setTimeout(() => setToast(''), 2200)
        return () => clearTimeout(timer)
      }, [toast])

      React.useEffect(() => {
        if (!detailMenuOpen) return undefined
        const onPointerDown = (event) => {
          if (detailMenuRef.current && !detailMenuRef.current.contains(event.target)) setDetailMenuOpen(false)
        }
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setDetailMenuOpen(false)
        }
        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
          document.removeEventListener('mousedown', onPointerDown)
          document.removeEventListener('keydown', onKeyDown)
        }
      }, [detailMenuOpen])

      React.useEffect(() => {
        if (!renameTarget && !deleteTarget) return undefined
        const onKeyDown = (event) => {
          if (event.key === 'Escape' && !actionBusy) {
            setRenameTarget(null)
            setDeleteTarget(null)
          }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [renameTarget, deleteTarget, actionBusy])

      React.useEffect(() => {
        if (inputRef.current) inputRef.current.focus()
      }, [])

      const nextId = () => {
        idRef.current += 1
        return `m${idRef.current}`
      }

      const cleanHistory = (items) =>
        items
          .filter((item) => item.role === 'user' || (item.role === 'assistant' && item.kind !== 'welcome' && item.kind !== 'error'))
          .map((item) => ({ role: item.role, content: item.content }))

      const briefOf = (items) => {
        const first = items.find((item) => item.role === 'user')
        return first ? first.content : ''
      }

      function isUntitledTitle(value) {
        return !value || value === UNTITLED_TITLE || value === t('project.defaultTitle')
      }

      function projectPayload(record) {
        const firstUser = messages.find((message) => message.role === 'user')
        const fallback = firstUser ? firstUser.content.replace(/\s+/g, ' ').trim().slice(0, 60) : ''
        const title = isUntitledTitle(record.title)
          ? spec?.title || fallback || record.title || t('project.defaultTitle')
          : record.title
        const saveStage =
          stage === 'generating' ? (model ? 'done' : spec ? 'ready' : 'chat') : stage
        return {
          title: String(title).slice(0, 120),
          messages,
          spec,
          model,
          code,
          stage: saveStage,
          activeTab,
          generationError,
        }
      }

      function applyProjectRecord(record) {
        skipSaveRef.current = true
        clearTimeout(saveTimerRef.current)
        setProject(record)
        const restored = Array.isArray(record.messages) ? record.messages : []
        setMessages(restored.length > 0 ? restored : [{ id: 'welcome', role: 'assistant', kind: 'welcome', content: '' }])
        setSpec(record.spec || null)
        setModel(record.model || null)
        setCode(record.code || record.model?.code || '')
        let nextStage = record.stage || (record.model ? 'done' : 'chat')
        if (record.model) nextStage = 'done'
        else if (nextStage === 'done' || nextStage === 'generating') nextStage = record.spec ? 'ready' : 'chat'
        setStage(nextStage)
        let tab = record.activeTab || (record.model ? 'model' : record.spec ? 'spec' : 'model')
        if (!record.model && tab === 'model' && record.spec) tab = 'spec'
        if (!(record.code || record.model?.code) && tab === 'code') tab = record.spec ? 'spec' : 'model'
        setActiveTab(tab)
        setGenerationError(record.generationError || '')
        setMeshInfo(null)
        setInput('')
        setBusy(false)
        setWireframe(false)
        setHydrating(false)
        setView('studio')
        setDetailMenuOpen(false)
        autoSpecRef.current = record.spec ? JSON.stringify(record.spec) : ''
        skipSaveRef.current = false
      }

      async function loadProject(id, options) {
        if (!id) return
        if (!options?.initial) {
          if (busy || stage === 'generating' || projectBusy) {
            setToast(t('project.busy'))
            return
          }
          await flushProject()
        }
        setProjectBusy(true)
        setHydrating(true)
        skipSaveRef.current = true
        try {
          const data = await api(`/projects/${encodeURIComponent(id)}`)
          if (!aliveRef.current) return
          const record = data.project
          applyProjectRecord(record)
          setProjects((current) => {
            const summary = {
              ...record,
              messages: undefined,
              spec: undefined,
              model: undefined,
              code: undefined,
            }
            const exists = current.some((item) => item.id === record.id)
            return exists
              ? current.map((item) => (item.id === record.id ? { ...item, ...record, messages: undefined, spec: undefined, model: undefined, code: undefined } : item))
              : [summary, ...current]
          })
          try {
            localStorage.setItem(LAST_PROJECT_KEY, record.id)
          } catch {
            // Local storage may be unavailable.
          }
        } catch (error) {
          if (!aliveRef.current) return
          setHydrating(false)
          skipSaveRef.current = false
          const message = error instanceof Error ? error.message : String(error)
          setToast(t('project.loadFailed', { error: message }))
        } finally {
          if (aliveRef.current) setProjectBusy(false)
        }
      }

      async function flushProject() {
        if (!project?.id || hydrating) return
        clearTimeout(saveTimerRef.current)
        try {
          await api(`/projects/${encodeURIComponent(project.id)}`, {
            method: 'PUT',
            body: JSON.stringify(projectPayload(project)),
          })
        } catch {
          // The debounced save will retry while the editor stays open.
        }
      }

      async function refreshProjects() {
        try {
          const data = await api('/projects')
          const list = Array.isArray(data.projects) ? data.projects : []
          setProjects(list)
          return list
        } catch {
          return projects
        }
      }

      async function openSessionList() {
        if (projectBusy) return
        setDetailMenuOpen(false)
        setView('list')
        await flushProject()
        await refreshProjects()
      }

      async function chooseProject(id) {
        if (!id) return
        if (project?.id === id) {
          setView('studio')
          return
        }
        if (busy || stage === 'generating' || projectBusy) {
          setToast(t('project.busy'))
          return
        }
        await loadProject(id)
      }

      async function newProject() {
        if (busy || stage === 'generating' || projectBusy) {
          setToast(t('project.busy'))
          return
        }
        setProjectBusy(true)
        try {
          await flushProject()
          const data = await api('/projects', {
            method: 'POST',
            body: JSON.stringify({ title: t('project.defaultTitle') }),
          })
          if (!aliveRef.current) return
          const record = data.project
          setProjects((current) => [record, ...current.filter((item) => item.id !== record.id)])
          applyProjectRecord(record)
          try {
            localStorage.setItem(LAST_PROJECT_KEY, record.id)
          } catch {
            // Local storage may be unavailable.
          }
          setToast(t('project.created'))
        } catch (error) {
          if (!aliveRef.current) return
          const message = error instanceof Error ? error.message : String(error)
          setToast(t('project.createFailed', { error: message }))
        } finally {
          if (aliveRef.current) {
            setProjectBusy(false)
            setHydrating(false)
          }
        }
      }

      async function addProjectToWorkspace() {
        if (!project?.id || projectBusy || project.workspaceId) return
        setProjectBusy(true)
        try {
          const data = await api(`/projects/${encodeURIComponent(project.id)}/workspace`, { method: 'POST' })
          if (!aliveRef.current) return
          const next = data.project || project
          setProject((current) =>
            current && current.id === next.id
              ? { ...current, workspaceId: data.workspaceId, path: data.path || current.path }
              : current,
          )
          setProjects((current) =>
            current.map((item) =>
              item.id === next.id
                ? { ...item, workspaceId: data.workspaceId, path: data.path || item.path }
                : item,
            ),
          )
          setToast(t('project.workspaceAdded'))
        } catch (error) {
          if (!aliveRef.current) return
          const message = error instanceof Error ? error.message : String(error)
          setToast(t('project.workspaceFailed', { error: message }))
        } finally {
          if (aliveRef.current) setProjectBusy(false)
        }
      }

      async function renameProject(id, title) {
        const value = String(title ?? '').trim()
        if (!id || !value) return false
        if (projectBusy || busy || stage === 'generating') {
          setToast(t('project.busy'))
          return false
        }
        try {
          const data = await api(`/projects/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ title: value.slice(0, 120) }),
          })
          if (!aliveRef.current) return false
          const next = data.project
          setProjects((current) =>
            current.map((item) =>
              item.id === id ? { ...item, title: next?.title || value, updatedAt: next?.updatedAt || Date.now() } : item,
            ),
          )
          setProject((current) =>
            current && current.id === id ? { ...current, title: next?.title || value } : current,
          )
          setToast(t('project.renamed'))
          return true
        } catch (error) {
          if (!aliveRef.current) return false
          const message = error instanceof Error ? error.message : String(error)
          setToast(t('project.renameFailed', { error: message }))
          return false
        }
      }

      async function deleteProject(id) {
        if (!id) return false
        if (projectBusy || busy || stage === 'generating') {
          setToast(t('project.busy'))
          return false
        }
        const wasCurrent = project?.id === id
        try {
          await api(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
          if (!aliveRef.current) return false
          const remaining = projects.filter((item) => item.id !== id)
          setProjects(remaining)
          setToast(t('project.deleted'))
          if (wasCurrent) {
            setProject(null)
            setMessages([{ id: 'welcome', role: 'assistant', kind: 'welcome', content: '' }])
            setSpec(null)
            setModel(null)
            setCode('')
            setStage('chat')
            setActiveTab('model')
            setGenerationError('')
            setMeshInfo(null)
            setHydrating(false)
            setView('list')
            try {
              localStorage.removeItem(LAST_PROJECT_KEY)
            } catch {
              // Local storage may be unavailable.
            }
          }
          return true
        } catch (error) {
          if (!aliveRef.current) return false
          const message = error instanceof Error ? error.message : String(error)
          setToast(t('project.deleteFailed', { error: message }))
          return false
        }
      }

      function beginRename() {
        if (!project) return
        setDetailMenuOpen(false)
        setRenameTarget(project)
        setRenameValue(project.title || t('project.defaultTitle'))
      }

      function beginDelete() {
        if (!project) return
        setDetailMenuOpen(false)
        setDeleteTarget(project)
      }

      async function submitRename() {
        const value = renameValue.trim()
        if (!value || !renameTarget || actionBusy) return
        setActionBusy(true)
        const ok = await renameProject(renameTarget.id, value)
        setActionBusy(false)
        if (ok) setRenameTarget(null)
      }

      async function confirmDelete() {
        if (!deleteTarget || actionBusy) return
        setActionBusy(true)
        const ok = await deleteProject(deleteTarget.id)
        setActionBusy(false)
        if (ok) setDeleteTarget(null)
      }

      function projectTime(value) {
        const time = Number(value)
        if (!Number.isFinite(time)) return ''
        try {
          return new Date(time).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        } catch {
          return ''
        }
      }

      async function runGeneration(targetSpec, history) {
        if (!targetSpec) return
        setStage('generating')
        setGenerationError('')
        setActiveTab('model')
        setMeshInfo(null)
        try {
          const result = await api('/generate', {
            method: 'POST',
            body: JSON.stringify({
              projectId: project?.id,
              spec: targetSpec,
              history,
              brief: briefOf(history),
            }),
          })
          if (!aliveRef.current) return
          setModel(result)
          setCode(result.code || '')
          setStage('done')
          setActiveTab('model')
          setProject((current) => {
            if (!current || (result.projectId && current.id !== result.projectId)) return current
            return {
              ...current,
              title: isUntitledTitle(current.title) ? result.title || current.title : current.title,
              workspaceId: result.workspace?.workspaceId || current.workspaceId,
              path: result.workspace?.path || result.workspacePath || current.path,
              stage: 'done',
              spec: result.spec || targetSpec,
              model: result,
              code: result.code || '',
              activeTab: 'model',
              generationError: '',
            }
          })
          setProjects((current) =>
            current.map((item) =>
              item.id === result.projectId || item.id === project?.id
                ? {
                    ...item,
                    title: isUntitledTitle(item.title) ? result.title || item.title : item.title,
                    hasModel: true,
                    modelTitle: result.title || item.modelTitle,
                    workspaceId: result.workspace?.workspaceId || item.workspaceId,
                    path: result.workspace?.path || result.workspacePath || item.path,
                    stage: 'done',
                    updatedAt: Date.now(),
                  }
                : item,
            ),
          )
          setToast(t('toast.generated'))
          setMessages((current) => [
            ...current,
            {
              id: nextId(),
              role: 'assistant',
              kind: 'generated',
              content: t('message.generated', { title: result.title || '3D Model' }),
            },
          ])
        } catch (error) {
          if (!aliveRef.current) return
          const message = error instanceof Error ? error.message : String(error)
          setGenerationError(message)
          setStage('error')
          setMessages((current) => [
            ...current,
            {
              id: nextId(),
              role: 'assistant',
              kind: 'error',
              content: t('message.buildFailed', { error: message }),
            },
          ])
        }
      }

      async function send(text, options) {
        const content = String(text ?? '').trim()
        if (!content || busy || stage === 'generating' || hydrating || projectBusy) return
        if (!project?.id) {
          setToast(t('project.loading'))
          return
        }
        const forceReady = Boolean(options && options.forceReady)
        const userMessage = { id: nextId(), role: 'user', content }
        const nextMessages = [...messages, userMessage]
        setMessages(nextMessages)
        setInput('')
        setBusy(true)
        if (stage === 'done') setStage('chat')
        try {
          const history = cleanHistory(nextMessages)
          const response = await api('/chat', {
            method: 'POST',
            body: JSON.stringify({
              history,
              spec,
              brief: briefOf(nextMessages),
              forceReady,
            }),
          })
          if (!aliveRef.current) return
          const nextSpec = response.spec || spec
          setSpec(nextSpec)
          setMessages((current) => [
            ...current,
            {
              id: nextId(),
              role: 'assistant',
              content: response.message || '',
              questions: response.questions || [],
              missing: response.missing || [],
            },
          ])
          if (response.state === 'ready' && nextSpec) {
            setStage('ready')
            const key = JSON.stringify(nextSpec)
            if (key !== autoSpecRef.current || forceReady) {
              autoSpecRef.current = key
              setBusy(false)
              await runGeneration(nextSpec, cleanHistory(nextMessages))
              return
            }
          } else {
            setStage('chat')
          }
        } catch (error) {
          if (!aliveRef.current) return
          const message = error instanceof Error ? error.message : String(error)
          setStage('chat')
          setMessages((current) => [
            ...current,
            {
              id: nextId(),
              role: 'assistant',
              kind: 'error',
              content: t('message.chatFailed', { error: message }),
            },
          ])
        } finally {
          if (aliveRef.current) setBusy(false)
        }
      }

      function answer(text) {
        send(text)
      }

      function issueView(name) {
        setViewCommand({ name, seq: Date.now() })
      }

      async function copyText(value, message) {
        try {
          await navigator.clipboard.writeText(value)
          setToast(message)
        } catch {
          setToast(t('common.retry'))
        }
      }

      const statusOk = status.state === 'ready' && status.ok === true
      const statusLabel =
        status.state === 'loading'
          ? t('env.checking')
          : statusOk
            ? t('env.ready', { version: status.build123d || '?' })
            : t('env.missing')
      const modelLabel = status.model && status.model.model ? status.model.model : t('env.noModel')
      const phaseLabel =
        stage === 'chat'
          ? t('phase.chat')
          : stage === 'ready'
            ? t('phase.ready')
            : stage === 'generating'
              ? t('phase.build')
              : stage === 'error'
                ? t('phase.error')
                : t('phase.done')
      const modelReady = Boolean(model)
      const isGenerating = stage === 'generating'
      const userTurns = messages.filter((message) => message.role === 'user').length
      const firstUser = messages.find((message) => message.role === 'user')
      const fallbackTitle = firstUser ? firstUser.content.replace(/\s+/g, ' ').trim().slice(0, 60) : ''
      const projectTitle = project
        ? isUntitledTitle(project.title)
          ? spec?.title || fallbackTitle || t('project.defaultTitle')
          : project.title
        : t('project.loading')

      return h(
        'section',
        { className: 'm3d-page', 'aria-label': t('title') },
        view === 'list'
          ? null
          : h(
              'header',
              { className: 'm3d-top m3d-detail-head' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'm3d-back',
                  onClick: openSessionList,
                  title: t('project.sessions'),
                },
                h(Icon, { name: 'back', size: 13 }),
                t('project.sessions'),
              ),
              h('div', { className: 'm3d-detail-title', title: project?.path ? `${projectTitle}\n${project.path}` : projectTitle }, projectTitle),
              h('span', { className: 'm3d-phase' }, phaseLabel),
              h('div', { className: 'm3d-top-spacer' }),
              h(
                'span',
                { className: 'm3d-env', title: status.message || modelLabel },
                h('i', {
                  className: `m3d-dot ${statusOk ? 'ok' : status.state === 'loading' ? 'wait' : 'bad'}`,
                }),
                statusLabel,
              ),
              project
                ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'm3d-btn sm',
                      onClick: addProjectToWorkspace,
                      disabled: projectBusy || Boolean(project.workspaceId),
                      title: project.workspaceId ? t('project.added') : t('project.add'),
                    },
                    h(Icon, { name: project.workspaceId ? 'check' : 'folder', size: 12 }),
                    h('span', { className: 'm3d-workspace-label' }, project.workspaceId ? t('project.added') : t('project.add')),
                  )
                : null,
              h(
                'div',
                { className: 'm3d-detail-actions', ref: detailMenuRef },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'm3d-icon-btn',
                    onClick: () => setDetailMenuOpen((value) => !value),
                    title: t('project.more'),
                    'aria-label': t('project.more'),
                    'aria-haspopup': 'menu',
                    'aria-expanded': detailMenuOpen,
                  },
                  h(Icon, { name: 'ellipsis', size: 15 }),
                ),
                detailMenuOpen
                  ? h(
                      'div',
                      { className: 'm3d-detail-menu', role: 'menu' },
                      h(
                        'button',
                        { type: 'button', className: 'm3d-detail-menu-item', role: 'menuitem', onClick: beginRename },
                        h(Icon, { name: 'edit', size: 12 }),
                        t('project.rename'),
                      ),
                      h(
                        'button',
                        { type: 'button', className: 'm3d-detail-menu-item danger', role: 'menuitem', onClick: beginDelete },
                        h(Icon, { name: 'trash', size: 12 }),
                        t('project.delete'),
                      ),
                      project?.path
                        ? h(
                            'div',
                            { className: 'm3d-detail-menu-path', title: project.path },
                            h(Icon, { name: 'folder', size: 11 }),
                            h('span', null, project.path),
                          )
                        : null,
                    )
                  : null,
              ),
            ),
        view === 'studio' && status.state === 'ready' && status.ok === false
          ? h(
              'div',
              { className: 'm3d-banner', role: 'status' },
              h(Icon, { name: 'alert', size: 14 }),
              h(
                'div',
                null,
                h('b', null, t('env.setup')),
                t('env.setupBody'),
                status.message ? ` · ${status.message}` : '',
              ),
            )
          : null,
        view === 'list'
          ? h(SessionsView, {
              projects,
              currentId: project?.id,
              t,
              busy: hydrating || projectBusy || busy || isGenerating,
              loading: hydrating,
              onOpen: chooseProject,
              onNew: newProject,
              timeText: projectTime,
            })
          : h(
              'div',
              { className: 'm3d-body' },
          h(
            'aside',
            { className: 'm3d-chat' },
            h(
              'div',
              { className: 'm3d-chat-head' },
              h(
                'div',
                { className: 'm3d-chat-title-row' },
                h('div', { className: 'm3d-chat-title' }, t('chat.title')),
              ),
              h('div', { className: 'm3d-chat-sub' }, t('chat.sub')),
              h(StageBar, { stage, t }),
            ),
            h(
              'div',
              { className: 'm3d-msgs', ref: scrollRef, 'aria-live': 'polite' },
              messages.map((message) => h(Message, { key: `${project?.id || 'new'}:${message.id}`, message, t, onAnswer: answer })),
              busy
                ? h(
                    'div',
                    { className: 'm3d-msg assistant' },
                    h(Avatar, { user: false }),
                    h(
                      'div',
                      { className: 'm3d-msg-main' },
                      h(
                        'div',
                        { className: 'm3d-typing', 'aria-label': t('chat.thinking') },
                        h('i'),
                        h('i'),
                        h('i'),
                      ),
                    ),
                  )
                : null,
            ),
            h(
              'div',
              { className: 'm3d-composer' },
              h(
                'div',
                { className: 'm3d-input-wrap' },
                h('textarea', {
                  ref: inputRef,
                  className: 'm3d-input',
                  style: {
                    background: 'var(--dsw-alias-bg-base)',
                    color: 'var(--dsw-alias-label-primary)',
                    caretColor: 'var(--dsw-alias-brand-primary)',
                  },
                  value: input,
                  disabled: hydrating || projectBusy,
                  placeholder: hydrating
                    ? t('project.loading')
                    : spec
                      ? t('chat.readyPlaceholder')
                      : t('chat.placeholder'),
                  'aria-label': t('chat.placeholder'),
                  onChange: (event) => setInput(event.target.value),
                  onInput: (event) => {
                    const node = event.currentTarget
                    node.style.height = 'auto'
                    node.style.height = `${Math.min(node.scrollHeight, 132)}px`
                  },
                  onKeyDown: (event) => {
                    if (event.key !== 'Enter' || event.shiftKey) return
                    if (event.nativeEvent && event.nativeEvent.isComposing) return
                    event.preventDefault()
                    send(input)
                  },
                }),
                h(
                  'div',
                  { className: 'm3d-compose-row' },
                  h('span', { className: 'm3d-hint' }, t('chat.hint')),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'm3d-send',
                      title: t('chat.send'),
                      'aria-label': t('chat.send'),
                      onClick: () => send(input),
                      disabled: busy || isGenerating || hydrating || projectBusy || input.trim() === '',
                    },
                    busy ? h(Spinner, { size: 13 }) : h(Icon, { name: 'send', size: 14 }),
                  ),
                ),
              ),
              userTurns >= 2 && stage === 'chat' && !busy && !hydrating && !projectBusy
                ? h(
                    'div',
                    { className: 'm3d-finalize-row' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'm3d-finalize',
                        onClick: () => send(t('chat.finalizeInstruction'), { forceReady: true }),
                        title: t('chat.finalizeInstruction'),
                      },
                      h(Icon, { name: 'check', size: 11 }),
                      t('chat.finalize'),
                    ),
                  )
                : null,
            ),
            h(
              'div',
              { className: 'm3d-chat-foot' },
              h('span', null, statusOk ? 'build123d · Python' : 'Python setup required'),
              h('span', { className: 'm3d-model-name', title: modelLabel }, modelLabel),
            ),
          ),
          h(
            'main',
            { className: 'm3d-workspace' },
            h(
              'div',
              { className: 'm3d-tabs', role: 'tablist' },
              [
                ['model', t('tab.model'), 'cube', Boolean(model)],
                ['spec', t('tab.spec'), 'spec', Boolean(spec)],
                ['code', t('tab.code'), 'code', Boolean(code)],
              ].map(([key, label, icon, available]) =>
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'tab',
                    key,
                    className: `m3d-tab ${activeTab === key ? 'active' : ''}`,
                    'aria-selected': activeTab === key,
                    disabled: key !== 'model' && !available,
                    onClick: () => setActiveTab(key),
                  },
                  h(Icon, { name: icon, size: 13 }),
                  label,
                  available && key !== 'model' ? h('i', { className: 'm3d-tab-dot' }) : null,
                ),
              ),
              h(
                'div',
                { className: 'm3d-tabs-right' },
                modelReady && h(
                  React.Fragment,
                  null,
                  h(
                    'a',
                    {
                      className: 'm3d-download',
                      href: `${model.stlUrl}?download=1`,
                      download: 'model.stl',
                      title: t('download.stl'),
                    },
                    h(Icon, { name: 'download', size: 10 }),
                    'STL',
                  ),
                  h(
                    'a',
                    {
                      className: 'm3d-download',
                      href: `${model.stepUrl}?download=1`,
                      download: 'model.step',
                      title: t('download.step'),
                    },
                    h(Icon, { name: 'download', size: 10 }),
                    'STEP',
                  ),
                ),
              ),
            ),
            h(
              'div',
              { className: 'm3d-content' },
              activeTab === 'model'
                ? h(
                    'div',
                    { className: `m3d-viewport ${modelReady ? 'has-model' : ''}` },
                    modelReady
                      ? h(MeshViewer, {
                          key: model.id,
                          url: model.stlUrl,
                          wireframe,
                          viewCommand,
                          t,
                          onReady: setMeshInfo,
                        })
                      : null,
                    modelReady
                      ? h(
                          'div',
                          { className: 'm3d-view-label' },
                          h('span', null, t('viewer.label')),
                          h('b', null, model.title || '3D Model'),
                        )
                      : null,
                    modelReady
                      ? h(
                          'div',
                          { className: 'm3d-view-toolbar', role: 'toolbar' },
                          h(
                            'button',
                            { type: 'button', className: 'm3d-vbtn', onClick: () => issueView('iso'), title: t('viewer.iso') },
                            h(Icon, { name: 'cube', size: 13 }),
                            t('viewer.iso'),
                          ),
                          h(
                            'button',
                            { type: 'button', className: 'm3d-vbtn', onClick: () => issueView('front'), title: t('viewer.front') },
                            t('viewer.front'),
                          ),
                          h(
                            'button',
                            { type: 'button', className: 'm3d-vbtn', onClick: () => issueView('top'), title: t('viewer.top') },
                            t('viewer.top'),
                          ),
                          h('span', { className: 'm3d-vsep' }),
                          h(
                            'button',
                            {
                              type: 'button',
                              className: `m3d-vbtn ${wireframe ? 'active' : ''}`,
                              onClick: () => setWireframe((value) => !value),
                              title: t('viewer.wireframe'),
                              'aria-pressed': wireframe,
                            },
                            h(Icon, { name: 'wire', size: 13 }),
                          ),
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'm3d-vbtn',
                              onClick: () => issueView('reset'),
                              title: t('viewer.reset'),
                              'aria-label': t('viewer.reset'),
                            },
                            h(Icon, { name: 'reset', size: 13 }),
                          ),
                        )
                      : null,
                    !modelReady && !isGenerating && stage !== 'error'
                      ? h(EmptyViewport, { t })
                      : null,
                    modelReady
                      ? h(
                          'div',
                          { className: 'm3d-view-footer' },
                          h(
                            'div',
                            { className: 'm3d-view-hint' },
                            h(Icon, { name: 'layers', size: 11 }),
                            t('viewer.hint'),
                          ),
                          h(
                            'div',
                            { className: 'm3d-stats' },
                            h(
                              'span',
                              { className: 'm3d-stat' },
                              t('viewer.sizeShort'),
                              h('b', null, sizeText(model.meta)),
                            ),
                            h(
                              'span',
                              { className: 'm3d-stat' },
                              t('viewer.volumeShort'),
                              h('b', null, `${volumeText(model.meta)} cm³`),
                            ),
                            meshInfo &&
                              h(
                                'span',
                                { className: 'm3d-stat' },
                                t('viewer.triangles'),
                                h('b', null, formatNumber(meshInfo.triangles, 0)),
                              ),
                            h(
                              'span',
                              { className: `m3d-stat ${model.meta && model.meta.valid ? 'good' : 'bad'}` },
                              model.meta && model.meta.valid ? t('viewer.valid') : t('viewer.invalid'),
                            ),
                          ),
                        )
                      : null,
                    isGenerating ? h(GeneratingOverlay, { t, step: genStep }) : null,
                    stage === 'error'
                      ? h(FailureOverlay, {
                          t,
                          error: generationError,
                          onRetry: () => runGeneration(spec, cleanHistory(messages)),
                        })
                      : null,
                  )
                : activeTab === 'spec'
                  ? h(SpecView, {
                      spec,
                      model,
                      t,
                      busy: isGenerating,
                      onRebuild: () => runGeneration(spec, cleanHistory(messages)),
                      onCopy: () => copyText(JSON.stringify(spec, null, 2), t('toast.copied')),
                    })
                  : h(CodeView, {
                      code,
                      t,
                      onCopy: () => copyText(code, t('code.copied')),
                      downloadUrl: model ? model.codeUrl : '',
                    }),
            ),
          ),
        ),
        renameTarget
          ? h(
              'div',
              {
                className: 'm3d-modal-backdrop',
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget && !actionBusy) setRenameTarget(null)
                },
              },
              h(
                'div',
                { className: 'm3d-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('project.rename') },
                h('div', { className: 'm3d-modal-title' }, t('project.rename')),
                h('input', {
                  className: 'm3d-modal-input',
                  autoFocus: true,
                  value: renameValue,
                  disabled: actionBusy,
                  onChange: (event) => setRenameValue(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      submitRename()
                    }
                  },
                }),
                h(
                  'div',
                  { className: 'm3d-modal-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'm3d-btn sm',
                      onClick: () => setRenameTarget(null),
                      disabled: actionBusy,
                    },
                    t('project.cancel'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'm3d-btn sm primary',
                      onClick: submitRename,
                      disabled: actionBusy || !renameValue.trim(),
                    },
                    actionBusy ? h(Spinner, { size: 12 }) : null,
                    t('project.save'),
                  ),
                ),
              ),
            )
          : null,
        deleteTarget
          ? h(
              'div',
              {
                className: 'm3d-modal-backdrop',
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget && !actionBusy) setDeleteTarget(null)
                },
              },
              h(
                'div',
                { className: 'm3d-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('project.delete') },
                h(
                  'div',
                  { className: 'm3d-modal-title' },
                  h(Icon, { name: 'trash', size: 15 }),
                  t('project.delete'),
                ),
                h(
                  'p',
                  { className: 'm3d-modal-text' },
                  t('project.deleteConfirm', { title: deleteTarget.title || t('project.defaultTitle') }),
                ),
                h(
                  'div',
                  { className: 'm3d-modal-actions' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'm3d-btn sm',
                      onClick: () => setDeleteTarget(null),
                      disabled: actionBusy,
                    },
                    t('project.cancel'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'm3d-btn sm danger',
                      onClick: confirmDelete,
                      disabled: actionBusy,
                    },
                    actionBusy ? h(Spinner, { size: 12 }) : h(Icon, { name: 'trash', size: 12 }),
                    t('project.delete'),
                  ),
                ),
              ),
            )
          : null,
        toast
          ? h(
              'div',
              { className: 'm3d-toast', role: 'status' },
              h(Icon, { name: 'check', size: 12 }),
              toast,
            )
          : null,
      )
    }

    function SidebarIcon({ size }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.65,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: 'false',
          style: { display: 'block' },
        },
        h('path', { d: 'M12 2.7 21 7.4v9.2L12 21.3 3 16.6V7.4L12 2.7Z' }),
        h('path', { d: 'M3.4 7.5 12 12l8.6-4.5' }),
        h('path', { d: 'M12 12v9.1' }),
        h('path', { d: 'M17.7 2.8v3.1M16.2 4.35h3.1', strokeWidth: 1.3 }),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(
          () => ctx.locale.register(NS, { zh: flattenDict(zh), en: flattenDict(en) }),
          'model3d-studio: dictionaries',
        )
        ctx.effect(() => {
          const tag = document.createElement('style')
          tag.dataset.model3dStudio = '1'
          tag.textContent = CSS
          document.head.append(tag)
          return () => tag.remove()
        }, 'model3d-studio: styles')
        const t = ctx.locale.bind(NS)
        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register(
            {
              name: 'conversation.session.header.utilities',
              id: 'model3d-session-type',
              order: -1,
              locale: NS,
            },
            SessionTypeMarker,
          ),
        )
        ctx.slots.inject('conversation.view', () =>
          ctx.slots.register(
            {
              name: 'conversation.view',
              id: 'model3d-spec',
              order: 20,
              locale: NS,
              label: () => t('session.spec'),
            },
            SessionSpecView,
          ),
        )
        ctx.slots.inject('conversation.view', () =>
          ctx.slots.register(
            {
              name: 'conversation.view',
              id: 'model3d-model',
              order: 30,
              locale: NS,
              label: () => t('session.model'),
            },
            SessionModelView,
          ),
        )
      },
    }
  },
})
