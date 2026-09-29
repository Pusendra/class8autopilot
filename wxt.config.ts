import { defineConfig } from 'wxt';

// Where "Open demo load board" goes: the hosted board in builds, the local
// http-server (npm run board) under `wxt dev`. WXT_BOARD_URL overrides both.
const HOSTED_BOARD = 'https://pusendra.github.io/class8autopilot/';
const LOCAL_BOARD = 'http://localhost:5174/';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: (env) => ({
    define: {
      __BOARD_URL__: JSON.stringify(process.env.WXT_BOARD_URL ?? (env.mode === 'development' ? LOCAL_BOARD : HOSTED_BOARD)),
    },
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
