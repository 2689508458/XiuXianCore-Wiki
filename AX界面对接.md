# AX 界面对接（ArcartX v2）

> 这页解决：用 ArcartX 写修仙界面时，怎么读数据、怎么触发动作、怎么注册界面。
> 前置：服务端装 ArcartX 插件，玩家客户端装配套 MOD；config.yml `arcartx.enabled: true`（默认开）。

## 一、读数据（两条通道）

### 1. 服务端变量（推荐，插件主动推送）

插件对装了 MOD 的玩家**每秒差量推送**下表变量（通道建立时全量推一次，仅变化的键才重发）：

| 变量名（前缀可在 config 改，默认 `xx_`） | 内容 |
|---|---|
| `xx_realm` / `xx_realm_display` | 境界节点 ID / 显示名（§ 颜色） |
| `xx_realm_major` / `xx_realm_order` | 大境界 ID / 排序值 |
| `xx_next_realm` / `xx_next_realm_display` | 下一境界 |
| `xx_progress` | 突破进度 0~100 |
| `xx_cond_count` | 条件数量 |
| `xx_cond_<n>_text` / `xx_cond_<n>_ok` | 第 n 条条件进度文本（§ 颜色）/ 是否达成（1/0） |
| `xx_dujie_state` / `xx_dujie_wave` / `xx_dujie_time` | 渡劫状态（active/idle）/ 波次 / 剩余秒 |
| `xx_cultivating` / `xx_cultivation_multiplier` | 是否打坐中（1/0）/ 所在灵脉倍率（v1.4.0） |
| `xx_var_<变量id>` | `sync-arcartx: true` 的玩家变量（如 `xx_var_linggen`） |

### 2. PAPI 拉取（Aria 脚本）

```aria
Placeholder.parse("%xiuxian_progress%")
Placeholder.parseAll("境界 %xiuxian_realm_display% 进度 %xiuxian_progress%%")
```

全部占位符见《占位符》页。注意 PAPI 解析在下一游戏刻更新。

## 二、触发动作（客户端 → 服务端）

界面 Aria 里直接发全局自定义包：

```aria
Packet.send("xiuxian:action", "breakthrough")     // 尝试突破（含渡劫流程）
Packet.send("xiuxian:action", "tribulation")      // 独立发起当前境界天劫
Packet.send("xiuxian:action", "open_gui", "main") // 打开箱子GUI或其他AX界面
Packet.send("xiuxian:action", "action_group", "celebrate_breakthrough") // 执行动作组
Packet.send("xiuxian:query", "realm_list")        // 主动查询（见下）
```

### 查询键（`xiuxian:query`，服务端以 `xiuxian:data` 应答）

| 查询键 | 应答 JSON |
|---|---|
| `realm_list` | `[{id, display, order, current}, ...]`（全境界链） |
| `conditions` | `[{index, text, ok}, ...]`（当前境界突破条件逐条进度） |
| `variables` | `{变量id: 值, ...}`（全部已定义变量的当前值） |
| `tribulation_info` | `{state, id, wave, total_waves, time}`（渡劫实时状态） |
| `realm_detail` / `realm_detail <节点id>` | `{found, id, display, major, order, icon, description[], current, next}`；省略 id 查当前境界 |

## 三、服务端下行包

| 包 ID | 参数 | 触发时机 |
|---|---|---|
| `xiuxian:data` | `[键, JSON]` | 应答 `xiuxian:query`，见上表 |
| `xiuxian:event` | `[事件名, JSON]` | `breakthrough`{from,to}、`realm_change`{from,to,reason}、`variable_change`{id,old,new}（仅 `sync-arcartx: true` 的变量）、`tribulation_start`{id}、`tribulation_end`{id,result}、`cultivation_start`{}、`cultivation_end`{reason} |

在界面里监听这些包播放特效/刷新列表。`realm_change` 在管理员改境界等所有境界变更时都会推（`reason` 为 `INIT` / `ADMIN` / `BREAKTHROUGH` / `DEMOTE`），`breakthrough` 只在玩家突破成功时推。

## 四、注册 UI（UIHandler 方式，可选进阶）

`AX界面/` 文件夹放绑定配置（含 `id` 和 `ui-file` 的 yml 才会被识别；首启释出示例 `_修仙面板示例.yml`，去下划线启用）：

```yaml
id: xiuxian_panel
ui-file: "AX界面/ui/修仙面板.yml"   # 依次查找：绝对路径 → plugins/XiuXianCore/ → plugins/ArcartX/
on-open: []                        # UI 打开后执行的动作 DSL（可选）
on-close: []                       # UI 关闭时执行的动作 DSL（可选）
packets:                           # UI 内 sendPacket("标识") → 动作映射
  "breakthrough": [ "breakthrough" ]
  "tribulation": [ "tribulation" ]
```

- 注册后 `/xiuxian gui xiuxian_panel` 即可打开（箱子界面里也能用动作 `gui: xiuxian_panel` 跳转）
- UI 数据包动作里可用 `{packet_arg}` 取第一个参数
- 改完 `/xiuxian admin reload` 重新注册

## 五、最小验证流程

1. 客户端装 MOD 进服 → 控制台/后台无报错，说明通道建立、变量已在推送
2. 任意 AX 界面文本控件绑定 `Placeholder.parse("%xiuxian_realm_display%")` → 应显示境界
3. 加一个按钮执行 `Packet.send("xiuxian:action", "breakthrough")` → 触发突破流程
