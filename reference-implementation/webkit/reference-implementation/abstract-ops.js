require('../resources/testharness');

require('./utils/streams-utils');

import { IsReadableStreamDisturbed } from '../../lib/readable-stream'

// This is updated till https://github.com/whatwg/streams/commit/c942e11025a770d60ab3d4f6541b29e45da518da

test(function() {
    var rs = new ReadableStream();

    assert_false(IsReadableStreamDisturbed(rs), 'rs should not be disturbed on construction');

    var reader = rs.getReader();
    assert_false(IsReadableStreamDisturbed(rs), 'getReader() call has no effect on whether a stream is disturbed or not');

    reader.read();
    assert_true(IsReadableStreamDisturbed(rs), 'rs should be disturbed after read() call');
}, 'IsReadableStreamDisturbed returns true for an empty non-closed stream on which read() has been called');

test(function() {
    var rs = new ReadableStream();

    assert_false(IsReadableStreamDisturbed(rs), 'rs should not be disturbed on construction');

    var reader = rs.getReader();
    assert_false(IsReadableStreamDisturbed(rs), 'getReader() call has no effect on whether a stream is disturbed or not');

    reader.cancel();
    assert_true(IsReadableStreamDisturbed(rs), 'rs should be disturbed after cancel() call');
}, 'IsReadableStreamDisturbed returns true for an empty non-closed stream on which cancel() has been called');

test(function() {
    var rs = new ReadableStream({
        start: function(c) {
            c.close();
        }
    });

    assert_false(IsReadableStreamDisturbed(rs), 'rs should not be disturbed on construction');

    var reader = rs.getReader();
    assert_false(IsReadableStreamDisturbed(rs), 'getReader() call has no effect on whether a stream is disturbed or not');

    reader.read();
    assert_true(IsReadableStreamDisturbed(rs), 'rs should be disturbed after read() call');
}, 'IsReadableStreamDisturbed returns true for a closed stream on which read() has been called');

test(function() {
    var rs = new ReadableStream({
        start: function(c) {
            c.close();
        }
    });

    assert_false(IsReadableStreamDisturbed(rs), 'rs should not be disturbed on construction');

    var reader = rs.getReader();
    assert_false(IsReadableStreamDisturbed(rs), 'getReader() call has no effect on whether a stream is disturbed or not');

    reader.cancel();
    assert_true(IsReadableStreamDisturbed(rs), 'rs should be disturbed after cancel() call');
}, 'IsReadableStreamDisturbed returns true for a closed stream on which cancel() has been called');

test(function() {
    var rs = new ReadableStream({
        start: function(c) {
            c.error(new Error('waffles'));
        }
    });

    assert_false(IsReadableStreamDisturbed(rs), 'rs should not be disturbed on construction');

    var reader = rs.getReader();
    assert_false(IsReadableStreamDisturbed(rs), 'getReader() call has no effect on whether a stream is disturbed or not');

    reader.read();
    assert_true(IsReadableStreamDisturbed(rs), 'rs should be disturbed after read() call');
}, 'IsReadableStreamDisturbed returns true for an errored stream on which read() has been called');

test(function() {
    var rs = new ReadableStream({
        start: function(c) {
            c.error(new Error('waffles'));
        }
    });

    assert_false(IsReadableStreamDisturbed(rs), 'rs should not be disturbed on construction');

    var reader = rs.getReader();
    assert_false(IsReadableStreamDisturbed(rs), 'getReader() call has no effect on whether a stream is disturbed or not');

    reader.cancel();
    assert_true(IsReadableStreamDisturbed(rs), 'rs should be disturbed after cancel() call');
}, 'IsReadableStreamDisturbed returns true for an errored stream on which cancel() has been called');
