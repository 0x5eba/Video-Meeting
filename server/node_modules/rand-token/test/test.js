var _ = require('lodash'),
    assert = require('assert'),
    crypto = require('crypto');

describe('Create a default random token generater', function() {
  it('should create successfully', function() {
    var randtoken = require('../index.js');
  });

  it('should create tokens', function() {
    var randtoken = require('../index.js');
    randtoken.generate(16);
  });

  it('should create tokens of the specified length', function() {
    var randtoken = require('../index.js');
    var token = randtoken.generate(16);
    assert(token.length, 16);
  });

  it('should create tokens using the uid function', function() {
    var randtoken = require('../index.js');
    var token = randtoken.uid(16);
    assert(token.length, 16);
  });

  it('should create sequentially sorted tokens', function(done) {
    var randtoken = require('../index.js');
    var token = randtoken.suid(16);
    function genAnotherAndCompare() {
      var secondToken = randtoken.suid(16);
      assert(token < secondToken);      
      done();
    };
    setTimeout(genAnotherAndCompare, 10);
  });
});

var randtoken = require('../index.js');

var randSourceToTest = [
  'default',
  'math',
  'crypto',
  crypto.randomBytes
];
var tokenCharsToTest = [
  {chars: 'a', regex: /^a{16}$/ },
  {chars: 'alpha', regex: /^[a-z]{16}$/ },
  {chars: 'ALPHA', regex: /^[A-Z]{16}$/ },
  {chars: 'numeric', regex: /^[0-9]{16}$/ },
];

_.each(randSourceToTest, function(randSourceTest) {
  _.each(tokenCharsToTest, function(tokenCharTest) {
    describe('Generate a 16 character token with tokeChars=' + tokenCharTest.chars + 
                ' and a randSource=' + randSourceTest, function() {
      var generator;
      it('should create a generator successfully', function() {
        generator = randtoken.generator({source: randSourceTest, chars: tokenCharTest.chars});
      });

      it('should generate tokens that match the regex ' + tokenCharTest.regex, function() {
        for(var i=0;i<1000;i++) {
          var token = generator.generate(16);
          assert(tokenCharTest.regex.test(token));
        }
      });
    });
  });
});
