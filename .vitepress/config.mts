import { defineConfig } from 'vitepress'
export default defineConfig({
  lang: 'zh-CN',
  title: 'XiuXianCore',
  description: '修仙插件文档：境界·突破·渡劫·打坐·灵脉·GUI·ArcartX 对接',
  base: '/XiuXianCore-Wiki/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/安装与前置' },
      { text: 'v1.4.0 新功能', link: '/v1.4.0更新指南' },
      { text: '插件开发/定制', link: '/关于作者与定制' }
    ],
    sidebar: [
      { text: '入门', collapsed: false, items: [
        { text: '安装与前置', link: '/安装与前置' },
        { text: '配置总览', link: '/配置总览' },
        { text: 'v1.4.0 更新指南', link: '/v1.4.0更新指南' }
      ]},
      { text: '核心玩法', collapsed: false, items: [
        { text: '境界配置', link: '/境界配置' },
        { text: '打坐修炼与灵脉', link: '/打坐修炼' },
        { text: '突破与条件', link: '/突破与条件' },
        { text: '渡劫配置', link: '/渡劫配置' },
        { text: '变量系统', link: '/变量系统' }
      ]},
      { text: '界面', collapsed: false, items: [
        { text: '界面配置（箱子GUI）', link: '/界面配置' },
        { text: 'AX界面对接', link: '/AX界面对接' }
      ]},
      { text: '参考', collapsed: false, items: [
        { text: '指令与权限', link: '/指令与权限' },
        { text: '占位符', link: '/占位符' },
        { text: '存储与迁移', link: '/存储与迁移' },
        { text: '开发者API', link: '/开发者API' },
        { text: '常见问题', link: '/常见问题' },
        { text: '作者与插件定制', link: '/关于作者与定制' },
        { text: '文档目录与进度', link: '/README' }
      ]}
    ],
    outline: { level: [2, 3], label: '大纲' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/2689508458/XiuXianCore-Wiki' }],
    docFooter: { prev: '上一页', next: '下一页' },
    search: { provider: 'local' }
  },
  ignoreDeadLinks: true
})
