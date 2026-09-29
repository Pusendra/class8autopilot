import { defineConfig } from 'wxt';

// Where the demo load board lives. Local http-server in dev; override with
// WXT_BOARD_URL once it is published to GitHub Pages.
const BOARD_URL = process.env.WXT_BOARD_URL ?? 'http://localhost:5174/';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    define: { __BOARD_URL__: JSON.stringify(BOARD_URL) },
  }),
  manifest: {
    name: 'Class8 Copilot',
    description: 'Know if your truck should take the load — right inside the load board.',
    permissions: ['storage', 'sidePanel'],
    host_permissions: ['https://api.anthropic.com/*'],
    web_accessible_resources: [
      { resources: ['fonts/*.woff2'], matches: ['<all_urls>'] },
    ],
    action: { default_title: 'Class8 Copilot' },
  },
});
