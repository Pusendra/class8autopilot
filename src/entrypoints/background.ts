import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { selectionItem, type Message } from '../lib/state';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: Message, sender) => {
    if (message.type !== 'open-load' || !sender.tab?.id) return;
    // open() must run synchronously inside the user gesture that sent the message.
    browser.sidePanel.open({ tabId: sender.tab.id }).catch(() => {});
    void selectionItem.setValue({ ...message.selection, at: Date.now() });
  });
});
