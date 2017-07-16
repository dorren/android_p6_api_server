var r = require('rethinkdb');

class BaseModel {
  constructor(attrs){
    this.attrs = attrs;
  }

  static findAll(callback) {
    var table = this.tableName();
    r.table(table).orderBy(r.desc('created_at')).run(dbConn, (err, result) => {
        if (err) throw err;

        var models = result.map(x => new this(x));
        callback(models);
    });
  }

  /**
   * find one model by id
   */
  static find(model_id, callback) {
    var table = this.tableName();
    r.table(table).get(model_id).run(dbConn, (err, result) => {
        if (err) throw err;

        var model = new this(result);
        callback(model);
    });
  }

  static create(attrs, callback) {
    var table = this.tableName();
    attrs = Object.assign(attrs, {created_at: new Date()});

    r.table(table).
      insert(attrs).run(dbConn, (err, result) => {
        if (err) throw err;

        var key = result.generated_keys[0];
        this.find(key, callback);
    });
  }


  static update(id, attrs, callback) {
    var table = this.tableName();
    r.table(table).
      filter(r.row("id").eq(id)).
      update(attrs).
      run(dbConn, (err, result) => {
          if (err) throw err;
          this.find(id, callback);
      });
  }
}

module.exports = BaseModel;
