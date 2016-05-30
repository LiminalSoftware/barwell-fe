import React from "react"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import util from '../../../util/util';
import PopDownMenu from '../../../components/PopDownMenu'

var popdownClickmodMixin = {
	handleClick: function (e) {
		if (this.props._blurSiblings) this.props._blurSiblings();
		if (this.props._handleConfigClick) {
			this.props._handleConfigClick(e);
			this.setState({context: true})
		} else this.handleOpen(e);
	},

	render: function () {
	    var iconClass = this.getIcon();
	    if (!!this.props.menuInline) return <div className = "menu-sub-item-boxed"  onClick = {util.clickTrap}>
	      {this.renderMenu()}
	    </div>;
	    else return <span className={"pop-down clickable "}
	        onClick = {this.handleClick}>
	    	<span className = {iconClass} style={{width: '30px', textAlign: 'center', marginRight: 0}}/>
	    	{
	    		this.getContent ? <span className="popdown-label">{this.getContent()}</span> : null
	    	}
	    	<ReactCSSTransitionGroup
				transitionEnterTimeout={500}
				transitionLeaveTimeout={300} 
				transitionName="fade-in">
	        {
	          this.state.open ? <PopDownMenu>
	          {this.renderMenu()}
	        </PopDownMenu> : null
	        }
	        </ReactCSSTransitionGroup>
	        {
	          this.state.context ? 
	            <span className = {"pop-down-overlay "}>
	            <span className = {iconClass} style = {{margin: 0}}/>{
	            	this.getContent ? <span className="popdown-label">{this.getContent()}</span> : null
	            }</span>
	            : null
	        }
	    </span>;
	  }
}

export default popdownClickmodMixin;