# MASTER PLAN — Better Call Saul 通往 10k Star 的总规划与交接文档

> **这份文档是项目的单一事实来源（single source of truth）和跨窗口交接文档。**
> 任何新开的 AI 窗口 / 协作者，只读这一份文档就能完整接手。开工前必须先通读本文件第 1~4 节。

---

## 0. 如何使用这份文档（给每一个接手的窗口）

1. **先读不动手**：进来先读「1. 项目背景」「2. 当前状态」「3. 工作纪律」「4. 阶段门禁」。
2. **找当前阶段**：在「6. 阶段与任务」里找到第一个未完成（`[ ]`）的阶段，从它的第一个未打勾任务开始。
3. **完成即打勾**：每做完一个任务，立刻把对应 `[ ]` 改成 `[x]`，并在「8. 进度日志」追加一行（日期 + 做了什么 + 验证结果）。
4. **阶段收尾必须 Review**：一个阶段所有任务打勾后，**停下**，按该阶段的「Review Gate」逐条自检 + 等用户确认，**通过后才能进入下一阶段**。未经 Review 不得跨阶段。
5. **不确定就问**：涉及命名、是否接真实 LLM、是否花钱部署、是否发布等关键决策，先问用户再做。

---

## 1. 项目背景（30 秒看懂）

- **是什么**：`Better Call Saul` —— 一个基于 OpenClaw 的 AI「纠纷/投诉/谈判 fixer」。把用户杂乱的冲突描述，转成可直接发送的话术、升级路径、对方可能回复 + 反制、风险评估和「Saul 点评」。
- **解决什么痛点**：普通人面对商家拒退款、房东扣押金、客户拖欠、平台踢皮球时，不知道怎么有理有据有节地把事情谈赢。
- **差异化卖点**：① 结构化 10 段式输出；② **安全红线**（拒绝伪造证据/敲诈/冒充，只做合法策略）；③ 多语气话术（礼貌/强硬/法务/Saul 风）；④ 可复用的 OpenClaw skills。
- **终极目标**：开源到 GitHub，冲击 **10,000 star**。
- **现实定锚**：10k star ≈ **真正有用且能立刻体验的产品 + 一次成功的传播事件 + 持续运营**。三者缺一不可。代码写好只是入场券。

## 1.1 仓库结构速览

```
better-call-saul/
  SOUL.md                  # 人设/使命/输出契约/安全红线（核心）
  AGENTS.md                # 对编码 agent 的硬性约束（务必遵守）
  README.md                # 项目落地页
  knowledge/               # 9 个领域知识包（谈判/退款/客诉/合同…）
  lore/                    # 角色风格与 IP 边界
  skills/<name>/SKILL.md   # 4 个 OpenClaw 技能 + references/ 自包含副本
  prompts/output_formats.md# 标准输出格式
  schema/                  # dispute_case / saul_output JSON Schema
  examples/                # 5 个示例场景
  src/                     # ★ TypeScript CLI（saul）核心代码层
  test/                    # vitest 测试套件
  docs/                    # 架构/计划/安全/路线 + 本文件
  scripts/                 # 安装 + 校验 shell 脚本
  .github/workflows/ci.yml # CI（Node 18/20/22）
```

## 1.2 关键命令

```bash
npm install            # 安装依赖
npm run typecheck      # 类型检查（strict）
npm test               # vitest，19 个测试
npm run build          # 编译到 dist/
npm run saul -- <cmd>  # 开发期通过 tsx 跑 CLI

# CLI 子命令
saul doctor                       # 环境 + 仓库健康
saul validate                     # 校验文件/skill/schema/example/引用漂移
saul list-skills [--json]
saul check-refs                   # 引用副本漂移检查
saul classify --text "..."        # 场景路由
saul bundle --text "..." [--json] # 生成可粘进 OpenClaw 的 prompt 包
saul run-example examples/x.md
saul print-openclaw-config --workspace /abs/path
```

---

## 2. 当前状态（每次收尾务必更新本节）

- **Git**：本地仓库，分支 `main`，**尚未推送 GitHub**（用户要求暂不开源）。
- **已完成提交**：
  - `a9e1db7` chore: initial commit（内容骨架）
  - `9144124` feat: TypeScript saul CLI + 测试 + CI
- **代码层**：CLI 9 模块全部就绪，`tsc` 通过，**19/19 测试绿**，CI 已配置。
- **内容层**：4 skills + 9 知识包 + 5 examples + 安全策略齐全，26 份引用副本无漂移。
- **当前所处阶段**：**P0 之前**。下一步从 **P0** 开始。
- **尚未决策（阻塞项，需用户拍板）**：
  1. **命名**：是否保留 "Better Call Saul"（自带流量但有版权风险）还是换原创主名 + "Saul-inspired" 副标。
  2. **是否接真实 LLM**：决定 Demo 能否产出成品话术（对 star 转化至关重要）。
  3. **是否允许付费部署**（Vercel/域名/模型额度）。

---

## 3. 工作纪律（每个窗口都必须遵守）

来自 `AGENTS.md` 与项目安全策略，**违反即视为破坏**：

- ❌ 不加任意远程脚本执行的安装钩子；❌ 不硬编码 API key/token/密钥/用户数据。
- ❌ 不放剧集版权台词/分镜文本（IP 风险）。
- ❌ CLI 不自动发消息、不浏览器自动化、不改用户 `~/.openclaw` 配置（只打印片段）。
- ✅ 保持 `SKILL.md` frontmatter 的 OpenClaw 兼容；metadata 单行。
- ✅ 不可变数据风格、小文件、完善错误处理、边界校验（见仓库 instruction 规则）。
- ✅ 每次改完 `knowledge/` 或 `SOUL.md` 等被 `references/` 引用的源文件，**必须重新同步副本**并跑 `saul check-refs`，否则 CI 会红。
- ✅ Git：feature 分支基于最新 `origin/main`（开源后）；提交用 Conventional Commits。
- ✅ 任何「难以撤销/影响线上/会花钱」的动作，先问用户。

---

## 4. 阶段门禁（Review Gate 规则）

- 阶段顺序：**P0 → P1 →（P2 与 P3 可并行）→ P4 → P5**。
- **每个阶段结束必须通过 Review Gate 才能进入下一阶段。**
- Review Gate = ① 该阶段所有任务 `[x]`；② 逐条满足「验收标准」；③ 跑通指定验证命令；④ **用户明确说"通过/继续"**。
- 未通过 Review 不得开工下一阶段。Review 中发现问题，回到本阶段修，不往前冲。
- **特别强调：P4（公开发布）是不可逆事件，必须 P1~P3 全部通过 + 用户二次确认后才能执行。Demo 没上线前绝不发布。**

---

## 5. 北极星指标与里程碑

- **北极星**：GitHub star 数。
- **过程指标**：Demo 访问→试用转化率、README 跳出率、首发当日 star 增量、issue 响应时长。
- **里程碑**：
  - M1：可在线体验的 Demo 上线（P1 完成）。
  - M2：首屏 README + GIF + 双语就绪（P3 完成）。
  - M3：首发当日冲上 HN/PH 前列（P4）。
  - M4：1k star（站稳）。
  - M5：10k star（终极）。

---

## 6. 阶段与任务（完成即把 `[ ]` 改为 `[x]`）

### P0 · 工程可信度（地基）
> 目标：任何访客 10 秒内觉得"靠谱、有人维护"。

- [x] P0-1 为 5 个 example 各写一份「标准完整输出」快照，并加 snapshot 回归测试
- [x] P0-2 README 顶部加 CI 徽章（+ 可选覆盖率徽章）
- [x] P0-3 补齐治理文件：`CODE_OF_CONDUCT.md`、`CHANGELOG.md`、`.github/FUNDING.yml`
- [ ] P0-4 复核 LICENSE 与 IP/免责声明，确保「非官方 + 原创人设」声明滴水不漏
- [x] P0-5 完善 issue/PR 模板（已存在则补字段）

**Review Gate P0**：`npm test` 全绿（含新快照）；`saul validate` 通过；治理文件齐全；IP 声明经用户确认无风险。→ 等用户说「继续」。

---

### P1 · 零门槛体验（★转化率命门，最高优先级）
> 目标：不装任何环境就能立刻玩到「成品话术」。**这是 1w star 成败关键。**
> ⚠️ 开工前需用户拍板「是否接真实 LLM」「是否允许付费部署」。

- [ ] P1-1 选型并搭建 Web Demo 骨架（单页：粘贴纠纷 → 看 10 段式输出）
- [ ] P1-2 接入 LLM 推理层（支持用户自带 API key；考虑免费额度/演示 key 策略）
- [ ] P1-3 把 CLI 的 classify + bundle 复用为后端推理管线（不重复造轮子）
- [ ] P1-4 `npx better-call-saul "我的纠纷..."` 一行命令直接出话术
- [ ] P1-5 预置 Gallery：6-8 个真实案例「输入→输出」对照（无 key 也能看效果）
- [ ] P1-6 部署 Demo（Vercel 等），README 第一行放体验链接
- [ ] P1-7 Demo 基本错误处理与限流（防滥用/防爆账单）

**Review Gate P1（= M1）**：Demo 线上可访问；真实产出 10 段式结果；`npx` 一行命令可用；Gallery 可看；有限流。→ 等用户体验后说「继续」。

---

### P2 · 产品厚度（口碑与留存）
> 目标：试过的人觉得「真有用」，愿意自来水安利。（可与 P3 并行）

- [ ] P2-1 扩充 knowledge 包，覆盖更多高频场景（中国：电商/12315；欧美：chargeback/ombudsman 等）
- [ ] P2-2 多语言话术（至少中英双语输出）
- [ ] P2-3 场景库扩到 20+，每个配 example + 快照
- [ ] P2-4 建评测集（纠纷→理想策略），量化输出质量，作为换模型/改 prompt 的标尺
- [ ] P2-5 安全红线自动化测试（证明会拒绝伪造证据/敲诈/冒充）

**Review Gate P2**：知识/场景扩充达标；双语可用；评测集有基线分；安全红线测试全过。→ 用户确认。

---

### P3 · 首屏说服力（点 star 的临门一脚）
> 目标：README 当落地页，看一眼就想点 star。（可与 P2 并行）

- [ ] P3-1 README 重构：一句话定位 + 顶部演示 GIF/视频 + 体验链接 + 三步上手
- [ ] P3-2 录制演示 GIF / 短视频
- [ ] P3-3 品牌视觉：Logo、OG 社交分享卡片、配色
- [ ] P3-4 中英双 README（中文圈是流量金矿）
- [ ] P3-5 对比/定位段落：说清与"直接问 ChatGPT"的区别

**Review Gate P3（= M2）**：README 首屏有 GIF + 链接 + 定位；双语齐全；视觉物料就绪。→ 用户确认。

---

### P4 · 发布与传播（制造爆发，不可逆）
> 目标：靠一次集中发布制造脉冲增长。**只发一次，P1~P3 全通过 + 用户二次确认后才执行。**

- [ ] P4-1 发布前预热：种子用户试用，修掉 Demo 明显 bug
- [ ] P4-2 准备多平台文案（英文：Show HN / Reddit / Product Hunt / Twitter / Dev.to；中文：小红书 / 即刻 / V2EX / 少数派 / 公众号）
- [ ] P4-3 设计传播钩子：故事感标题 + 真实战绩截图（退款成功/欠款追回）
- [ ] P4-4 选好时机（避节假日，HN 选周二/三美西早上）
- [ ] P4-5 正式推送 GitHub（公开仓库）+ 同日多平台发布
- [ ] P4-6 发布当日全程在线答疑（HN/PH 流量进来必须秒回）

**Review Gate P4（= M3）**：发布前 checklist 全过；用户二次确认「可以公开发布」；发布后 24h 监控 star 与 issue。→ 进入运营。

---

### P5 · 长期运营（守住并滚到 10k）
> 目标：爆发后留存，靠持续更新与社区。

- [ ] P5-1 快速响应 issue/PR（首周尤其关键）
- [ ] P5-2 公开 Roadmap + 打 `good-first-issue` 标签吸引贡献者
- [ ] P5-3 内容飞轮：每解决一类新纠纷发一篇案例文/短视频
- [ ] P5-4 版本节奏：v0.2/v0.3 各当一次小型传播事件
- [ ] P5-5 可选增长杠杆：浏览器插件 / 移动端 / OpenClaw 官方 skill 市场上架

**Review Gate P5**：持续进行，无终点。每到一个 star 量级（1k/3k/5k/10k）复盘一次增长来源。

---

## 7. 关键风险登记册

| 风险 | 影响 | 对策 |
|---|---|---|
| **IP 命名（Better Call Saul）** | 可能被版权方 DMCA 下架，star 归零 | P0-4 把免责做到极致；或换原创主名。**早决定** |
| Demo 没上线就发布 | 转化率暴跌，浪费唯一一次发布机会 | 门禁强制 P1 先于 P4 |
| 接 LLM 的账单失控 | 演示被刷爆产生费用 | P1-7 限流 + 优先「自带 key」模式 |
| 安全红线被绕过 | 差异化卖点崩塌，舆论风险 | P2-5 自动化红线测试 |
| 引用副本漂移 | CI 红、可信度受损 | 改源文件后跑 `saul check-refs` |
| 发布即沉默 | 首发流量浪费 | P4-6 当日全程答疑 |

---

## 8. 进度日志（每次收尾追加一行，最新在上）

> 格式：`YYYY-MM-DD | 阶段-任务 | 做了什么 | 验证结果`

- 2026-05-31 | P0-1/2/3/5 | 加 example 快照回归测试（10 快照）；README 顶部加 CI/Node/License/Tests 徽章；补 CODE_OF_CONDUCT/CHANGELOG/FUNDING.yml；补 issue config.yml + bug 预提交清单 + PR 模板字段 | typecheck 通过，25/25 测试绿，validate 通过，26 引用副本无漂移。P0-4 待 IP 决策，剩余 P0 进 Review Gate
- 2026-05-31 | 代码层 | TS CLI（validate/classify/bundle/doctor）+ 测试 + CI | typecheck 通过，19/19 测试绿，提交 9144124
- 2026-05-31 | 内容层 | git 初始化 + 内容骨架首次提交 | 提交 a9e1db7

---

## 9. 待用户决策清单（开 P0/P1 前必须先答）

1. 命名：保留 "Better Call Saul" / 换原创主名 + Saul-inspired 副标？
2. LLM：是否接真实模型让 Demo 出成品话术？自带 key / 提供演示额度？
3. 部署：是否允许花钱（Vercel/域名/模型）？预算上限？
4. 发布顺序确认：Web Demo 先于 `npx`，还是反过来？

> 以上未答前，新窗口可先做 P0 中**不依赖决策**的任务（P0-1 快照、P0-2 徽章、P0-3 治理文件、P0-5 模板），但 P0-4（IP 复核）与所有 P1 任务需先拿到决策。
