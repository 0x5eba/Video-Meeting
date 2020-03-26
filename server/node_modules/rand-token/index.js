(function () {
  "use strict";

  var crypto = require('crypto');
  var assert = require('assert');
  var cryptoRandomBytes = crypto.pseudoRandomBytes || crypto.randomBytes;

  var numeric = '0123456789';
  var alphaLower = 'abcdefghijklmnopqrstuvwxyz';
  var alphaUpper = alphaLower.toUpperCase();
  // NOTE: This is explicitly in sortable order:
  var alphaNumeric = numeric + alphaUpper + alphaLower;
  
  var defaults = {
    "chars": 'default',
    "source": 'default'
  };

  function validateTokenChars(tokenChars) {
    assert(tokenChars);
    assert(typeof(tokenChars) == 'string');
    assert(tokenChars.length > 0);
    assert(tokenChars.length < 256);
  }

  function buildGenerator(options) {
    assert(!options || typeof(options) == 'object');
    options = options || {};
    options.chars = options.chars || defaults.chars;
    options.source = options.source || defaults.source;

    // Allowed characters
    switch( options.chars ) {
      case 'default':
        options.chars = alphaNumeric;
        break;
      case 'a-z':
      case 'alpha':
        options.chars = alphaLower;
        break;
      case 'A-Z':
      case 'ALPHA':
        options.chars = alphaUpper;
        break;
      case '0-9':
      case 'numeric':
        options.chars = numeric;
        break;
      case 'base32':
        options.chars = alphaUpper + "234567";
        break;
      default:
        // use the characters as is
    }
    validateTokenChars(options.chars);

    // Source of randomness:
    switch( options.source ) {
      case 'default':
        options.source = cryptoRandomBytes;
        break;
      case 'crypto':
        options.source = crypto.randomBytes;
        break;
      case 'math':
        options.source = function(size) {
          var buf = new Buffer(size);
          for(var i=0;i<size;i++) {
            buf.writeUInt8(Math.floor(256 * Math.random()), i);
          }
          return buf;
        };
        break;
      default:
        assert(typeof(options.source) == 'function');
    }

    return {
      "generate": function(size, chars) {
        if( chars ) {
          validateTokenChars(chars);
        } else {
          chars = options.chars;
        }
        var max = Math.floor(256 / chars.length) * chars.length;
        var ret = "";
        while( ret.length < size ) {
          var buf = options.source(size - ret.length);
          for(var i=0;i<buf.length;i++) {
            var x = buf.readUInt8(i);
            if( x < max ) {
              ret += chars[x % chars.length];
            }
          }
        }
        return ret;
      }
    };
  }

  function base62(n) {
    assert(n >= 0);
    n = Math.floor(n);
    var ret = [];
    do {
      var index = n % 62;
      ret.push(alphaNumeric[index]);
      n = Math.floor(n / 62);
    } while( n > 0);
    return ret.reverse().join("");
  }

  // Default epoch of "2000-01-01T00:00:00+00:00"
  var defaultEpoch = 946684800000;
  var defaultPrefixLength = 8;
  function suidPrefix(epoch, prefixLength) {
    var ret = base62(Date.now() - epoch);
    while( ret.length < prefixLength ) {
      ret = "0" + ret;
    }
    return ret;
  }

  var defaultGenerator = buildGenerator();

  module.exports = {
    generator: buildGenerator,
    generate: defaultGenerator.generate,
    uid: defaultGenerator.generate,
    suid: function(length, epoch, prefixLength) {
      epoch = epoch || defaultEpoch;
      prefixLength = prefixLength || defaultPrefixLength;
      return suidPrefix(epoch, prefixLength) + defaultGenerator.generate(length);
    }
  };
})();
