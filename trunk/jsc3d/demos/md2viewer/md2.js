/**
	@preserve Copyright (c) 2012~2014 Humu <humu2009@gmail.com>
	This file is part of the JSC3D project http://code.google.com/p/jsc3d.
	JSC3D is freely distributable under the terms of the MIT license.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
**/


/**
	@namespace JSC3D
*/
var JSC3D = JSC3D || {};


/**
	@class Md2Player

	This class implements an MD2 animated mesh player. It can be used to load and play MD2 animations using the JSC3D.Viewer.
*/
JSC3D.Md2Player = function(viewer) {
	this.viewer = viewer;
	this.timerId = -1;
	this.animId = 0;
};

/**
	Load an MD2 animated model from the given url. A second MD2 model can also be specified to be used as the attachment of the main model.
	@param {String} mainModelUrl the url of the main MD2 model.
	@param {String} mainSkinUrl the url of the texture file for the main model. If the model itself already specified a tuxture file, it will be overwritten by this.
	@param {String} attachmentModelUrl the url of the attaching model.
	@param {String} attachmentSkinUrl the url of the texture file for the attaching model. If the model already specified a tuxture file, it will be overwritten by this.
*/
JSC3D.Md2Player.prototype.replaceSceneFromUrls = function(mainModelUrl, mainSkinUrl, attachmentModelUrl, attachmentSkinUrl) {
	this.pause();

	// uninstall current models with an empty scene
	this.viewer.replaceScene(new JSC3D.Scene);
	this.animId = 0;

	var mainMesh = null;
	var mainTexture = null;
	var attachmentMesh = null;
	var attachmentTexture = null;

	var self = this;

	// load the main MD2 model
	if(mainModelUrl && mainModelUrl != '') {
		var mainModelLoader = new JSC3D.Md2Loader;
		mainModelLoader.onload = function(scene) {
			if(!scene.isEmpty()) {
				mainMesh = scene.getChildren()[0];
				if(mainTexture)
					mainMesh.setTexture(mainTexture);
				self.viewer.replaceScene(scene);
				if(attachmentMesh)
					scene.addChild(attachmentMesh);
				self.play();
			}
		}
		mainModelLoader.onprogress = function(task, progress) {
			self.viewer.reportProgress(task, progress);
		};
		mainModelLoader.loadFromUrl(mainModelUrl);
	}

	// load the attaching MD2 model
	if(attachmentModelUrl && attachmentModelUrl != '') {
		var attachmentModelLoader = new JSC3D.Md2Loader;
		attachmentModelLoader.onload = function(scene) {
			if(!scene.isEmpty()) {
				attachmentMesh = scene.getChildren()[0];
				if(attachmentTexture)
					attachmentMesh.setTexture(attachmentTexture);
				attachmentMesh.init();
				if(mainMesh) {
					self.viewer.getScene().addChild(attachmentMesh);
				}
			}
		};
		attachmentModelLoader.loadFromUrl(attachmentModelUrl);
	}

	// load the main skin
	if(mainSkinUrl && mainSkinUrl != '') {
		var tex = new JSC3D.Texture;
		tex.onready = function() {
			mainTexture = this;
			if(mainMesh)
				mainMesh.setTexture(this);
			self.viewer.update();
		};
		tex.createFromUrl(mainSkinUrl);
	}

	// load skin for the attaching model
	if(attachmentSkinUrl && attachmentSkinUrl != '') {
		var tex = new JSC3D.Texture;
		tex.onready = function() {
			attachmentTexture = this;
			if(attachmentMesh)
				attachmentMesh.setTexture(this);
			self.viewer.update();
		};
		tex.createFromUrl(attachmentSkinUrl);
	}
};

/**
	Start animation or continue the paused animation.
	@param {Number} fps set this parameter to specify the animation speed.
*/
JSC3D.Md2Player.prototype.play = function(fps) {
	if(this.timerId >= 0)
		return;

	var self = this;
	var _animate = function() {
		var scene = self.viewer.getScene();
		if(scene && !scene.isEmpty()) {
			var models = scene.getChildren();
			var min_frame_count = 10000;

			for(var i=0; i<models.length; i++) {
				var model = models[i];
				if(model.metadata && model.metadata.md2) {
					var numOfFrames = model.metadata.md2.frames.length;
					if(numOfFrames < min_frame_count)
						min_frame_count = numOfFrames;
				}
			}

			for(var i=0; i<models.length; i++) {
				var model = models[i];
				if(model.metadata && model.metadata.md2) {
					var frame = model.metadata.md2.frames[self.animId];
					model.vertexBuffer = frame.vertexBuffer.slice(0);
					model.calcFaceNormals();
					model.normalizeFaceNormals();
				}
			}

			self.animId = (self.animId + 1) % min_frame_count;

			self.viewer.update();
		}
	};

	var scene = this.viewer.getScene();
	if(scene && !scene.isEmpty()) {
		this.timerId = setInterval(_animate, fps != undefined ? 1000/fps : 100);
	}
};

/**
	Pause the current animation.
*/
JSC3D.Md2Player.prototype.pause = function() {
	if(this.timerId >= 0) {
		clearInterval(this.timerId);
		this.timerId = -1;
	}
};


/**
	@class Md2Loader

	This class implements an MD2 file loader.
*/
JSC3D.Md2Loader = function(onload, onerror, onprogress, onresource) {
	this.onload = (onload && typeof(onload) == 'function') ? onload : null;
	this.onerror = (onerror && typeof(onerror) == 'function') ? onerror : null;
	this.onprogress = (onprogress && typeof(onprogress) == 'function') ? onprogress : null;
	this.onresource = (onresource && typeof(onresource) == 'function') ? onresource : null;
};

/**
	Load MD2 animated model from a given MD2 file.
	@param {String} urlName a string that specifies where to load the MD2 file.
*/
JSC3D.Md2Loader.prototype.loadFromUrl = function(urlName) {
	var urlPath = '';
	var fileName = urlName;

	var lastSlashAt = urlName.lastIndexOf('/');
	if(lastSlashAt == -1)
		lastSlashAt = urlName.lastIndexOf('\\');
	if(lastSlashAt != -1) {
		urlPath = urlName.substring(0, lastSlashAt+1);
		fileName = urlName.substring(lastSlashAt+1);
	}

	this.loadMd2File(urlPath, fileName);
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.loadMd2File = function(urlPath, fileName) {
	var urlName = urlPath + fileName;
	var self = this;
	var isMSIE = JSC3D.PlatformInfo.browser == 'ie';
	var xhr = new XMLHttpRequest;
	xhr.open('GET', encodeURI(urlName), true);
	if(isMSIE)
		xhr.setRequestHeader("Accept-Charset", "x-user-defined");
	else
		xhr.overrideMimeType('text/plain; charset=x-user-defined');

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				if(self.onload) {
					if(self.onprogress)
						self.onprogress('Loading MD2 file ...', 1);
					if(JSC3D.console)
						JSC3D.console.logInfo('Finished loading MD2 file "' + urlName + '".');
					var scene = new JSC3D.Scene;
					var textureFileName = self.parseMd2(scene, !isMSIE ? this.responseText : JSC3D.Util.ieXHRResponseBodyToString(this.responseBody));
					if(textureFileName != '' && !scene.isEmpty())
						self.setupTexture(scene.getChildren()[0], urlPath + textureFileName);
					self.onload(scene);
				}
			}
			else {
				if(JSC3D.console)
					JSC3D.console.logError('Failed to load MD2 file "' + urlName + '".');
				if(self.onerror) {
					self.onerror('Failed to load MD2 file "' + urlName + '".');
				}
			}
		}
	};

	if(this.onprogress) {
		this.onprogress('Loading MD2 file ...', 0);
		xhr.onprogress = function(event) {
			self.onprogress('Loading MD2 file ...', event.position / event.totalSize);
		};
	}

	xhr.send();
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.parseMd2 = function(scene, data) {
	var reader = new JSC3D.BinaryStream(data);

	// read the MD2 file header
	var header = this.readHeader(reader);
	if(!header)
		return '';

	var mesh = new JSC3D.Mesh;
	var skinFileName = '';

	// read the skin file name. If there are more than 1 skin defined, only the first one will be used.
	if(header.numSkins > 0 && header.numTexCoords > 0) {
		reader.seek(header.offsetSkins);
		skinFileName = this.readSkinFileName(reader);
	}

	// read texture coords of this mesh
	if(header.numTexCoords > 0) {
		reader.seek(header.offsetTexCoords);
		mesh.texCoordBuffer = this.readTextureCoords(reader, header.numTexCoords, header.skinWidth, header.skinHeight);
	}

	// read vertex coord indices and texture coord indices of this mesh
	reader.seek(header.offsetTriangles);
	var triangles = this.readTriangles(reader, header.numTriangles, header.numTexCoords > 0);
	mesh.indexBuffer = triangles.indexBuffer;
	if(header.numTexCoords > 0)
		mesh.texCoordIndexBuffer = triangles.texCoordIndexBuffer;

	// read all animation frames
	reader.seek(header.offsetFrames);
	var frames = this.readFrames(reader, header.numFrames, header.numVertices);
	mesh.vertexBuffer = frames[0].vertexBuffer.slice(0);

	mesh.faceCount = header.numTriangles;

	if(!mesh.isTrivial()) {
		mesh.metadata = {
			md2: {
				frames: frames
			}
		};
		scene.addChild(mesh);
	}

	return skinFileName;
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.readHeader = function(reader) {
	var BYTES_PER_TRIANGLE	= 12;
	var BYTES_PER_TEXCOORD	= 4;
	var BYTES_PER_VERTEX	= 4;
	var BYTES_PER_MIN_FRAME = 40 + BYTES_PER_VERTEX;

	var MD2_HEADER_ELEMENTS = [
		'magic', 
		'version', 
		'skinWidth', 
		'skinHeight', 
		'frameSize', 
		'numSkins', 
		'numVertices', 
		'numTexCoords', 
		'numTriangles', 
		'numGlCommands', 
		'numFrames', 
		'offsetSkins', 
		'offsetTexCoords', 
		'offsetTriangles', 
		'offsetFrames', 
		'offsetGlCommands', 
		'offsetEnd'
	];

	if(reader.size() < MD2_HEADER_ELEMENTS * 4) {
		if(JSC3D.console)
			JSC3D.console.logError('Failed to parse the file. The file is too small.');
		return null;
	}

	var header = {};

	for(var i=0; i<MD2_HEADER_ELEMENTS.length; i++) {
		header[MD2_HEADER_ELEMENTS[i]] = reader.readUInt32();
	}

	if(header.magic != 844121161) {		// "IDP2"
		if(JSC3D.console)
			JSC3D.console.logError('Failed to parse the file. It is not a valid MD2 file.');
		return null;
	}

	if(header.version != 8) {
		if(JSC3D.console)
			JSC3D.console.logWarning('This file version "' + header.version + '" is not expected. Trying to parse it anyway ...');
	}

	if(header.numFrames == 0) {
		if(JSC3D.console)
			JSC3D.console.logError('Failed to parse the file. The number of frames is 0.');
		return null;
	}

	if(header.offsetEnd > reader.size()) {
		if(JSC3D.console)
			JSC3D.console.logError('Failed to parse the file. It seems not complete.');
		return null;
	}

	if( header.offsetTexCoords + header.numTexCoords * BYTES_PER_TEXCOORD >= reader.size() || 
		header.offsetTriangles + header.numTriangles * BYTES_PER_TRIANGLE >= reader.size() || 
		header.offsetFrames + header.numFrames * BYTES_PER_MIN_FRAME >= reader.size() ) {
		if(JSC3D.console)
			JSC3D.console.logError('Failed to parse the file. It has insufficient data.');
		return null;
	}

	return header;
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.readSkinFileName = function(reader) {
	var BYTES_PER_SKIN_NAME = 64;
	return this.readString(reader, BYTES_PER_SKIN_NAME);
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.readTextureCoords = function(reader, numOfTexCoords, skinWidth, skinHeight) {
	var texCoordBuffer = [];
	for(var i=0; i<numOfTexCoords; i++) {
		texCoordBuffer.push(reader.readInt16() / skinWidth);
		texCoordBuffer.push(reader.readInt16() / skinHeight);
	}

	return texCoordBuffer;
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.readTriangles = function(reader, numOfTrangles, hasTexCoords) {
	var triangles = {};
	triangles.indexBuffer = [];
	if(hasTexCoords)
		triangles.texCoordIndexBuffer = [];

	for(var i=0; i<numOfTrangles; i++) {
		triangles.indexBuffer.push(reader.readUInt16());
		triangles.indexBuffer.push(reader.readUInt16());
		triangles.indexBuffer.push(reader.readUInt16());
		triangles.indexBuffer.push(-1);
		if(hasTexCoords) {
			triangles.texCoordIndexBuffer.push(reader.readUInt16());
			triangles.texCoordIndexBuffer.push(reader.readUInt16());
			triangles.texCoordIndexBuffer.push(reader.readUInt16());
			triangles.texCoordIndexBuffer.push(-1);
		}
	}

	return triangles;
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.readFrames = function(reader, numOfFrames, numOfVertices) {
	var BYTES_PER_FRAME_NAME = 16;

	var frames = [];

	for(var i=0; i<numOfFrames; i++) {
		var frame = {};

		// read the scalling
		var sx = reader.readFloat32();
		var sy = reader.readFloat32();
		var sz = reader.readFloat32();
		// read the translation
		var tx = reader.readFloat32();
		var ty = reader.readFloat32();
		var tz = reader.readFloat32();

		// read frame name
		frame.name = this.readString(reader, BYTES_PER_FRAME_NAME);
		frame.vertexBuffer = [];

		// read vertices of this frame
		for(var j=0; j<numOfVertices; j++) {
			var x = reader.readUInt8();
			var y = reader.readUInt8();
			var z = reader.readUInt8();

			frame.vertexBuffer.push(sx * x + tx);
			// change to right-handed coordinate system by flipping z and y components
			frame.vertexBuffer.push(sz * z + tz);
			frame.vertexBuffer.push(sy * y + ty);

			// skip 1-byte's 'vertex normal index' field.
			reader.skip(1);
		}

		frames.push(frame);
	}

	return frames;
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.readString = function(reader, length) {
	var charCodes = new Array(length);
	reader.readBytes(charCodes, length);
	var termAt = charCodes.indexOf(0);
	if(termAt >= 0)
		charCodes.splice(termAt);

	return String.fromCharCode.apply(null, charCodes);
};

/**
	@private
*/
JSC3D.Md2Loader.prototype.setupTexture = function(mesh, textureUrlName) {
	var self = this;
	var texture = new JSC3D.Texture;

	texture.onready = function() {
		mesh.setTexture(this);
		if(self.onresource) {
			self.onresource(this);
		}
	};

	texture.createFromUrl(textureUrlName);
};

JSC3D.LoaderSelector.registerLoader('md2', JSC3D.Md2Loader);
