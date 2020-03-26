#mongoose-double
===============

Provides Double support for [Mongoose](http://mongoosejs.com).

[![Build Status](https://secure.travis-ci.org/aheckmann/mongoose-long.png)](http://travis-ci.org/aheckmann/mongoose-double)

Example:

```js
var mongoose = require('mongoose')
require('mongoose-double')(mongoose);

var SchemaTypes = mongoose.Schema.Types;
var mySchema = new Schema({ double: SchemaTypes.Double });
var Xaction = db.model('Xaction', mySchema);

var x = new Xaction({ double: 47758.00 });

x.save(function (err) {
  Xaction.findById(x, function (err, doc) {
    console.log(doc.double.value);
    doc.double.value += 484.134;
    doc.save(cb);
  });
});
```

Values are cast to instances of [Double](https://github.com/mongodb/js-bson/blob/master/lib/bson/double.js). The value you pass is stored in the doubles `value` property.

```js
x.double = 40;
console.log(x.double)       // { _bsontype: 'Double', value: 40 }
console.log(x.double.value) // 40

// or use `valueOf()`
console.log(x.double.valueOf()) // 40
```

### install

```
npm install mongoose-double
```

See [node-mongodb-native](http://mongodb.github.com/node-mongodb-native/api-bson-generated/double.html) docs on all the `Double` methods available.

[LICENSE](https://github.com/aheckmann/mongoose-double/blob/master/LICENSE)
