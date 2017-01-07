import { connect } from 'react-redux'
import Application from './Application'
import _ from 'underscore'

const mapStateToProps = (state, ownProps) => {
  return Object.assign({}, ownProps, {
    views: state.data.views,
    models: state.data.models,
    focus: state.session.focus
  })
}

const ConnectedApplication = connect(
  mapStateToProps,
  null
)(Application)

export default ConnectedApplication
