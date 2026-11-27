# 驾驶 HMI 实验（hmi-vr）· 运行与检查

页面在 `public/hmi-vr/`，电脑端脚本在 `scripts/hmi-vr/`，数据默认写到 `output/hmi-vr-data/`（不进 git）。

## 跑一次实验

```bash
python3 scripts/hmi-vr/server.py --port 8000            # 加 --osc-port 9000 --osc-dump 可接眼动套件的 OSC
```

1. 被试在 `http://localhost:8000/pre.html?pid=P01&cond=C` 填说明与同意、背景、SSQ 前测，提交后自动进入 VR 页面（cond 用 A 或 C；B 保留）。
2. VR 页面：校准 →（有眼动数据时）视线校准 → 说明 → 三段行驶（约 5 + 12 + 5 分钟，中途不停）。
3. 结束后在页面上点「填写结束后的问卷」进入 `post.html`。
4. 汇总：`python3 scripts/hmi-vr/analyze.py` → `summary_events / summary_load / summary_risk / summary_learning.csv`。

Quest 上用 USB 连线后 `adb reverse tcp:8000 tcp:8000`，在头显浏览器里打开同样的 localhost 地址。

## 网址参数

| 参数 | 作用 |
|---|---|
| `pid`、`cond` | 被试编号、方案（A / B / C） |
| `dur` | 总分钟数（默认 22，三段按比例缩放；线索位置同比例缩放） |
| `speed=40` | 加速模式（只用于检查） |
| `sim=1` | 模拟被试。`simLook=0.1,0.5,0.8` 三段主动看线索的概率；`simEarly=1` 主动看都发生在提示之前；`simEye=1` 同时模拟眼动数据 |
| `record=1` | 录像用的电脑预览：隐藏界面、视角朝前，按 cond 自动跑第二段开头 5 分钟 |
| `ids=1` | 问卷页显示每题编号（填条目文字时用） |

## 数据文件

`<被试>_<会话>_frames.csv`（30 Hz）、`_events.csv`、`_cues.csv`（每个线索一行）、`_meta.json`，问卷为 `<被试>_survey_pre.json / _post.json` 和汇总的 `survey_pre.csv / survey_post.csv`。

`cues.csv` 的 `looked` 是这次会话采用的判定（`look_src` = head 或 eye）；`looked_head`、`looked_eye` 两种结果都另外记录。`hazard_overlap = 1` 的线索与「请接管」事件重叠，汇总时剔除。

## 检查脚本（需要 Node 和 Playwright，可选）

```bash
node scripts/hmi-vr/sim_run.mjs "pid=T01&cond=C&simLook=0.1,0.5,0.8"   # 无头浏览器 + 模拟被试跑完整会话
python3 scripts/hmi-vr/check_cues.py output/hmi-vr-data T01            # 线索、预防动作、提示规则
python3 scripts/hmi-vr/check_segments.py output/hmi-vr-data T01        # 三段式
node scripts/hmi-vr/check_survey.mjs Q01 C                             # 问卷 → VR → 问卷，同一编号保存
node scripts/hmi-vr/check_record.mjs 输出目录                           # 录像模式
```

## 改参数

都在 `public/hmi-vr/config.js`：三段长度 `segmentsMin`、线索 `cues`、预防动作与提示时机 `cue`、驾驶员监测 `dms`、眼动 `eye`、录像 `record`。问卷条目在 `survey-items.js`（成熟量表的条目是占位，待填）。
