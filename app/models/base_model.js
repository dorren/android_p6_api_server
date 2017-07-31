var r = require('rethinkdb');

class BaseModel {
  constructor(attrs){
    this.attrs = attrs;
  }
  static errKey() { return "_error"; }

  /**
   * return list of events.
   *
   * example query options:
   *     {where: {user_id: "1234"},
   *      orderBy: "created_at"
   *     }
   */
  static findAll(options, callback) {
    var table = this.tableName();
    var query = r.table(table);

    if(options.orderBy == undefined){
      query = query.orderBy(r.desc('created_at'));
    }else{
      query = query.orderBy(options.orderBy);
    }

    if(options.where && Object.keys(options.where).length > 0){
      query = query.filter(options.where);
    }

    query.run(dbConn, (err, cursor) => {
        if (err) throw err;

        cursor.toArray((err, result) => {
            if (err) throw err;

            var models = result.map( x => new this(x));
            callback(models);
        });
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

  static by_ids(model_ids, callback) {
    var table = this.tableName();
    r.table(table).getAll(...model_ids).
      orderBy(r.desc('created_at')).run(dbConn, (err, result) => {
        if (err) throw err;

        var models = result.map(x => new this(x));
        callback(models);
    });
  }

  static create(attrs, callback) {
    var table = this.tableName();

    attrs = Object.assign(attrs, {created_at: new Date()});

    r.table(table).
      insert(attrs).run(dbConn, (err, result) => {
        if (err) throw err;

        if(result.first_error){
          var e = {};
          e[this.errKey()]= result.first_error;

          var model = new this(e);
          callback(model);
        }else{
          var key = result.generated_keys[0];
          this.find(key, callback);
        }
    });
  }

  static multiCreate(attrsArr, callback) {
    var table = this.tableName();

    attrsArr = attrsArr.map(x => {x.created_at = new Date(); return x;});

    r.table(table).
      insert(attrsArr).run(dbConn, (err, result) => {
        if (err) throw err;

        if(result.first_error){
          var e = {};
          e[this.errKey()]= result.first_error;

          var model = new this(e);
          callback(model);
        }else{
          var keys = result.generated_keys;
          this.by_ids(keys, callback);
        }
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

  error() {
    return this.attrs[this.constructor.errKey()];
  }

  static toTime(value){
    return r.ISO8601(value);
  }
}

module.exports = BaseModel;
