# node-rand-token

Generate random tokens from your choice of randomness.

[![NPM](https://nodei.co/npm/rand-token.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/rand-token/)

[![Build Status](https://travis-ci.org/sehrope/node-rand-token.svg?branch=master)](https://travis-ci.org/sehrope/node-rand-token)


# Installation

Add it to your node.js project via:

    npm install rand-token --save

# Usage

    // Create a token generator with the default settings:
    var randtoken = require('rand-token');

    // Generate a 16 character alpha-numeric token:
    var token = randtoken.generate(16);

    // Use it as a replacement for uid:
    var uid = require('rand-token').uid;
    var token = uid(16);

    // Generate mostly sequential tokens:
    var suid = require('rand-token').suid;
    var token = suid(16);

# Defaults

The default set of allowed characters is all alpha-numeric characters. Specifically, lower case a through z, upper case A through Z, and the number 0 through 9. This gives you `(26 + 26 + 10)` = `62` possibilities per character.

Using 8 character random tokens will give you a possible token space of 62^8 = 2.18 x 10^14 ~= 2^47

Using 12 character random tokens will give you a possible token space of 62^12 = 3.22 x 10^21 ~= 2^71

Using 16 character random tokens will give you a possible token space of 62^16 = 4.76 x 10^28 ~= 2^95

# Functions

## uid(size)
Uses the default generator to generate a token of `size` characters.

## suid(size, [epoch], [prefixLength])
Uses the default generator to generate *mostly* sequential ids that can be compared with the usual string less-than/greater-than operators. By mostly, it means that a second execution of this function within the same millisecond may generate an id that is less than the second. The same holds true for ids generated from separate node processes. There's no coordination whatsover. This is meant to be used for situations where being able to sort tokens would be convenient, but not strictly required.

The generated tokens are of `size` characters prefixed with the time since the given epoch in base62 padded to `prefixLength` characters. The `epoch` parameter should be the unix time offset in milliseconds. The default `epoch` is 2000-01-01T00:00:00+00:00 and the default `prefixLength` is 8 characters.

__NOTE:__ The prefix length is in addition to the `size` parameter. Calling this function as `suid(16)` will return a 24-character token back (8 + 16).

## generate(size, [chars])

Generates a token of `size` characters using either the specified `chars` or the default for the generator. 

If `chars` is specified it will be treated as an array of characters to use. Each character in the list has an equal chance of being used so if a character is repeated twice, it will appear twice as often in the randomly generated tokens.

__Note__: Unlike the `generator(...)` function this function does not treat any string values of `chars` to be special and all values will be simply treated as an array of possible characters.

## generator([options])

Creates a custom token generator.

Available options:

* `source` - source of random bytes
    This should be either a string or a synchronous function with the signature `(size: number): Buffer`.

    The following string values are also accepted:

    * `default` - This is a synonym for using the default of `crypto.pseudoRandomBytes`. You do not need to specify `default` and can simply create the generator without this option specified to get the same effect.

    * `crypto` - This is a synonym for [`crypto.randomBytes`](http://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback). Note that this may throw an error during use if there is not enough entropy.

    * `math` - This is a synonym for using the Math.random() function.

* `chars` - string representing the list of allowed characters to use for `generate(size)` calls.

    The following string values have special meaning:

    * `default` - default set of token characters which is numbers, lower case letters, and upper case letters (i.e. `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`)
    * `a-z` || `alpha` - lower case characters (i.e. `abcdefghijklmnopqrstuvwxyz`)
    * `A-Z` || `ALPHA` - upper case characters (i.e. `ABCDEFGHIJKLMNOPQRSTUVWXYZ`)
    * `0-9` || `numeric` - numbers only (i.e. `0123456789`)
    * `base32` - use characters from the base32 alphabet, specifically `A-Z` and `2-7`

    Any other string value will be treated as an array of characters to use. 

    Each character in the list has an equal chance of being used. For example if a character is repeated twice, it will appear twice as often in randomly generated tokens. `chars` may be at most 255 characters long.

# Examples

To replace usage of uid with the default generator (alpha-numeric):

    // Create a token generator with the default settings:
    var uid = require('rand-token').uid;

    // Generate a 16 character alpha-numeric token:
    var token = uid(16)

To generate *mostly* sequential ids:
    
    // Create a token generator with the default settings:
    var suid = require('rand-token').suid;

    // Generate a 24 (16 + 8) character alpha-numeric token:
    var token = suid(16)

To generate only lower case letters (a-z):

    // Create a token generator with the default settings:    
    var randtoken = require('rand-token').generator({
      chars: 'a-z'
    });

    // Generate a 16 character token:
    var token = randtoken.generate(16);

Alternatively, you can create a generator with the default options and pass the characters to use as the second parameter to `generate`:

    // Create a token generator with the default settings:    
    var randtoken = require('rand-token').generator();

    // Generate a 16 character token:
    var token = randtoken.generate(16, "abcdefghijklnmopqrstuvwxyz");

To generate only upper case letters with `crypto.randomBytes` as the random source:

    var crypto = require('crypto');
    // Create the generator:
    var randtoken = require('rand-token').generator({
      chars: 'A-Z',
      source: crypto.randomBytes 
    });

    // Generate a 16 character token:
    var token = randtoken.generate(16);


# Dependencies

None.

# License

This plugin is released under the MIT license. See the file [LICENSE](LICENSE).
