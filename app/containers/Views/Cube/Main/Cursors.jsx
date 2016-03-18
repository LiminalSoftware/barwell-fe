import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Overlay from '../../Tabular/Main/Overlay'
import ContextMenu from './CubeContextMenu'

import PopDownMenu from '../../../../components/PopDownMenu'
import util from '../../../../util/util'

var HAS_3D = util.has3d()
var RIGHT_FRINGE = '200px'

var Cursors = React.createClass ({

  getPointerElement: function () {
    var view = this.props.view
    var model = this.props.model
    var geo = view.data.geometry
    var store = this.props.store
    var ptr = this.props.pointer
    var col = view.data.visibleCols[ptr.left]
    var obj = store.getObject(ptr.top)
    var element = col ? (fieldTypes[col.type]).element : null
    var selector = {}
    
    if (!obj) return ;

    selector[model._pk] = obj[model._pk]

    if (element) return React.createElement(element, {
      config: col,
      model: model,
      view: view,

      selected: true,

      spaceTop: ptr.top - this.props.vOffset,
      spaceBottom: this.props.visibleRows + this.props.vOffset - ptr.top,

      selector: selector,
      object: obj,
      pointer: ptr,
      rowHeight: geo.rowHeight,

      value: obj[col.column_id],
      column_id: col.column_id,

      _handleBlur: this.props._handleBlur,
      _handleDetail: this.props._handleDetail,
      // _handleClick: this.props._handleClick,
      _handleClick: (e => e.stopPropagation()),
      _handleEdit: this.props._handleEdit,
      _handleWheel: this.props._handleWheel,
      _handlePaste: this.props._handlePaste,

      className: 'table-cell',
      ref: 'pointerCell',
      sorted: false,
      style: {
        left: '0px',
        bottom: '0px',
        top: '0px',
        right: '0px',
        border: 'none'
      }
    })
  },

	render: function () {
    var view = this.props.view
    var model = this.props.model
    var store = this.props.store
    var rowCount = store.getCount('row')
    var geo = view.data.geometry
    var focused = this.props.focused

    var marginTop = this.props.vOffset * geo.rowHeight + 'px'

    var ptr = this.props.pointer
    var sel = this.props.selection
    var cpy = this.props.copyarea
    var showJaggedEdge = (sel.right >= view.data.fixedCols.length
      && sel.left <= view.data.fixedCols.length && this.props.hiddenCols > 0)

    var detailColumn = view.data.visibleCols[ptr.left]
    // var detailObject = store.getValue(ptr.top, ptr.left)
    

    var pointerFudge = this.props.expanded ? {
      left: -30,
      width: 60,
      top: -15,
      height: 30,
    } : {width: -1, top: 1, height: -1};

    var style = {
      top: 0,
      left: 0,
      right: 0,
      height: ((rowCount + 1) * geo.rowHeight) + 'px',
      transformStyle: 'preserve-3d'
    }

    if (HAS_3D) style.transform = 'translateY(' + (marginTop + 2) + 'px)'
    else style.marginTop = marginTop + 2 + 'px'

    return <div className = "wrapper" style = {{
        left: 0,
        top: 0,
        bottom: 0,
        width: (this.props.adjustedWidth + RIGHT_FRINGE) + 'px',
        transformStyle: 'preserve-3d'
      }}>
      <div className = "wrapper overlay "
        style = {{
          top: geo.headerHeight - 1 - 2 + 'px',
          bottom: 0,
          left: geo.leftGutter + 'px',
          width: (this.props.adjustedWidth + RIGHT_FRINGE) + 'px',
          pointerEvents: 'none',
          overflow: 'hidden',
          transform: 'translateZ(3px)'
        }}>
        <div className = "wrapper force-layer"
          ref = "overlayInner"
          style = {style}>
          
          <Overlay
            {...this.props}
            className = {"pointer " + (focused ? " focused" : " ") + 
              (focused ? " " : " gray-out ") +
              (this.props.expanded ? " pointer--expanded " : "")}
            ref = "pointer"
            fudge = {pointerFudge}
            position = {ptr}
            
            onDoubleClick = {this.props._handleEdit}
            onContextMenu = {this.props._handleContextMenu}
            onWheel = {this.props._handleWheel}>
            {/*this.getPointerElement()*/}
            {this.props.context ? <ContextMenu {...this.props}/> : null}
          </Overlay>

          <Overlay
            {...this.props}
            numHiddenCols = {this.props.hiddenCols}
            className = {"selection-border selection-border--" + (focused ? "focused" : "blurred")}
            ref = "selectionBorder"
            position = {sel}
            fudge = {{left: -2.25, top: -0.25, height: 2.5, width: 3.5}}>
            <div className = {"selection-drag-box selection-drag-box--" + (focused ? "focused" : "blurred")} />
          </Overlay>

          <Overlay
            {...this.props}
            numHiddenCols = {this.props.hiddenCols}
            className = "selection-outer"
            ref = "selectionOuter"
            position = {sel}
            fudge = {{left: -3.75, top: -2.75, height: 7.5, width: 6.5}}>
          </Overlay>
          

          <Overlay
            columns = {view.data.visibleCols}
            numHiddenCols = {this.props.hiddenCols}
            rowOffset = {this.props.vOffset}
            className = {" copyarea running marching-ants " + (focused ? " focused" : "")}
            ref = "copyarea"
            {...this.props}
            position = {cpy}
            fudge = {{left: -1.25, top: 0, height: 1, width: 1.25}} />
        </div>
      </div>

      <div className = {"force-layer wrapper underlay underlay--" + (focused ? "focused" : "blurred")}
        style = {{
          top: geo.headerHeight - 1 - 2 + 'px',
          bottom: 0,
          maxHeight: rowCount * geo.rowHeight + 'px',
          left: geo.leftGutter + 'px',
          width: (this.props.adjustedWidth - this.props.hOffset * geo.columnWidth) + 'px',
          overflow: 'hidden',
          transform: 'translateZ(-1px)'
        }}>
        <div className = "wrapper underlay-inner force-layer"
          ref = "underlayInner"
          style = {style}>

          <Overlay
                numHiddenCols = {this.props.hOffset}
            className = {" selection " + (focused ? " focused" : "")}
            ref = "selection"
            {...this.props}
            position = {sel}
            fudge = {{left: -4.75, top: -2.75, height: 7.5, width: 8.5}}/>
        </div>
      </div>

    </div>
  }
});


export default Cursors
