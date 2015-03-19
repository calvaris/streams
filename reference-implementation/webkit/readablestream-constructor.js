require('./resources/testharness');

test(function() {
    var rs = new ReadableStream();

    assert_array_equals(Object.getOwnPropertyNames(rs), ['closed', 'ready']);
    assert_array_equals(Object.getOwnPropertyNames(Object.getPrototypeOf(rs)), ['cancel', 'constructor', 'pipeThrough', 'pipeTo', 'read', 'state']);

    assert_true(Object.getOwnPropertyDescriptor(rs, 'closed').enumerable);
    assert_false(Object.getOwnPropertyDescriptor(rs, 'closed').configurable);

    assert_true(Object.getOwnPropertyDescriptor(rs, 'ready').enumerable);
    assert_false(Object.getOwnPropertyDescriptor(rs, 'ready').configurable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'state').enumerable);
    assert_false(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'state').configurable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'read').enumerable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'read').configurable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'read').writable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'cancel').enumerable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'cancel').configurable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'cancel').writable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'pipeTo').enumerable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'pipeTo').configurable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'pipeTo').writable);

    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'pipeThrough').enumerable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'pipeThrough').configurable);
    assert_true(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(rs), 'pipeThrough').writable);
}, 'ReadableStream instances should have the correct list of properties');

test(function() {
    new ReadableStream({ });
}, 'ReadableStream can be constructed with an empty object as argument');
