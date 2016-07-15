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
	},

	render: function () {
	    var iconClass = this.getIcon();
	    var width = (this.width || '28px');
	    var isActive = this.isActive ? this.isActive() : false;
	    var style = _.extend({}, this.props.style, {width: width, minWidth: width})

	   return <span 
	   		className={"pop-down clickable " + (isActive ? ' popdown-active' : '')}
	    	style={style}
	        onMouseDown={this.handleClick}>

	    	<span className={iconClass} 
	    		style={{textAlign: 'center', marginRight: 0}}/>

	    	{this.getContent ? <span className="popdown-label">
	    			{this.getContent()}
	    		</span> : null
	    	}

	    	
	        {
	        	(this.state.open || this.props.open) ? <div className = "pop-down-menu split-menu" 
	        	style = {{left: '-15px'}}>
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