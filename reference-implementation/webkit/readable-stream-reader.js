require('./resources/testharness');

require('./reference-implementation/utils/streams-utils');

require('./resources/gc');

test(function() {
    var rs = new ReadableStream({});
    rs.getReader();
    global.gc();
    assert_throws(new TypeError(), function() { rs.getReader(); }, 'old reader should still be locking a new one even after garbage collection');
}, 'Collecting a ReadableStreamReader should not unlock its stream');
