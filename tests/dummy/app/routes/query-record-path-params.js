import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').queryRecordPath('post', 'recent', { include: 'comments' });
  }
});
