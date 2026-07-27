# 开发者 API

> 这页解决：其他插件怎么读写修仙数据、监听修仙事件。

## 引入依赖

把 `XiuXianCore-x.y.z.jar` 作为 compileOnly 依赖加入你的项目，plugin.yml 声明：

```yaml
depend: [XiuXianCore]      # 或 softdepend
```

## 静态门面 `com.mcjingjie.xiuxian.api.XiuXianAPI`

```java
XiuXianAPI.isLoaded(player)                 // 数据是否已载入（异步载入，建议先判）
XiuXianAPI.getRealmId(player)               // 境界节点 ID，如 "zhuji_qianqi"
XiuXianAPI.getRealmDisplay(player)          // 境界显示名（& 颜色码）
XiuXianAPI.setRealm(player, "jindan_qianqi")
XiuXianAPI.attemptBreakthrough(player)      // 触发突破（含渡劫流程）
XiuXianAPI.getProgress(player)              // 突破进度 0~100
XiuXianAPI.getConditionLines(player)        // 条件进度文本列表
XiuXianAPI.getVariable(player, "linggen")
XiuXianAPI.setVariable(player, "lingqi", "100")
XiuXianAPI.getGlobalVariable("world_lingqi")
XiuXianAPI.evaluate(player, "{var:linggen} * 2 + {level}")   // 表达式求值
XiuXianAPI.getCounter(player, "kill:mm:LeiJieShou")
XiuXianAPI.openGui(player, "main")          // 箱子GUI优先，回退AX界面
XiuXianAPI.isInTribulation(player)
```

## 自定义事件（`com.mcjingjie.xiuxian.api.event`）

| 事件 | 时机 | 可取消 |
|---|---|---|
| `PlayerXiuXianDataLoadEvent` | 玩家数据载入完成 | 否 |
| `RealmChangeEvent` | 境界变更（INIT/ADMIN/BREAKTHROUGH/DEMOTE） | 否 |
| `RealmBreakthroughPreEvent` | 突破执行前（条件已过、未扣消耗） | **是** |
| `RealmBreakthroughEvent` | 突破成功后 | 否 |
| `TribulationStartEvent` | 渡劫发起前 | **是** |
| `TribulationEndEvent` | 渡劫结束（SUCCESS/FAIL_CHANCE/FAIL_DEATH/FAIL_TIMEOUT/FAIL_OFFLINE/CANCELLED） | 否 |
| `PlayerVariableChangeEvent` | 玩家变量变更 | 否 |
| `CultivationStartEvent` | 进入打坐前（v1.4.0） | **是** |
| `CultivationEndEvent` | 退出打坐（MOVE/DAMAGE/SNEAK_OFF/QUIT/TRIBULATION/RELOAD） | 否 |

示例——渡劫成功发奖励：

```java
@EventHandler
public void onTribulationEnd(TribulationEndEvent event) {
    if (event.getResult() == TribulationEndEvent.Result.SUCCESS) {
        event.getPlayer().sendRichMessage("<gold>天道酬勤！");
    }
}
```

## 给任务/脚本插件的无代码方案

不写 Java 也能对接：控制台执行 `/xiuxian admin var add <玩家> lingqi 100` 发资源、用 PAPI 占位符做条件判断、监听不了事件就轮询占位符。
