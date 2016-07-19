import React from "react"
import _ from 'underscore'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import util from '../../../util/util';
import PopDownMenu from '../../../components/PopDownMenu'

var popdownClickmodMixin = {

	handleClick: function (e) {
		if (this.props._blurSiblings) this.props._blurSiblings();
		if (this.props._showPopUp) this.props._showPopUp(e);
		else this.handleOpen(e);
		util.clickTrap(e)
	},

	render: function () {
	    var iconClass = this.getIcon();
	    var width = '28px';
	    var isActive = this.isActive ? this.isActive() : false;
	    var style = _.extend({}, this.props.style, {width: width, minWidth: width})
	    var menuWidth = this.menuWidth || '250px';

	   return <span 
	   		className={"pop-down pop-stop clickable " + (this.classes || '') + (isActive ? ' popdown-active' : '')}
	    	style={style} onClick={this.handleClick}>

	    	<span className={iconClass}
	    		style={{textAlign: 'center', marginRight: 0}}/>

	    	{this.getContent ? <span className="popdown-label">
	    			{this.getContent()}
	    		</span> : null
	    	}

	    	
	        {
	        	(this.state.open) ? <div className = "pop-down-menu" 
	        	style = {{left: '-15px', width: menuWidth}} onMouseDown = {util.clickTrap}>
	        	<span className = "pop-down-overlay" style = {{minWidth: width, width: width}}>
	        		<span className = {iconClass} style={{textAlign: 'center', marginRight: 0}}/>
	        		{
			    		this.getContent ? 
			    		<span className="popdown-label">{this.getContent()}</span> 
			    		: null
			    	}
	        	</span>
	        	{this.renderMenu()}
	        	</div> : null
	        }
	        
	        
	    </span>;
	  }
}

export default popdownClickmodMixin;