require(__dirname+'/test-helper');
var Connection = require(__dirname + '/../../../lib/connection');
test('connection can take existing stream', function() {
  var stream = new MemoryStream();
  var con = new Connection({stream: stream});
  assert.equal(con.stream, stream);
});

test('using closed stream', function() {
  var stream = new MemoryStream();
  stream.readyState = 'closed';
  stream.connect = function(port, host) {
    this.connectCalled = true;
    this.port = port;
    this.host = host;
  }

  var con = new Connection({stream: stream});

  con.connect(1234, 'bang');
  
  test('makes stream connect', function() {
    assert.equal(stream.connectCalled, true);
  });

  test('uses configured port', function() {
    assert.equal(stream.port, 1234);
  });

  test('uses configured host', function() {
    assert.equal(stream.host, 'bang');
  });

  test('after stream connects client emits connected event', function() {

    var hit = false;

    con.once('connect', function() {
      hit = true;
    });

    assert.ok(stream.emit('connect'));
    assert.ok(hit);

  });
});

test('using opened stream', function() {
  var stream = new MemoryStream();
  stream.readyState = 'open';
  stream.connect = function() {
    assert.ok(false, "Should not call open");
  };
  var con = new Connection({stream: stream});
  test('does not call open', function() {
    var hit = false;
    con.once('connect', function() {
      hit = true;
    });
    con.connect();
    assert.ok(hit);
  });

});

test('keep-alive configuration', function() {
  var stream = new MemoryStream();

  var setKeepAliveFn = stream.setKeepAlive;

  var setKeepAliveHit = false,
    keepAliveEnabledValue,
    keepAliveInitialDelayValue;

  stream.setKeepAlive = function(enabled, initialDelay) {
    setKeepAliveHit = true;
    keepAliveEnabledValue = enabled;
    keepAliveInitialDelayValue = initialDelay;
  };

  test('keep-alive should NOT be hit', function() {
    setKeepAliveHit = false;
    var con = new Connection({stream: stream});
    assert.ok(!setKeepAliveHit, 'setKeepAliveHit should not be called');
    assert.equal(keepAliveEnabledValue, undefined);
    assert.equal(keepAliveInitialDelayValue, undefined);
  });

  test('keep-alive should be hit', function() {
    setKeepAliveHit = false;
    var con = new Connection({stream: stream, keepAlive: {enabled: true, initialDelay: 5000}});
    assert.ok(setKeepAliveHit, 'setKeepAliveHit should be called');
    assert.equal(keepAliveEnabledValue, true);
    assert.equal(keepAliveInitialDelayValue, 5000);
  });


  test('keep-alive should be hit for enabled=false', function() {
    setKeepAliveHit = false;
    var con = new Connection({stream: stream, keepAlive: {enabled: false}});
    assert.ok(setKeepAliveHit, 'setKeepAliveHit should be called');
    assert.equal(keepAliveEnabledValue, false);
    assert.equal(keepAliveInitialDelayValue, undefined);
  });


  stream.setKeepAlive = setKeepAliveFn;
});
