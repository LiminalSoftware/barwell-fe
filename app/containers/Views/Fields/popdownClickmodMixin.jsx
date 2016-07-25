import React from "react"
import _ from 'underscore'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import util from '../../../util/util';
import PopDownMenu from '../../../components/PopDownMenu'
import constant from "../../../constants/MetasheetConstants"

var popdownClickmodMixin = {

	handleInnerMouseDown: function (e) {
		if (this.blurChildren) this.blurChildren()
		util.clickTrap(e)
	},

	render: function () {
	    const iconClass = this.getIcon();
	    const isActive = this.isActive ? this.isActive() : false;
	    
	    const menuWidth = this.menuWidth || '250px';
	    const headWidth = '28px';

	    const popstyle = this.props.direction === 'left' ? 
	    	{right: '-15px', width: menuWidth} : 
	    	{left: '-15px', marginLeft: '0', width: menuWidth}

	    const overlayStyle  = this.props.direction === 'left' ?
	    	{right: '15px', minWidth: headWidth} : 
	    	{left: '15px', minWidth: headWidth}

	    
	    const style = _.extend({}, this.props.style, {minWidth: headWidth})
	    

	   return <span 
	   		className={"pop-down pop-stop clickable " + (this.props.classes || '') + (isActive ? ' popdown-active' : '')}
	    	style={style} onMouseDown={this.handleOpen}>

	    	<span className={iconClass}
	    		style={{textAlign: 'center', marginRight: 0}}/>

	    	{this.getContent ? 
	    	<span className="popdown-label">
    			{this.getContent()}
    		</span> : null
	    	}
	    	
	        {
	        // <ReactCSSTransitionGroup {...constant.transitions.slideIn}>
	        	this.state.open ? 
	        	<div key="popdown" className = "pop-down-menu"  style = {popstyle} 
	        		onMouseDown = {this.handleInnerMouseDown}>

	        		<span className = "pop-down-overlay" style = {overlayStyle}>
	        			<span className = {iconClass} style={{textAlign: 'center', marginRight: 0}}/>
        				{
			    		this.getContent ? 
			    		<span className="popdown-label">
			    			{this.getContent()}
			    		</span> 
			    		: null
		    			}
        			</span>
	        		{this.renderMenu()}
	        	</div> : null
	        // </ReactCSSTransitionGroup>
	        }
	        
	    </span>;
	  }
}

export default popdownClickmodMixin;