import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Overlay from './Overlay'

import util from '../../../../util/util'


var HAS_3D = util.has3d()

var Cursors = React.createClass ({

  getPointerElement: function () {
    var view = this.props.view
    var model = this.props.model
    var geo = view.data.geometry
    var store = this.props.store
    var ptr = this.props.pointer
    var col = view.data.visibleCols[ptr.left]
    var obj = store.getObject(ptr.top)
    var element = (fieldTypes[col.type] || fieldTypes.TEXT).element
    var selector = {}
    
    if (!obj) return ;

    selector[model._pk] = obj[model._pk]

    return React.createElement(element, {
      config: col,
      model: model,
      view: view,

      selected: true,

      spaceBottom: this.props.spaceBottom,
      spaceTop: ptr.top - this.props.rowOffset,
      spaceBottom: this.props.visibleRows + this.props.rowOffset - ptr.top,

      selector: selector,
      object: obj,
      pointer: ptr,
      rowHeight: geo.rowHeight,

      value: obj[col.column_id],
      column_id: col.column_id,

      _handleBlur: this.props._handleBlur,
      _handleDetail: this.props._handleDetail,
      _handleClick: this.props._handleClick,
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
        // borderLeft: '1px solid transparent',
        // borderBottom: '1px solid transparent',
      }
    })
  },

	render: function () {
    var view = this.props.view
    var model = this.props.model
    var store = this.props.store
    var rowCount = store.getRecordCount()
    var geo = view.data.geometry
    var focused = this.props.focused

    var rowOffset = this.props.rowOffset
    var colOffset = this.props.hiddenColWidth

    var marginTop = (-1 * rowOffset * geo.rowHeight)
    var fixedWidth = view.data.fixedWidth
    var floatWidth = view.data.floatWidth
    var adjustedWidth = fixedWidth + floatWidth + geo.labelWidth
      - this.props.hiddenColWidth

    var ptr = this.props.pointer
    var sel = this.props.selection
    var cpy = this.props.copyarea
    var showJaggedEdge = (sel.right >= view.data.fixedCols.length
      && sel.left <= view.data.fixedCols.length && this.props.hiddenCols > 0)

    var detailColumn = view.data.visibleCols[ptr.left]
    var detailObject = store.getObject(ptr.top)
    var element = (fieldTypes[detailColumn.type] || fieldTypes.TEXT).element

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
        width: (adjustedWidth + 3) + 'px',
        transformStyle: 'preserve-3d'
      }}>
      <div className = "wrapper overlay "
        style = {{
          top: geo.headerHeight - 1 - 2 + 'px',
          bottom: 0,
          left: geo.leftGutter + 'px',
          width: (fixedWidth + floatWidth + geo.labelWidth + 6) + 'px',
          pointerEvents: 'none',
          overflow: 'hidden',
          transform: 'translateZ(3px)'
        }}>
        <div className = "wrapper force-layer"
          ref = "overlayInner"
          style = {style}>

          <Overlay
                {...this.props}
                ref = "addNew"
                position = {{left: 0, right: view.data.visibleCols.length + view.data.fixedCols.length, 
                  top: rowCount, bottom: rowCount}}
                fudge = {{left: -1}}
                numHiddenCols = {this.props.hiddenCols}
                className = "add-new-row">
              <div className = "table-cell-inner" style={{cursor: 'pointer', lineHeight: (geo.rowHeight + 'px')}} 
                onClick = {this.props._addRecord}>
                <span className = "small grayed icon icon-plus"></span>
                Add a new row of data
              </div>
          </Overlay>

          
          <Overlay
            {...this.props}
            numHiddenCols = {this.props.hiddenCols}
            className = {"pointer " + (focused ? " focused" : " ") + 
            (this.props.expanded ? " pointer--expanded " : "")}
            ref = "pointer"
            fudge = {pointerFudge}
            position = {ptr}
            onMouseDown = {this.props._handleClick}
            onDoubleClick = {this.props._handleEdit}
            onContext: this.props._handleContextMenu,
            onWheel = {this.props._handleWheel}>
            {this.getPointerElement()}
          </Overlay>

          <Overlay
            {...this.props}
            numHiddenCols = {this.props.hiddenCols}
            className = {"selection-border selection-border--" + (focused ? "focused" : "blurred")}
            ref = "selectionBorder"
            position = {sel}
            fudge = {{left: -2.25, top: -0.25, height: 2.5, width: 3.5}}/>

          <Overlay
            {...this.props}
            numHiddenCols = {this.props.hiddenCols}
            className = "selection-outer"
            ref = "selectionOuter"
            position = {sel}
            fudge = {{left: -3.75, top: -2.75, height: 7.5, width: 6.5}}/>
          
          {
          showJaggedEdge ? 
          <Overlay
            {...this.props}
            className = " jagged-edge "
            ref = "jaggedEdge"
            position = {{
              left: view.data.fixedCols.length,
              width: '10px',
              top: sel.top,
              bottom: sel.bottom
            }}
            fudge = {{left: -3, width: 10 }} />
          : null}

          <Overlay
            columns = {view.data.visibleCols}
              numHiddenCols = {this.props.hiddenCols}
            rowOffset = {this.props.rowOffset}
            className = {" copyarea running marching-ants " + (focused ? " focused" : "")}
            ref="copyarea"
            {...this.props}
            position = {cpy}
            fudge = {{left: -1.25, top: 0, height: 1, width: 1.25}}/>
        </div>
      </div>

      <div className = {"force-layer wrapper underlay underlay--" + (focused ? "focused" : "blurred")}
        style = {{
          top: geo.headerHeight - 1 - 2 + 'px',
          bottom: 0,
          maxHeight: rowCount * geo.rowHeight + 'px',
          left: geo.leftGutter + 'px',
          width: (fixedWidth + floatWidth + geo.labelWidth - this.props.hiddenColWidth) + 'px',
          overflow: 'hidden',
          transform: 'translateZ(-1px)'
        }}>
        <div className = "wrapper underlay-inner force-layer"
          ref = "underlayInner"
          style = {style}>

          <Overlay
                numHiddenCols = {this.props.hiddenCols}
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
