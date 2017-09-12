import Ember from 'ember';

const Promise = Ember.RSVP.Promise;

function _queryPathPromise(adapter, store, typeClass, path, query, recordArray, requestType) {
  if (adapter.queryPath) {
    return adapter.queryPath(store, typeClass, query, recordArray);
  }

  // 'ds-improved-ajax' Ember Data feature
  if (adapter._requestFor) {
    var request = adapter._requestFor({
      store,
      path,
      data: query,
      requestType: requestType
    });

    if (request.url.indexOf(path) === -1) {
      request.url = adapter.urlPrefix(path, adapter.buildURL(typeClass.modelName, null, null, requestType));
    }

    return adapter._makeRequest(request);
  }

  var url = adapter.urlPrefix(path, adapter.buildURL(typeClass.modelName, null, null, requestType));
  return adapter.ajax(url, 'GET', { data: query });
}

function _queryPath(adapter, store, typeClass, path, query, recordArray) {
  var modelName = typeClass.modelName;
  var promise = _queryPathPromise(adapter, store, typeClass, path, query, recordArray, 'queryPath');

  var serializer = store.serializerFor(modelName);
  var label = `QueryPathMixin: Handle Adapter#queryPath of type: ${typeClass} path: ${path}`;

  promise = Promise.resolve(promise, label);

  return promise.then(function(adapterPayload) {
    var payload = serializer.normalizeResponse(store, typeClass, adapterPayload, null, 'query');
    return store.push(payload);
  }, null, `QueryPathMixin: Extract #queryPath of type: ${typeClass} path: ${path}`);
}

function _queryRecordPath(adapter, store, typeClass, path, query) {
  var modelName = typeClass.modelName;
  var promise = _queryPathPromise(adapter, store, typeClass, path, query, null, 'queryRecordPath');
  var serializer = store.serializerFor(modelName);
  var label = `QueryPathMixin: Handle Adapter#queryRecordPath of type: ${typeClass} path: ${path}`;

  promise = Promise.resolve(promise, label);

  return promise.then(function(adapterPayload) {
    var payload = serializer.normalizeResponse(store, typeClass, adapterPayload, null, 'queryRecord');
    return store.push(payload);
  });
}

export default Ember.Mixin.create({
  queryPath: function(modelName, path, query) {
    var typeClass = this.modelFor(modelName);
    var adapter = this.adapterFor(modelName);

    return _queryPath(adapter, this, typeClass, path, query);
  },

  queryRecordPath: function(modelName, path, query={}) {
    var typeClass = this.modelFor(modelName);
    var adapter = this.adapterFor(modelName);

    return _queryRecordPath(adapter, this, typeClass, path, query);
  }
});
