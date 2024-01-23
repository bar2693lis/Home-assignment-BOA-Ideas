import RefreshRuntime from '/@react-refresh';

RefreshRuntime.injectIntoGlobalHook(window);
// eslint-disable-next-line no-empty-function
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
// eslint-disable-next-line camelcase
window.__vite_plugin_react_preamble_installed__ = true;
