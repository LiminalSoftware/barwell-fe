import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Overlay from '../../Tabular/Main/Overlay'
import ContextMenu from './ContextMenu'

import PopDownMenu from '../../../../components/PopDownMenu'
import util from '../../../../util/util'

const HAS_3D = util.has3d()
const RIGHT_FRINGE = 200;
const CLIPPING_FUDGE = 3;

var Cursors = React.createClass ({

  getPointerElement: function () {
    var view = this.props.view;
    var model = this.props.model;
    var geo = view.data.geometry;
    var store = this.props.store;
    var ptr = this.props.pointer;
    var columnHeaders = view.column_aggregates;
    var rowHeaders = view.row_aggregates;
    var col ;
    var obj;
    var isNull;
    var value;
    var element;
    var selector = {};
    
    if (ptr.left < 0 && ptr.top >= 0) {
      var pointerKey = 'a' + rowHeaders[rowHeaders.length + ptr.left]; // ptr.left is negative
      var level = store.getLevel('row', ptr.top)
      col = view.data.columns[pointerKey]
      value = level ? level[pointerKey] : null
      rowHeaders.forEach(function (rh, idx) {
        if (idx - rowHeaders.length <= ptr.left) {
          var key = 'a' + rowHeaders[idx]
          selector[key] = level ? level[key] : null
        }
      })
      isNull = false
    } else if (ptr.top < 0 && ptr.left >= 0) {
      var pointerKey = 'a' + columnHeaders[columnHeaders.length + ptr.top];
      var level = store.getLevel('column', ptr.left)
      col = view.data.columns[pointerKey]
      value = level ? level[pointerKey] : null
      columnHeaders.forEach(function (rh, idx) {
        if (idx - columnHeaders.length <= ptr.top) {
          var key = 'a' + columnHeaders[idx]
          selector[key] = level ? level[key] : null
        }
      })
      isNull = false
    } else if (ptr.left >= 0 && ptr.top >= 0) {
      Object.assign(selector, store.getLevel('row', ptr.top));
      Object.assign(selector, store.getLevel('column', ptr.left));

      obj = store.getValue(ptr.top, ptr.left);
      col = view.data.columns['a' + view.value]
      value = obj ? obj[col.column_id] : null;
      isNull = !obj
    }
    
    element = col ? (fieldTypes[col.type]).element : null

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
      rowHeight: geo.rowHeight * (ptr.bottom - ptr.top + 1),

      value: value,
      isNull: isNull,
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
        left: 0,
        bottom: 0,
        top: 0,
        right: 0,
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

    var marginTop = this.props.vOffset * geo.rowHeight;
    var marginLeft = this.props.hOffset * geo.columnWidth;

    var ptr = this.props.pointer
    var sel = this.props.selection
    var cpy = this.props.copyarea

    var numCols = store.getCount('column');
    var numRows = store.getCount('row');

    var isRowSelection = sel.left < 0;
    var isColumnSelection = sel.top < 0;

    var rowOffset = isRowSelection ? 0 : (this.props.rowHeaderWidth - CLIPPING_FUDGE)
    var columnOffset = isColumnSelection ? 0 : (this.props.columnHeaderHeight - CLIPPING_FUDGE)
    var overlayHeight = isColumnSelection ? 
      (rowCount * geo.rowHeight + this.props.columnHeaderHeight - marginTop) : 
      this.props.columnHeaderHeight

    // var style = {
    //   top: 0,
    //   left:  0,
    //   right: 0,
    //   bottom: 0,
    //   transformStyle: 'preserve-3d',
    //   transform: 'translate3d(' + (isRowSelection ? 0 : (marginLeft) + 'px, ' + (isColumnSelection ? 0 : (marginTop)) + 'px, 0)',
    //   marginTop: !HAS_3D ? (isColumnSelection ? 0 : (marginTop + 2)) : 0,
    // };

    return <div className = "cursor-wrapper wrapper" style = {{
        left: '0',
        top: '0',
        bottom: 0,
        width: (this.props.adjustedWidth + RIGHT_FRINGE) + 'px',
        transform: 'translate3d(' +
          (isRowSelection ? 0 : (marginLeft)) + 'px, ' + 
          (isColumnSelection ? 0 : (marginTop)) + 'px, 0)',
        transformStyle: 'preserve-3d',
        pointerEvents: 'none'
      }}>
      <div className = {"wrapper table-backing table-backing--" + (focused ? "focused" : "blurred") }
        style = {{
          top: 0,
          left: 0,
          right: RIGHT_FRINGE + 'px',
          height: columnOffset + rowCount*geo.rowHeight + 'px',
          // transform: 'translateZ(-2px)'
        }}/>
      <div className = "wrapper overlay "
        style = {{
          top: columnOffset + 'px',
          bottom: 0,
          left: rowOffset + 'px',
          right: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          // transform: 'translateZ(3px)'
        }}>
        <div className = "wrapper force-layer"
          ref = "overlayInner"
          style = {{
            top: 0,
            left:  0,
            right: 0,
            bottom: 0,
            transformStyle: 'preserve-3d',
            transform: 'translate3d(0, ' + (isColumnSelection ? 0 : (marginTop + 2)) + 'px, 0)',
            // marginTop: !HAS_3D ? (marginTop + 2 + 'px') : 0
          }}>
          
          <Overlay
            {...this.props}
            className = {"pointer " + (focused ? " focused" : " ") + 
              (focused ? " " : " gray-out ") +
              (this.props.expanded ? " pointer--expanded " : "")}
            ref = "pointer"
            fudge = {{width: -1, top: 1, height: -1}}
            position = {ptr}
            
            onDoubleClick = {this.props._handleEdit}
            onContextMenu = {this.props._handleContextMenu}
            onWheel = {this.props._handleWheel}>
            {this.getPointerElement()}
            {this.props.context ? <ContextMenu {...this.props}/> : null}
          </Overlay>

          <Overlay
            {...this.props}
            numHiddenCols = {this.props.columnOffset}
            className = {"selection-border selection-border--" + (focused ? "focused" : "blurred")}
            ref = "selectionBorder"
            position = {sel}
            fudge = {{left: -2.25, top: -0.25, height: 2.5, width: 3.5}}>
            <div className = {"selection-drag-box selection-drag-box--" + (focused ? "focused" : "blurred")} />
          </Overlay>

          <Overlay
            {...this.props}
            numHiddenCols = {this.props.columnOffset}
            className = "selection-outer"
            ref = "selectionOuter"
            position = {sel}
            fudge = {{left: -3.75, top: -2.75, height: 7.5, width: 6.5}}>
          </Overlay>
          
          <Overlay
            columns = {view.data.visibleCols}
            numHiddenCols = {this.props.columnOffset}
            rowOffset = {this.props.vOffset}
            className = {" copyarea running marching-ants " + (focused ? " focused" : "")}
            ref = "copyarea"
            {...this.props}
            position = {cpy}
            fudge = {{left: -1.25, top: 0, height: 1, width: 1.25}} />
        </div>
      </div>

      <div className = {"force-layer wrapper underlay"}
        style = {{
          top: columnOffset + 'px',
          bottom: 0,
          left: rowOffset + 'px',
          right: RIGHT_FRINGE + 'px',
          overflow: 'hidden',
          // transform: 'translateZ(-1px)'
        }}>
        <div className = "wrapper underlay-inner force-layer"
          ref = "underlayInner"
          style = {{
            top: 0,
            left:  0,
            right: 0,
            bottom: 0,
            transformStyle: 'preserve-3d',
            transform: 'translate3d(0, ' + (isColumnSelection ? 0 : (marginTop + 2)) + 'px, 0)',
            // marginTop: !HAS_3D ? (marginTop + 2 + 'px') : 0
          }}>

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
