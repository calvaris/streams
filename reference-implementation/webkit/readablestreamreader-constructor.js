require('./resources/testharness');

var ReadableStreamReader;

test(function() {
    // It's not exposed globally, but we test a few of its properties here.
    ReadableStreamReader = (new ReadableStream()).getReader().constructor;
}, 'Can get the ReadableStreamReader constructor indirectly');

test(function() {
    var rs = new ReadableStream({});
    rs.getReader();
    // window.gc();
    assert_throws(new TypeError(), function() { rs.getReader(); });
}, 'Collecting a ReadableStreamReader should not unlock its stream');
