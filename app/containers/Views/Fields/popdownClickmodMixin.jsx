import React from "react"
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
	    var width = (this.width || '30px');
	    var isActive = this.isActive ? this.isActive() : false;

	   return <span className={"pop-down clickable " + (isActive ? ' popdown-active' : '')}
	    	style={this.props.style}
	        onClick = {this.handleClick}>
	    	<span className = {iconClass} style={{textAlign: 'center', marginRight: 0}}/>
	    	{
	    		this.getContent ? <span className="popdown-label">{this.getContent()}</span> : null
	    	}
	    	<ReactCSSTransitionGroup
				transitionEnterTimeout={500}
				transitionLeaveTimeout={300}
				transitionName="fade-in">
	        {
	        	(this.state.open || this.props.open) ? <div className = "pop-down-menu" style = {{left: '-15px'}}>
	        	<span className = "pop-down-overlay">
	        		<span className = {iconClass} style={{textAlign: 'center', marginRight: 0}}/>
	        		{
			    		this.getContent ? <span className="popdown-label">{this.getContent()}</span> : null
			    	}
	        	</span>
	        	{this.renderMenu()}
	        	</div> : null
	        }
	        </ReactCSSTransitionGroup>
	        
	    </span>;
	  }
}

export default popdownClickmodMixin;