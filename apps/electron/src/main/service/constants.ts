export const MCPConfig = {
  context7: {
    displayName: '代码能力增强',
    icon: '📦',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
  },
  github: {
    displayName: 'GitHub',
    icon: '🐙',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN:
        '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',
    },
  },
  filesystem: {
    displayName: '文件系统',
    icon: '📁',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/bytedance/Desktop'],
  },
  'playwright-mcp': {
    displayName: '浏览器能力',
    icon: '🌐',
    command: 'npx',
    args: ['@playwright/mcp@latest'],
  },
};
