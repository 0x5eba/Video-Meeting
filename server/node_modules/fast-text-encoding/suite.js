function tests(isNative, TextEncoder, TextDecoder) {
  const dec = new TextDecoder();
  const enc = new TextEncoder('utf-8');

  suite(isNative ? 'native' : 'polyfill', () => {

    test('really large string', () => {
      const chunks = new Array(64);
      for (let i = 0; i < chunks.length; ++i) {
        const s = new Array(65535).fill('x'.charCodeAt(0));
        chunks[i] = s;
      }
      const s = chunks.join('');

      const buffer = enc.encode(s);
      const out = dec.decode(buffer);

      assert.equal(out, s);

    });

    suite('decoder', () => {

      test('basic', () => {
        const buffer = new Uint8Array([104, 101, 108, 108, 111]);
        assert.equal(dec.decode(buffer), 'hello');
      });

      test('constructor', () => {
        assert.throws(() => {
          new TextDecoder('invalid');
        }, RangeError);

        if (!isNative) {
          assert.throws(() => {
            new TextDecoder('utf-8', {fatal: true});
          }, Error, 'unsupported', 'fatal is unsupported');
        }
      });

      test('null in middle', () => {
        const s = 'pad\x00pad';
        const buffer = new Uint8Array([112, 97, 100, 0, 112, 97, 100]);
        assert.deepEqual(dec.decode(buffer), s);
      });

      test('null at ends', () => {
        const s = '\x00\x00?\x00\x00';
        const buffer = new Uint8Array([0, 0, 63, 0, 0]);
        assert.deepEqual(dec.decode(buffer), s);
      });

    });

    suite('encoder', () => {

      test('basic', () => {
        const buffer = new Uint8Array([104, 101, 108, 108, 111]);
        assert.deepEqual(enc.encode('hello'), buffer);
      });

      test('constructor', () => {
        const enc2 = new TextEncoder('literally anything can go here');
        const enc3 = new TextEncoder(new Object());

        // Despite having no difference in functionality, these should not be the
        // same object.
        assert.notEqual(enc, enc2);
        assert.notEqual(enc, enc3);
      });

      test('ie11 .slice', () => {
        const originalSlice = Uint8Array.prototype.slice;
        try {
          Uint8Array.prototype.slice = null;
          assert.isNull(Uint8Array.prototype.slice);

          // Confirms that the method works even without .slice.
          const buffer = new Uint8Array([194, 161]);
          assert.deepEqual(enc.encode('¡'), buffer);

        } finally {
          Uint8Array.prototype.slice = originalSlice;
        }
      });

      test('null in middle', () => {
        const s = 'pad\x00pad';
        const buffer = new Uint8Array([112, 97, 100, 0, 112, 97, 100]);
        assert.deepEqual(enc.encode(s), buffer);
      });

      test('null at ends', () => {
        const s = '\x00\x00?\x00\x00';
        const buffer = new Uint8Array([0, 0, 63, 0, 0]);
        assert.deepEqual(enc.encode(s), buffer);
      });

    });

  });

}

if (window.NativeTextEncoder && window.NativeTextDecoder) {
  tests(true, NativeTextEncoder, NativeTextDecoder);
}
tests(false, TextEncoder, TextDecoder);
