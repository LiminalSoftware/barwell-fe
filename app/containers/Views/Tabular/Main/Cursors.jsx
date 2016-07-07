import React from "react"
import fieldTypes from "../../fields"
import _ from "underscore"
import modelActionCreators from "../../../../actions/modelActionCreators"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import Overlay from './Overlay'
import ContextMenu from './ContextMenu'

import PopDownMenu from '../../../../components/PopDownMenu'
import util from '../../../../util/util'

var HAS_3D = util.has3d()
var RIGHT_FRINGE = '200px'

var Cursors = React.createClass ({

  getPointerElement: function () {
    var view = this.props.view;
    var model = this.props.model;
    var geo = view.data.geometry;
    var store = this.props.store;
    var ptr = this.props.pointer;
    var col = view.data.visibleCols[ptr.left];
    var obj = store.getObject(ptr.top);
    var element = col ? (fieldTypes[col.type]).element : null;
    var selector = {};
    
    if (!obj) return ;

    if (model._pk in obj) selector[model._pk] = obj[model._pk];
    else selector.cid = obj.cid;
    
    if (element) return React.createElement(element, {
      config: col,
      model: model,
      view: view,

      selected: true,
      recordPatch: true,

      spaceTop: ptr.top - this.props.rowOffset,
      spaceBottom: this.props.visibleRows + this.props.rowOffset - ptr.top,

      selector: selector,
      object: obj,
      pointer: ptr,
      rowHeight: geo.rowHeight,

      value: obj[col.column_id],
      column_id: ('a' + (col.attribute_id || col.cid)),

      _handleBlur: this.props._handleBlur,
      
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
    var viewconfig = this.props.viewconfig || {};
    var model = this.props.model
    var store = this.props.store
    var rowCount = store.getRecordCount()
    var geo = view.data.geometry
    var focused = this.props.focused
    
    var rowsSelected = Object.keys(store.getSelection()).length > 0;

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
    var showJaggedEdge = ((sel.right >= view.data.fixedCols.length)
      && (sel.left < view.data.fixedCols.length + this.props.columnOffset) && (this.props.columnOffset > 0));

    var detailColumn = view.data.visibleCols[ptr.left]
    var detailObject = store.getObject(ptr.top)

    var singleton = sel.top === sel.bottom && sel.left === sel.right;

    var hideCursor = (rowsSelected || rowCount === 0);

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

    return <div className = {"wrapper cursor-wrapper " + (focused ? ' ' : ' cursor-wrapper--blurred')} 
      style = {{
        left: 0,
        top: '1px',
        bottom: 0,
        width: (adjustedWidth + RIGHT_FRINGE) + 'px',
        transformStyle: 'preserve-3d',
        pointerEvents: 'none'
      }}
      // onMouseDown = {this.props._handleClick}
      onDoubleClick = {this.props._handleEdit}
      onContextMenu = {this.props._handleContextMenu}
      onWheel = {this.props._handleWheel}
      >
      <div className = "wrapper overlay "
        style = {{
          top: geo.headerHeight - 1 - 2 + 'px',
          bottom: 0,
          left: geo.leftGutter + 'px',
          width: (fixedWidth + floatWidth + geo.labelWidth + RIGHT_FRINGE) + 'px',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          transform: 'translateZ(10px)',
          zIndex: 10
        }}>
        <div className = "wrapper force-layer"
          ref = "overlayInner"
          style = {style}>

          <Overlay
                {...this.props}
                ref = "addNew"
                position = {{left: 0, right: view.data.visibleCols.length + view.data.fixedCols.length, 
                  top: rowCount, bottom: rowCount}}
                fudge = {{left: -1, width: 1}}
                className = {"add-new-row add-new-row--" + (focused ? "focused " : "blurred ")}>
              <div className = "table-cell-inner" style={{cursor: 'pointer', lineHeight: (geo.rowHeight + 'px')}} 
                onClick = {this.props._addRecord}>
                <span className = "small icon icon-plus"></span>
                <span>Add new record</span>
              </div>
          </Overlay>

          
          {hideCursor ? null :
          <Overlay
            {...this.props}
            className = {"pointer " + (focused ? " focused" : " ") + 
              (focused ? " " : " gray-out ") +
              (this.props.expanded ? " pointer--expanded " : "")}
            ref = "pointer"
            fudge = {pointerFudge}
            position = {ptr}>
            {this.getPointerElement()}
            <ReactCSSTransitionGroup
              transitionEnterTimeout={500}
              transitionLeaveTimeout={300} 
              transitionName="none" 
              component = "div">
            {this.props.context ? <ContextMenu key="context" {...this.props}/> : null}
            </ReactCSSTransitionGroup>
          </Overlay>
          }

          {hideCursor ? null :
          <Overlay
            {...this.props}
            className = {"selection-border selection-border--" + (focused ? "focused" : "blurred")}
            ref = "selectionBorder"
            position = {sel}
            fudge = {{left: -2.25, top: -0.25, height: 2.5, width: 3.5}}>
            <div className = {"selection-drag-box selection-drag-box--" + (focused ? "focused" : "blurred")} />
          </Overlay>
          }

          {hideCursor ? null :
          <Overlay
            {...this.props}
            className = {"selection-outer" + (singleton ? '-singleton' : '')}
            ref = "selectionOuter"
            position = {sel}
            fudge = {{left: -3.75, top: -2.75, height: 7.5, width: 6.75}}>
          </Overlay>
          }
          
          {
          !hideCursor && showJaggedEdge ? 
          <Overlay
            {...this.props}
            className = " jagged-edge "
            ref = "jaggedEdge"
            showHiddenHack = {true}
            position = {{
              left: view.data.fixedCols.length,
              width: '10px',
              top: sel.top,
              bottom: sel.bottom
            }}
            fudge = {{
              left: (sel.left >= view.data.fixedCols.length) ? -6 : -4, 
              width: 10 
            }} />
          : null}

          <Overlay
            columns = {view.data.visibleCols}
            numHiddenCols = {this.props.columnOffset}
            rowOffset = {this.props.rowOffset}
            className = {" copyarea running marching-ants " + (focused ? " focused" : "")}
            ref = "copyarea"
            {...this.props}
            position = {cpy}
            fudge = {{left: -1.25, top: 0, height: 1, width: 1.25}}/>
        </div>
      </div>

      

    </div>
  }
});

// <Overlay
//                 numHiddenCols = {this.props.columnOffset}
//             className = {" selection " + (focused ? " focused" : "")}
//             ref = "selection"
//             {...this.props}
//             position = {sel}
//             fudge = {{left: -4.75, top: -2.75, height: 7.5, width: 8.5}}/>


export default Cursors
