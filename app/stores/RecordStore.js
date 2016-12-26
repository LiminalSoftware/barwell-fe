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
      
      if (type === ('RECORD_CREATE')) {
          const object = payload.data
          const model = payload.model_id
          const view_id = payload.view_id
          const index = payload.index

          RecordStore.emitChange()
      }

      if (type === ('RECORD_DESTROY')) {
          _records = _.filter(_records, function (rec) {
              rec[model._pk] !== payload[label][model._pk]
          })

          RecordStore.emitChange()
      }
    }
  })
}

export default createRecordStore;
