# Refactor Plan: Universal Agent Skill Format

> 分支: `refactor/agent-skill-format`
> 目标: 让 4 个 skill 可被 Codex、Claude Code、OpenClaw 及其他 agent 工具识别和使用
> 原则: 扩展适配范围，不改架构

---

## Todo List

### Phase 1: 统一入口 & 清理冗余

- [x] **1.1 合并 CODEX_PROMPT.md → AGENTS.md**
  - 把 CODEX_PROMPT.md 中 Codex 专属的编排指令提取为通用描述
  - AGENTS.md 增加 "Agent Discovery" 段落，说明各工具如何找到本项目的 skill
  - 删除 CODEX_PROMPT.md
  - `paths.ts` 的 `REQUIRED_ROOT_FILES` 无需修改（未包含 CODEX_PROMPT.md）
  - `validate.ts` 无需修改（同上）
  - 测试无影响（150/150 通过）

- [x] **1.2 AGENTS.md 增加多平台路由表**
  - 新增一节说明各 agent 应读取哪些文件：
    ```
    | Agent Tool   | Entry Point                          |
    |--------------|--------------------------------------|
    | Claude Code  | .claude/skills/*/SKILL.md 或 skills/ |
    | Codex        | .agents/skills/*/SKILL.md 或 skills/ |
    | OpenClaw     | skills/*/SKILL.md                    |
    | 其他         | AGENTS.md + skills/                  |
    ```

### Phase 2: Skill 自包含化

- [x] **2.1 每个 skill 的 references/ 补齐关键文件**
  - 补齐的文件（遵循 `dir__file.md` 命名约定）：
    - `docs__SAFETY_POLICY.md` → complaint-handler, angle-finder, negotiation-simulator
    - `prompts__output_formats.md` → angle-finder, risk-assessor
  - SOUL.md 已在所有 4 个 skill 中存在（不带前缀）
  - 更新了各 `references/README.md` 映射表
  - `check-refs` 验证通过：38 个 reference 全部同步

- [x] **2.2 验证独立可用性**
  - 将 complaint-handler 拷贝到 `/tmp/test-skill/` 验证
  - 确认包含：SKILL.md + SOUL.md + SAFETY_POLICY + output_formats + 10 knowledge 文件
  - 仅读该目录即可理解：做什么、怎么做、什么不能做、输出格式

### Phase 3: 扩展 installer 支持 Codex

- [x] **3.1 installer.ts 增加 Codex host 检测**
  - `HostKind` 类型扩展为 `"openclaw" | "claude-code" | "codex"`
  - `codexBaseDir()` — 目标路径 `.agents/`（project）或 `~/.agents/`（user）
  - `detectHosts()` 增加 Codex 检测（codex CLI / .agents/ 目录）
  - `planCodexInstall()` — 复制 skills 到 `.agents/skills/<name>/`（无 subagent）
  - `planCodexUninstall()` — 基于 manifest 精确卸载

- [x] **3.2 CLI 适配**
  - `saul install --host codex` 支持
  - `saul uninstall --host codex` 支持
  - `saul detect-hosts` 输出增加 Codex 行
  - auto-detect 优先级：claude-code > codex > openclaw

- [x] **3.3 补测试**
  - `codexBaseDir()` 路径解析测试
  - Codex install plan 结构验证（4 skills, 0 subagent）
  - install → manifest → uninstall 完整生命周期
  - uninstall 无 manifest 时 no-op
  - `detectHosts()` 返回 3 个 host + .agents/ 检测
  - 测试从 150 → 156（+6）

### Phase 4: Frontmatter 标准化

- [ ] **4.1 frontmatter 支持平台特定 metadata 子 key**
  - 当前 metadata 是单行 JSON：`{"openclaw":{"always":true}}`
  - 保持向后兼容：单行 JSON 仍然合法
  - 允许嵌套结构：
    ```yaml
    metadata: {"openclaw":{"always":true},"claude-code":{"agent":"saul"},"codex":{"scope":"repo"}}
    ```
  - `frontmatter.ts` 解析逻辑不需要改（已经是 `Record<string, unknown>`）
  - 仅需确认 validate 不会拒绝新 key

- [ ] **4.2 各 skill 的 SKILL.md 更新**
  - 在 metadata 中加入 codex / claude-code 的子 key（如果需要）
  - description 字段确保足够通用，不绑定特定工具

### Phase 5: 对外名称 & 发布（可选）

- [ ] **5.1 评估是否改名**
  - 选项 A: 保持 `better-call-saul`（品牌识别度高，已发 npm）
  - 选项 B: 对外包名改为 `consumer-dispute-drafter`，内部人格保留 Saul
  - 需要决策后再动

- [ ] **5.2 npm 发布 0.2.0**
  - Phase 1-4 完成后 bump 版本
  - 更新 CHANGELOG.md
  - `npm publish`

---

## 注意事项

### 红线（绝对不做）

1. **不新增顶层 meta-skill** — 分类器 + bundler 已经是编排层，不要在 skill 上面再套 skill
2. **不建 `.agent-skill-core/` 中间目录** — `skills/` 是唯一的源，export/install 只做拷贝
3. **不新建 export 命令** — 扩展现有 `install --host` 即可
4. **不把 shell 脚本放进 skill 目录** — skill 是 Markdown 指令，bundler 逻辑留在 `src/`
5. **不做 adapter/plugin 架构** — 只支持 3 个实际目标（Claude Code、Codex、OpenClaw），不为假想的未来工具过度抽象

### 安全网

- **每步改完跑 `npm test`**（当前 150/150），不能降
- **每步改完跑 `saul validate`**，不能出新 warning
- **每步改完跑 `saul check-refs`**，references 漂移必须修
- **不碰 knowledge/、lore/、examples/ 的内容** — 这些是知识层，和重构无关
- **不碰 classifier.ts 的领域规则** — 分类逻辑独立于 skill 格式

### 向后兼容

- 现有 `saul install --host claude-code` 必须继续工作
- 现有 `saul install --host openclaw` 必须继续工作
- 现有 SKILL.md frontmatter 格式必须继续通过校验
- 现有 `buildPromptBundle()` 输出不能变

### 分支策略

- 所有改动在 `refactor/agent-skill-format` 分支
- 每个 Phase 完成后提交一次，commit message 带 phase 编号
- Phase 1-4 全部完成 + 测试绿 → 合入 main
- 合入前可以 squash 也可以保留历史（看你偏好）

### 各平台 Skill 路径速查

| 平台 | Repo 内路径 | 用户级路径 |
|------|------------|-----------|
| OpenClaw workspace | `skills/<name>/SKILL.md` | `~/.openclaw/skills/<name>/SKILL.md` |
| OpenClaw agent | `.agents/skills/<name>/SKILL.md` | `~/.agents/skills/<name>/SKILL.md` |
| Claude Code | `.claude/skills/<name>/SKILL.md` | — |
| Codex | `.agents/skills/<name>/SKILL.md` | `~/.agents/skills/<name>/SKILL.md` |
| 无 skill 机制的工具 | 读 `AGENTS.md` + `skills/` 目录 | — |
