import React from 'react'

const dummyStyle = {
	position: 'absolute',
	left: 0,
	top: 0,
	height: '1px',
	width: '1px'
}

export default () =>
  <textarea style = {dummyStyle} id = "copy-paste-dummy" value=""></textarea>
