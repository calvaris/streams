require('./resources/testharness');

var ReadableStreamReader;

test(function() {
    // It's not exposed globally, but we test a few of its properties here.
    ReadableStreamReader = (new ReadableStream()).getReader().constructor;
}, 'Can get the ReadableStreamReader constructor indirectly');

test(function() {
    assert_throws(new TypeError(), function() {
        new ReadableStreamReader('potato');
    });
    assert_throws(new TypeError(), function() {
        new ReadableStreamReader({});
    });
    assert_throws(new TypeError(), function() {
        new ReadableStreamReader();
    });
}, 'ReadableStreamReader constructor should get a ReadableStream object as argument');

test(function() {
    var rsReader = new ReadableStreamReader(new ReadableStream());

    // assert_array_equals(Object.getOwnPropertyNames(rsReader), []);
    assert_array_equals(Object.getOwnPropertyNames(Object.getPrototypeOf(rsReader)).sort(), [ 'cancel', 'closed', 'constructor', 'read', 'releaseLock' ]);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'cancel').enumerable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'cancel').configurable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'cancel').writable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'closed').enumerable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'closed').configurable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'constructor').configurable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'constructor').writable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'read').enumerable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'read').configurable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'read').writable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'releaseLock').enumerable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'releaseLock').configurable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rsReader), 'releaseLock').writable);

    assert_equals(typeof rsReader.cancel, 'function', 'has a cancel method');
    assert_equals(rsReader.cancel.length, 1);
    assert_exists(Object.getPrototypeOf(rsReader), 'closed', 'has a closed property');
    assert_equals(typeof rsReader.closed.then, 'function', 'closed property is thenable');
    assert_equals(typeof rsReader.constructor, 'function', 'has a constructor method');
    assert_equals(rsReader.constructor.length, 1, 'constructor has 1 parameter');
    assert_equals(typeof rsReader.read, 'function', 'has a getReader method');
    assert_equals(rsReader.read.length, 0);
    assert_equals(typeof rsReader.releaseLock, 'function', 'has a releaseLock method');
    assert_equals(rsReader.releaseLock.length, 0);

}, 'ReadableStream instances should have the correct list of properties');

test(function() {
    var rsReader = new ReadableStreamReader(new ReadableStream());

    assert_equals(rsReader.closed, rsReader.closed);
}, 'ReadableStreamReader closed should always return the same promise object');

test(function() {
    var rs = new ReadableStream();
    assert_throws(new TypeError(), function() {
        rs.getReader();
        new ReadableStreamReader(rs);
    });
    rs = new ReadableStream();
    assert_throws(new TypeError(), function() {
        new ReadableStreamReader(rs);
        rs.getReader();
    });
    rs = new ReadableStream();
    assert_throws(new TypeError(), function() {
        rs.getReader();
        rs.getReader();
    });
    rs = new ReadableStream();
    assert_throws(new TypeError(), function() {
        new ReadableStreamReader(rs);
        new ReadableStreamReader(rs);
    });
}, 'ReadableStream getReader should throw if ReadableStream is locked');

test(function() {
    var rs = new ReadableStream({});
    rs.getReader();
    // window.gc();
    assert_throws(new TypeError(), function() { rs.getReader(); });
}, 'Collecting a ReadableStreamReader should not unlock its stream.');
