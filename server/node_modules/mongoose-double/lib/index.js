// mongoose-double

module.exports = exports = function NumberDouble (mongoose) {
  var Schema = mongoose.Schema
    , SchemaType = mongoose.SchemaType
    , Types = mongoose.Types
    , mongo = mongoose.mongo;

  /**
   * Double constructor
   *
   * @inherits SchemaType
   * @param {String} key
   * @param {Object} [options]
   */

  function Double (key, options) {
    SchemaType.call(this, key, options);
  }

  /*!
   * inherits
   */

  Double.prototype.__proto__ = SchemaType.prototype;

  /**
   * Implement checkRequired method.
   *
   * @param {any} val
   * @return {Boolean}
   */

  Double.prototype.checkRequired = function (val) {
    return null != val;
  }

  /**
   * Implement casting.
   *
   * @param {any} val
   * @param {Object} [scope]
   * @param {Boolean} [init]
   * @return {mongo.Double|null}
   */

  Double.prototype.cast = function (val, scope, init) {
    if (null === val) return val;
    if ('' === val) return null;

    if (val instanceof mongo.Double)
      return val;

    if (val instanceof Number || 'number' == typeof val)
      return new mongo.Double(val);

    if (!Array.isArray(val) && val.toString)
      return new mongo.Double(val.toString());

    throw new SchemaType.CastError('Double', val)
  }

  /*!
   * ignore
   */

  function handleSingle (val) {
    return this.cast(val)
  }

  function handleArray (val) {
    var self = this;
    return val.map( function (m) {
      return self.cast(m)
    });
  }

  Double.prototype.$conditionalHandlers = {
      '$lt' : handleSingle
    , '$lte': handleSingle
    , '$gt' : handleSingle
    , '$gte': handleSingle
    , '$ne' : handleSingle
    , '$in' : handleArray
    , '$nin': handleArray
    , '$mod': handleArray
    , '$all': handleArray
  };

  /**
   * Implement query casting, for mongoose 3.0
   *
   * @param {String} $conditional
   * @param {*} [value]
   */

  Double.prototype.castForQuery = function ($conditional, value) {
    var handler;
    if (2 === arguments.length) {
      handler = this.$conditionalHandlers[$conditional];
      if (!handler) {
          throw new Error("Can't use " + $conditional + " with Double.");
      }
      return handler.call(this, value);
    } else {
      return this.cast($conditional);
    }
  }

  /**
   * Expose
   */

  Schema.Types.Double = Double;
  Types.Double = mongo.Double;
  return Double;
}

