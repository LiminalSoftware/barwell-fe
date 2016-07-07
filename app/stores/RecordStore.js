import storeFactory from 'flux-store-factory';
import dispatcher from '../dispatcher/MetasheetDispatcher'
import _ from 'underscore'
import util from '../util/util'
import getGuid from './getGuid'

var createRecordStore = function (model) {
  var label = 'm' + model.model_id
  var upperLabel = label.toUpperCase ()
  
  var RecordStore = storeFactory({
    identifier: model._pk,
    dispatcher: dispatcher,
    pivot: function (payload) {

      if (type === (upperLabel + '_CREATE')) {
          var object = payload[label]
          var index = payload.index

          TabularStore.emitChange()
      }

      if (type === (upperLabel + '_DESTROY')) {
          _records = _.filter(_records, function (rec) {
              rec[model._pk] !== payload[label][model._pk]
          })

          TabularStore.emitChange()
      }
    }
  })
}

export default createRecordStore;
