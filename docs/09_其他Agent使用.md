# 09 用不同的 AI Agent 跑这套流程

这套流程最早是用 Claude Code 跑出来的，但规矩和工具都和具体 Agent 无关：**规矩在 `AGENTS.md`，工具都是普通的 Python / Node / Shell 脚本**。任何能执行命令、读写文件的 Agent 都能用。

## 规矩文件：只改 AGENTS.md

| Agent | 自动读取的文件 | 怎么来的 |
|---|---|---|
| Claude Code | `CLAUDE.md` | 由 `AGENTS.md` 生成 |
| OpenAI Codex CLI 等支持 AGENTS.md 的 Agent | `AGENTS.md` | 源头文件 |
| Gemini CLI | `GEMINI.md` | 由 `AGENTS.md` 生成 |
| Cursor | `.cursor/rules/ai-laimai.mdc`（alwaysApply） | 由 `AGENTS.md` 生成 |
| 其他（Aider、Cline、Windsurf…） | 开场让它先读 `AGENTS.md` | — |

改了规矩后跑一次 `bash scripts/sync_rules.sh`，四份保持一致。

## Agent 需要的能力

| 能力 | 用在哪 | 没有怎么办 |
|---|---|---|
| 执行命令、读写文件 | 全流程 | **必需** |
| 联网搜索 / 读网页 | ① 核稿、B 方式写稿调研、④ 找素材 | 你把来源链接给它；它用 `node film/gettext.mjs <url>` 读网页正文 |
| 看图片 | ⑤ 关键帧自查、⑦ 抽帧总览、挑素材入点 | 关键帧和抽帧总览由你来看；闷点（`dull_scan.py`）、字幕对时（`final_qc.py`）、帧数核对都是脚本，不依赖看图 |
| 长时间运行的命令 | ⑥ 全片渲染（3 核约 17 分钟）、素材下载 | 放后台跑，查日志：`nohup bash tools/build_v1.sh > build.log 2>&1 &`，然后 `tail build.log` / `tail film/out/v1_part*.log` |
| 写较长的代码 | `film/scenes.js`（第28期约 300 行） | 让它参照 `examples/ep28_distill_shicong/film/scenes.js` 一个镜头一个镜头写，每写几个就 `render.mjs stills` 抽帧检查 |

## 各家怎么开始

在仓库根目录启动 Agent，然后发开场话术（见下）。

**Claude Code**
```bash
claude
```

**OpenAI Codex CLI**
```bash
codex
```

**Gemini CLI**
```bash
gemini
```

**Cursor**：打开仓库文件夹，用 Agent 模式对话；`.cursor/rules/ai-laimai.mdc` 会自动生效。

**Aider**
```bash
aider --read AGENTS.md
```

**其他 Agent**：第一句话先让它读规矩：`先读 AGENTS.md 和 docs/01_流程SOP.md，按里面的流程做。`

## 开场话术

**A. 我写好了口播稿**
```
做新一期《AI来龙去脉》。口播稿在 <路径>。
先 bash scripts/new_episode.sh ep29_<英文名> 建目录，把稿子原样存进去，
然后按 AGENTS.md 的流程走：先核稿，把结论交给我，别跳步。
```

**B. 我只有一个主题**
```
做新一期《AI来龙去脉》，主题：<一句话主题 / 新闻链接>。
先 bash scripts/new_episode.sh ep29_<英文名> 建目录，
按 docs/08_文案写作.md 的 B 方式写稿：调研、选结构、给 3 个标题和文案 v1，写完停下来等我改。
```

**中途常用**
```
分镜先从 docs/07_风格库.md 选风格，说明为什么选它。
关键帧出 6–8 张，挑不同段落，拼成总览给我看。
全片渲完跑 dull_scan.py 和 final_qc.py，有闷点只用 patch.sh 补渲那几秒。
第 16 句读音不对，只重配这一句（python tools/tts.py 16），再补那一段画面。
```

## 不用 Agent，纯手动

照着 [01_流程SOP.md](01_流程SOP.md) 一步步来：文案和分镜自己写，`film/kit.js`、`shots.js`、`scenes.js` 参照第28期改，命令都在 [04_工具说明.md](04_工具说明.md)。

## 经验

- **每个"停"都要真的停下来**。不同 Agent 都有"一口气做完"的倾向，开场就强调"按 AGENTS.md 的流程走，别跳步"。
- **长任务别前台等**：渲染、下载放后台，要它汇报"已渲多少帧、预计几点完"。
- **让它先抽帧再全片**：`render.mjs stills` 几秒一张，比全片渲完才发现问题省 15 分钟以上。
- **改动只补渲**：`patch.sh` 局部补渲 2–3 分钟，整片重渲 17 分钟。
