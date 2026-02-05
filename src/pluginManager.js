const fs = require("fs-extra");
const path = require("path");

// project-root

const root = path.join(__dirname,"..")

class PluginManager {
  constructor(api) {
    // apiをセット
    this.api = api;
    // プラグインリスト
    this.plugins = [];
  }

  loadPlugins() {
    const dir = path.join(root, "plugins");
    // フォルダの中からjsを検出
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));

    // APIを固定
    const api = Object.freeze(this.api);
    
    for (const file of files) {
      try {
        const plugin = require(path.join(dir, file));
        if (!plugin.enable) continue
        this.plugins.push(plugin);      
        plugin.onLoad?.(api);
        console.log(`[Plugin] loaded: ${plugin.name ?? file}`);
      } catch (e) {
        console.error(`[Plugin] loadFailed: ${file}`, e);
      }
    }
  }

  emit(event, data) {
    for (const plugin of this.plugins) {
      try {
        plugin[event]?.(data);
      } catch (e) {
        console.error(`[Plugin] error in ${plugin.name}:${event}`, e);
      }
    }
  }
}

module.exports = PluginManager;
