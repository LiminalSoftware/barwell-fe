import React, { Component, PropTypes } from 'react'
import ReactDOM from "react-dom"
import $ from "jquery"
import _ from 'underscore'

import FocusStore from "../../../../stores/FocusStore"
import fieldTypes from "../../../fields"
import modelActionCreators from "../../../../actions/modelActionCreators"
import constant from "../../../../constants/MetasheetConstants"

import ColumnAdder from "../../../../components/ColumnAdder"
import TypePicker from "./TypePicker"

import util from "../../../../util/util"

const MIN_ATTRIBUTE_MENU_WIDTH = 220;

export default class AttributeContext extends Component {

  constructor (props) {
    super(props)
    this.state = {
      drawer: null,
      fullyOpen: false
    }
  }

  componentDidMount () {
    const _this = this
    setTimeout(e => _this.setState({fullyOpen: true}), 0)
  }


  /*
   * 
   */

  _onChange = () => {

  }

  /*
   * 
   */

  getTotalWidth = () => {
    const col = this.props.column
    return Math.max(
        col.width - 1, 
        MIN_ATTRIBUTE_MENU_WIDTH
    )
  }

  getDrawerStyle = () => {
    return {
      position: "absolute", 
      left: "100%", 
      width: "200px", 
      top: 0, 
      bottom :0, 
      marginTop: "-1px",
      marginRight: "-1px",
      marginBottom: "-1px",
      border: "1px solid steelblue",
      background: "white",
      zIndex: -1,
      marginLeft: this.state.drawer ? "0" : "-200px",
      transition: "margin cubic-bezier(.16,.85,.5, 1) 150ms",
      overflowY: "auto"
    }
  }

  handleChooseType = (type) => {
    this.setState({type: type})
  }

  getDrawerContent = () => {
    if (this.state.drawer === 'type') 
      return <TypePicker {...this.props} handleChooseType={this.handleChooseType}/>
  }
  
  getStyle = () => {
    const geo = this.props.view.data.geometry
    
    return {
      top: geo.headerHeight - 1 + "px",
      left: "-1px",
      minWidth: this.getTotalWidth() + "px",
      background: "white",
      border: "1px solid steelblue",
      boxShadow: "0 0 0 2px white",
      zIndex: 1,
      // opacity: this.state.fullyOpen ? "1" : "0.05",
      maxHeight: this.state.fullyOpen ? "500px" : "1px",
      transition: "max-height cubic-bezier(.16,.85,.5, 1) 150ms",
    }
  }

  handleSetSort = (direction) => {
    console.log('set sort direction: ' + direction)
  }

  getInnerMainStyle = () => {
    return {
      maxWidth: this.getTotalWidth() - (this.state.typePicker ? MIN_ATTRIBUTE_MENU_WIDTH : 0) + "px"
    }
  }

  /*
   * 
   */
  render = () => {
    const _this = this
    const view = this.props.view
    const config = this.props.column
    const type = fieldTypes[config.type]
    const sortDirection = this.props.sorting ?
      this.props.sortDirection ? 
      'asc' : 'desc' : 'none'

    return <div className="th-context"
			onClick = {util.clickTrap}
			style = {this.getStyle()}>

        <div className = "drawer" style = {this.getDrawerStyle()}>
          {this.getDrawerContent()}
        </div>
        
        
          <div className = "menu-item menu-sub-item menu-header">
            <span>Attribute Type:</span>
            <span className="pill" onClick={e => _this.setState({drawer: "type"})}>
              <span className = {`icon icon-${type.icon}`}/>
              {type.description}
            </span>
          </div>
          
          <div className = "menu-item menu-sub-item menu-header">
            <span className="bold">
              Sorting:
            </span>
            <span className={sortDirection === "asc" ? "pill-selected" : "pill"}>
              <span className = {`icon icon-${type.sortIcon}asc`}
                onClick={this.handleSetSort.bind(this, 'asc')}/>
                Asc
            </span>
            <span className={sortDirection === "desc" ? "pill-selected" : "pill"}>
              <span className = {`icon icon-${type.sortIcon}desc`}
                onClick={this.handleSetSort.bind(this, 'desc')}/>
                Desc
            </span>
            <span style={{maxWidth: "20px"}}>
              <span className="icon icon-cross"/>
            </span>
          </div>
    			
          
          <div className = "menu-item menu-sub-item">
    				<span className="icon icon-eye-crossed"></span>
            Hide this column
          </div>
          <div className="menu-item menu-sub-item">
            {(type.configParts || []).map((part) => {
              React.createElement(part, {
                view: this.props.view,
                model: this.props.model,
                config: config,
                key: part.prototype.partName,
                ref: part.prototype.partName,
                direction: "left"
              })
            })}
          </div>
    			<div className = "menu-item menu-sub-item">
    				<span className="icon icon-trash2"></span>
            Delete this attribute
          </div>
        
    </div>
  }
}