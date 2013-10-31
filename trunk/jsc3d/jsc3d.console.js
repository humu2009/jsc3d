/**
 * @preserve Copyright (c) 2011~2013 Humu <humu2009@gmail.com>
 * This file is part of jsc3d project, which is freely distributable under the 
 * terms of the MIT license.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


/**
	@namespace JSC3D
 */
var JSC3D = JSC3D || {};


/**
	The console instance where to display debugging informations. 
	Based upon code originally provided by X3DOM project, under the MIT license.
*/
JSC3D.console = (function() {
	var _container = null;
	var _isActive = false;

	var _icons = {
		info:	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAj0lEQVQ4jc2SMRKEIAxFUzokZ7Ky8hjW3kQ+VpQWHs/IHdxqZ2eJIp1mJlV4j5BA9LpQuD6B1xTk+EvwqnB9GQ4yGjBLDTJe35wd/taM5KyTBF5qBQm8WMFN61fyoqCm9iKBeonVW/ASjWCbuKsd4DZxZwRERAo33H4kuOEU/j2laXfwnIM7eFbftEX4kfgAqhIisuNA6JsAAAAASUVORK5CYII=', 
		warn:	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAgElEQVQ4jWNgGNTgTQ9XwJsergCyNL/u5Vn/po/n/5s+nv+ve3nWk6T5VR+3B0wzDL/q4/Yg2fb7DQwC9xsYBEhyBbLtMDGSXIHsd2QXEOWK1908Duh+R8evu3kccBqArpiQOEHb0b2A1xWEnE7QFa/7uM8Sq/l1H/dZvIE5tAAANzDIfYoSrJQAAAAASUVORK5CYII=', 
		error:	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAo0lEQVQ4jc2RPQ6DMAyFPSLsMzExcQqUmZsQh4mRgeNhcod2Ka1LfppOYMlDJL/vPTsAtyvhuvOMq3f0+GrGVbju8mJHQyA8tTga0s4/xG9ILIlnXNSAAQA43i8Do9ZZQoByUKnMAUvNRAE6ReBeDsD+A8D+L4AWalAWIJbm0iOKpTkAbCO2pd+4jdgGgNSxcseNQ2zV7IzTWbgzTmKrJiu+pJ5VHxECVZ0hewAAAABJRU5ErkJggg=='
	};

	function _setup(parentElement, height, activate) {
		var parent = (typeof(parentElement) == 'string') ? document.getElementById(parentElement) : parentElement;
		if(!parent)
			return;

		_container = document.createElement('div');
		_container.id = 'jsc3d_console';
		_container.style.border = '2px solid olivedrab';
		_container.style.height = (height != undefined) ? height : '150px';
		_container.style.padding = '4px';
		_container.style.overflow = 'auto';
		_container.style.whiteSpace = 'pre-wrap';
		_container.style.fontFamily = 'sans-serif'; 
		_container.style.fontSize = 'small';
		_container.style.color = '#00ff00';
		_container.style.backgroundColor = 'black';
		_container.style.clear = 'both';

		parent.appendChild(_container);

		_isActive = (activate != undefined) ? activate : true;
	}

	function _activate(isActive) {
		_isActive = (isActive != undefined) ? isActive : true;
	}

	function _logInfo(msg) {
		_doLogMessage(msg, 'info');
	}

	function _logWarning(msg) {
		_doLogMessage(msg, 'warn');
	}

	function _logError(msg) {
		_doLogMessage(msg, 'error');
	}

	function _doLogMessage(msg, type) {
		if(!_isActive) {
			return false;
		}

		if(_container) {
			var newLine = document.createElement('p');
			newLine.style.margin = '0px';
			//newLine.style.height = '16px';
			newLine.style.clear = 'both';
			
			switch(type) {
			case 'info':
				newLine.innerHTML = '<img src=' + _icons.info + ' style="float:left;">'  + msg;
				break;
			case 'warn':
				newLine.innerHTML = '<img src=' + _icons.warn + ' style="float:left;">' + msg;
				break;
			case 'error':
				newLine.style.color = '#ff0000';
				newLine.innerHTML = '<img src=' + _icons.error + ' style="float:left;">' + msg;
				break;
			default:
				break;		
			}

			_container.appendChild(newLine);
			newLine.scrollIntoView(true);
		}
		else if(window['console']) {
			switch(type) {
			case 'info':
				console.info(msg);
				break;
			case 'warn':
				console.warn(msg);
				break;
			case 'error':
				console.error(msg);
				break;
			default:
				break;			
			}
		}
	}

	function _clear() {
		if(_isActive && _container != null) {
			while(_container.lastChild) {
				_container.removeChild(_container.lastChild);
			}
		}
	}

	return {
		setup:		_setup, 
		activate:	_activate, 
		logInfo:	_logInfo, 
		logWarning:	_logWarning, 
		logError:	_logError, 
		clear:		_clear
	};
}) ();
