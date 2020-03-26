/**
Shortcut for `Object.prototype.hasOwnProperty.call(object, property)`.

@example
```
import hasOwnProp = require('has-own-prop');

hasOwnProp({}, 'hello');
//=> false

hasOwnProp([1, 2, 3], 0);
//=> true
```
*/
declare function hasOwnProp(object: unknown, key: string | number | symbol): boolean;

export = hasOwnProp;
