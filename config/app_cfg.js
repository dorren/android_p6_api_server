class AppConfig {
  constructor(env){
    this.attrs = require("./" + env + ".json");
  }

  get(name) {
    return this.attrs[name];
  }
}

module.exports = AppConfig;
