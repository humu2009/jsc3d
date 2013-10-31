/**
 * @preserve Copyright (c) 2013 Vasile Dirla <vasile@dirla.ro>
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
	@class Autodesk3DSLoader

	This class implements a scene loader from an 3DS file.
 */
JSC3D.Autodesk3DSLoader = function(onload, onerror, onprogress, onresource) {
	this.onload = (onload && typeof(onload) == 'function') ? onload : null;
	this.onerror = (onerror && typeof(onerror) == 'function') ? onerror : null;
	this.onprogress = (onprogress && typeof(onprogress) == 'function') ? onprogress : null;
	this.onresource = (onresource && typeof(onresource) == 'function') ? onresource : null;
	this.request = null;

	this._materials = {};
	this._unfinalized_objects = {};
	this._textures={};

	this._cur_obj_end = 0;
	this._cur_obj;

	this._cur_mat_end = 0;
	this._cur_mat;

	this.totalFaces = 0;
};

/**
 Load scene from a given 3DS file.
 @param {String} urlName a string that specifies where to fetch the 3DS file.
 */
JSC3D.Autodesk3DSLoader.prototype.loadFromUrl = function(urlName) {
	var self = this;
	var xhr = new XMLHttpRequest;
	xhr.open('GET', urlName, true);
	if(JSC3D.PlatformInfo.browser == 'ie' && JSC3D.PlatformInfo.version >= '10')
		xhr.responseType = 'blob';	// use blob method to deal with 3DS files for IE >= 10
	else{
		xhr.overrideMimeType('text/plain; charset=x-user-defined');
//		xhr.responseType = "arraybuffer";
	}

	xhr.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200 || this.status == 0) {
				if(JSC3D.console)
					JSC3D.console.logInfo('Finished loading 3DS file "' + urlName + '".');
				if(self.onload) {
					if(self.onprogress)
						self.onprogress('Loading 3DS file ...', 1);
					if(JSC3D.PlatformInfo.browser == 'ie' && JSC3D.PlatformInfo.version >= '10') {
						// asynchronously decode blob to binary string
						var blobReader = new FileReader;
						blobReader.onload = function(event) {
							var scene = new JSC3D.Scene;
							self.parse3DS(scene, event.target.result);
							self.onload(scene);
						};
						blobReader.readAsText(this.response, 'x-user-defined');
					}
					else {
						var scene = new JSC3D.Scene;
						self.parse3DS(scene, this.responseText);
						self.onload(scene);
					}
				}
			}
			else {
				if(JSC3D.console)
					JSC3D.console.logError('Failed to load 3DS file "' + urlName + '".');
				if(self.onerror)
					self.onerror('Failed to load 3DS file "' + urlName + '".');
			}
			self.request = null;
		}
	};

	if(this.onprogress) {
		this.onprogress('Loading 3DS file ...', 0);
		xhr.onprogress = function(event) {
			self.onprogress('Loading 3DS file ...', event.loaded / event.total);
		};
	}

	this.request = xhr;
	xhr.send();
};

/**
	Abort current loading if it is not finished yet.
 */
JSC3D.Autodesk3DSLoader.prototype.abort = function() {
	if(this.request) {
		this.request.abort();
		this.request = null;
	}
};

JSC3D.Autodesk3DSLoader.prototype.parseMaterial= function (reader, endMaterial) {
	var mat = {};

	while (reader.tell() < endMaterial) {
		var cid ;
		var len;
		var end;

		cid = reader.readUInt16();
		len = reader.readUInt32();
		end = reader.tell() + (len-6);

		switch (cid) {
			case 0xA000: // Material name
				mat.name = this.readNulTermString(reader);
				break;

			case 0xA010: // Ambient color
				mat.ambientColor = this.readColor(reader);
				break;

			case 0xA020: // Diffuse color
				mat.diffuseColor = this.readColor(reader);
				break;

			case 0xA030: // Specular color
				mat.specularColor = this.readColor(reader);
				break;

			case 0xA050: // transparency
				mat.transparency = this.readAmount(reader,end);
			  break;

			case 0xA081: // Two-sided, existence indicates "true"
				mat.twoSided = true;
				break;

			case 0xA200: // Main (color) texture
				mat.colorMap = this.parseTexture(reader,end);
				break;

			case 0xA204: // Specular map
				mat.specularMap = this.parseTexture(reader,end);
				break;

			default:
				reader.seek(end);
				break;
		}
	}

	return mat;
};

JSC3D.Autodesk3DSLoader.prototype.readAmount = function(reader,end) {
	var cid;
	var len;
	var amount = 0;
	cid = reader.readUInt16();
	len = reader.readUInt32();

	switch (cid) {
		case 0x0030: // Floats
			amount = reader.readUInt16();
			break;
		default:
			break;
	}

	reader.seek(end);
	return amount;
};

JSC3D.Autodesk3DSLoader.prototype.readColor = function(reader) {
	var cid;
	var len;
	var r, g, b;

	cid = reader.readUInt16();
	len = reader.readUInt32();

	switch (cid) {
		case 0x0010: // Floats
			r = reader.readFloat32() * 255;
			g = reader.readFloat32() * 255;
			b = reader.readFloat32() * 255;
			break;
		case 0x0011: // 24-bit color
			r = reader.readUInt8();
			g = reader.readUInt8();
			b = reader.readUInt8();
			break;
		default:
			reader.skip(len-6);
			break;
	}

	return (r<<16) | (g<<8) | b;
};

JSC3D.Autodesk3DSLoader.prototype.parseTexture = function(reader, endTexture) {
	var tex ={};

	while (reader.tell() < endTexture) {
		var cid;
		var len;

		cid = reader.readUInt16();
		len = reader.readUInt32();

		switch (cid) {
			case 0xA300:
				tex.url = this.readNulTermString(reader);
				break;
			default:
				// Skip this unknown texture sub-chunk
				reader.skip(len-6);
				break;
		}
	}

	this._textures[tex.url] = tex;
	//TODO: vasea
   // this.addDependency(tex.url);

	return tex;
};

JSC3D.Autodesk3DSLoader.prototype.readNulTermString= function (reader) {
	var chr;
	var str = '';

	while ((chr = reader.readUInt8()) > 0) {
		str += String.fromCharCode(chr);
	}

	return str;
};

JSC3D.Autodesk3DSLoader.prototype.parseVertexList = function (reader) {
	var i;
	var len;
	var count;

	count = reader.readUInt16();
	this._cur_obj.verts = new Array(count*3);

	i = 0;
	len = this._cur_obj.verts.length;
	while (i<len) {
		var x, y, z;

		x = reader.readFloat32();
		y = reader.readFloat32();
		z = reader.readFloat32();

		this._cur_obj.verts[i++] = x;
		this._cur_obj.verts[i++] = z;
		this._cur_obj.verts[i++] = -y;
	}
};


JSC3D.Autodesk3DSLoader.prototype.parseFaceList = function (reader) {
	var i;
	var len;
	var count;

	count = reader.readUInt16();
	this._cur_obj.facesCount = count;
	this._cur_obj.indices = [];
	this._cur_obj.uvsIndexes = [];


	i = 0;
	len = count*3;
	while (i < len) {
		var i0, i1, i2;

		i0 = reader.readUInt16();
		i1 = reader.readUInt16();
		i2 = reader.readUInt16();
		i+=3;
		this._cur_obj.indices.push(i0);
		this._cur_obj.indices.push(i2);
		this._cur_obj.indices.push(i1);
		this._cur_obj.indices.push(-1);

		this._cur_obj.uvsIndexes.push(i0);
		this._cur_obj.uvsIndexes.push(i2);
		this._cur_obj.uvsIndexes.push(i1);
		this._cur_obj.uvsIndexes.push(-1);


		// Skip "face info", irrelevant data
		reader.skip(2);
	}

	this._cur_obj.smoothingGroups = [];
	for ( index = 0 ; index <this._cur_obj.facesCount;index++){
		this._cur_obj.smoothingGroups[index] = 0;
	}
};



JSC3D.Autodesk3DSLoader.prototype.parseUVList = function (reader) {
	var i;
	var len;
	var count;

	count = reader.readUInt16();
	this._cur_obj.uvs = [];


	i = 0;
	len = count;

	while (i < len) {
		this._cur_obj.uvs.push(reader.readFloat32());
		this._cur_obj.uvs.push(1.0 - reader.readFloat32());
		i+=1;
	}
};


JSC3D.Autodesk3DSLoader.prototype.parseFaceMaterialList = function (reader) {
	var mat;
	var count;
	var i;
	var faces = [];

	mat = this.readNulTermString(reader);
	count = reader.readUInt16();
	for (var index = 0 ; index < count;index++){
		faces[index] = 0;
	}

	i = 0;
	while (i<faces.length) {
		faces[i++] = reader.readUInt16();
	}

	this._cur_obj.materials.push(mat);
	this._cur_obj.materialFaces[mat] = faces;
};


JSC3D.Autodesk3DSLoader.prototype.readTransform = function (reader) {
	var data =[];
	for (var index = 0 ; index < 16;index++){
		data[index] = 0;
	}


	// X axis
	data[0] = reader.readFloat32(); // X
	data[2] = reader.readFloat32(); // Z
	data[1] = reader.readFloat32(); // Y
	data[3] = 0;

	// Z axis
	data[8] = reader.readFloat32(); // X
	data[10] = reader.readFloat32(); // Z
	data[9] = reader.readFloat32(); // Y
	data[11] = 0;

	// Y Axis
	data[4] = reader.readFloat32(); // X
	data[6] = reader.readFloat32(); // Z
	data[5] = reader.readFloat32(); // Y
	data[7] = 0;

	// Translation
	data[12] = reader.readFloat32(); // X
	data[14] = reader.readFloat32(); // Z
	data[13] = reader.readFloat32(); // Y
	data[15] = 1;

	return data;
};

JSC3D.Autodesk3DSLoader.prototype.parseObjectAnimation = function (reader,end) {
	var vo;
	var obj;
	var pivot;
	var name;
	var hier;

	// Pivot defaults to origin
	pivot = {};

	while (reader.tell() < end) {
		var cid;
		var len;

		cid = reader.readUInt16();
		len = reader.readUInt32();

		switch (cid) {
			case 0xb010: // Name/hierarchy
				name = this.readNulTermString(reader);
				reader.skip(4);
				hier = reader.readInt16();
				break;

			case 0xb013: // Pivot
				pivot.x = reader.readFloat32();
				pivot.z = reader.readFloat32();
				pivot.y = reader.readFloat32();
				break;

			default:
				reader.skip(len-6);
				break;
		}
	}

	// If name is "$$$DUMMY" this is an empty object (e.g. a container)
	// and will be ignored in this version of the parser
	// TODO: Implement containers in 3DS parser.
	if (name != '$$$DUMMY' && this._unfinalized_objects.hasOwnProperty(name)) {
		vo = this._unfinalized_objects[name];
//		todo vasea
		if(JSC3D.console)
			JSC3D.console.logInfo('Construct object '+vo.name);
//		this._cur_obj = null;
		obj = null;//this.constructObject(vo, pivot);

		if (obj) {
			if(JSC3D.console)
				JSC3D.console.logInfo('finished loading the object '+vo.name);
		}

		delete this._unfinalized_objects[name];
	}
};


JSC3D.Autodesk3DSLoader.prototype.parseSmoothingGroups = function (reader) {
	var len = this._cur_obj.facesCount;
	var i = 0;
	while (i < len) {
		this._cur_obj.smoothingGroups[i] = reader.readUInt32();
		i++;
	}
};


JSC3D.Autodesk3DSLoader.prototype.finalizeCurrentMaterial = function () {
	var mat = new JSC3D.Material;

	if (this._cur_mat.colorMap) {
		mat.textureFileName = this._cur_mat.colorMap.texture;
	}
	else {
		mat.diffuseColor = this._cur_mat.diffuseColor;
	}

	mat.ambientColor = this._cur_mat.ambientColor;
	mat.specularColor = this._cur_mat.specularColor;
	mat.bothSides = this._cur_mat.twoSided;

	this._materials[this._cur_mat.name] = this._cur_mat;
	this._cur_mat.material = mat;

	this._cur_mat = null;
};

/**
 Asynchronously load a texture from a given url and set it to corresponding meshes when done.
 @private
 */
JSC3D.Autodesk3DSLoader.prototype.setupTexture = function(meshList, textureUrlName) {
	var self = this;
	var texture = new JSC3D.Texture;

	texture.onready = function() {
		for(var i=0; i<meshList.length; i++)
			meshList[i].setTexture(this);
		if(self.onresource)
			self.onresource(this);
	};

	texture.createFromUrl(textureUrlName);
};

/**
 Parse contents of an Autodesk3DSLoader file and generate the scene.
 @private
 */
JSC3D.Autodesk3DSLoader.prototype.parse3DS = function(scene, data) {
	var mesh = new JSC3D.Mesh;
	mesh.vertexBuffer = [];
	mesh.indexBuffer = [];
	mesh.faceNormalBuffer = [];

	var reader = new JSC3D.BinaryStream(data);

	reader.reset();


	// TODO: With this construct, the loop will run no-op for as long
	// as there is time once file has finished reading. Consider a nice
	// way to stop loop when byte array is empty, without putting it in
	// the while-conditional, which will prevent finalizations from
	// happening after the last chunk.
	while (!reader.eof()) {

		// If we are currently working on an object, and the most recent chunk was
		// the last one in that object, finalize the current object.
		if (this._cur_mat && reader.tell() >= this._cur_mat_end) {
			this.finalizeCurrentMaterial();
		}
		else if (this._cur_obj &&  reader.tell() >= this._cur_obj_end) {
			// Can't finalize at this point, because we have to wait until the full
			// animation section has been parsed for any potential pivot definitions

			if(JSC3D.console)
				JSC3D.console.logInfo('Optimize the mesh and add it to the scene. ');

			//have to parse all the materials and create a mesh fdor each material

			mesh = new JSC3D.Mesh;
			mesh.faceCount =  this._cur_obj.facesCount;
			mesh.name = this._cur_obj.name;
			mesh.vertexBuffer = this._cur_obj.verts;
			mesh.indexBuffer = this._cur_obj.indices;
			mesh.texCoordBuffer = this._cur_obj.uvs;


			mesh.texCoordIndexBuffer = this._cur_obj.uvsIndexes;
//			mesh.texCoordIndexBuffer = mesh.indexBuffer;
			mesh.material = new JSC3D.Material;

			var materialFaces = this._cur_obj.materialFaces;
			var currentMaterial = null;
			for(var materialName in materialFaces){
				 currentMaterial = this._materials[materialName];
				if (currentMaterial.colorMap) {
					if(JSC3D.console)
						JSC3D.console.logInfo('set texture: '+currentMaterial.colorMap.url);
					this.setupTexture([mesh], currentMaterial.colorMap.url);
				}
				else {
					mesh.material.diffuseColor = currentMaterial.diffuseColor;
				}
//				mesh.material.ambientColor = currentMaterial.ambientColor;
//				mesh.material.simulateSpecular = (currentMaterial.specularColor>0);
				mesh.isDoubleSided = true;//currentMaterial.twoSided;
				mesh.material.transparency = currentMaterial.transparency>0?(currentMaterial.transparency)/100:0;
			}



			//mesh.faceNormalBuffer = [];
//			mesh.init();
/*

			var tempVertexBuffer = this._cur_obj.verts;	// temporary buffer as container for all vertices

			var viBuffer = tempVertexBuffer.length >= 3 ? (new Array(tempVertexBuffer.length / 3)) : null;

			// split vertices into the mesh, the indices are also re-calculated
			if(tempVertexBuffer.length >= 3 && mesh.indexBuffer.length > 0) {
				for(var i=0; i<viBuffer.length; i++)
					viBuffer[i] = -1;

				mesh.vertexBuffer = [];
				var oldVI = 0, newVI = 0;
				for(var i=0; i<mesh.indexBuffer.length; i++) {
					oldVI = mesh.indexBuffer[i];
					if(oldVI != -1) {
						if(viBuffer[oldVI] == -1) {
							var v = oldVI * 3;
							mesh.vertexBuffer.push(tempVertexBuffer[v]);
							mesh.vertexBuffer.push(tempVertexBuffer[v + 1]);
							mesh.vertexBuffer.push(tempVertexBuffer[v + 2]);
							mesh.indexBuffer[i] = newVI;
							viBuffer[oldVI] = newVI;
							newVI++;
						}
						else {
							mesh.indexBuffer[i] = viBuffer[oldVI];
						}
					}
				}
			}
*/



			// add mesh to scene
			if(!mesh.isTrivial()){
				scene.addChild(mesh);
				this.totalFaces+=mesh.faceCount;
			}

			this._unfinalized_objects[this._cur_obj.name] = this._cur_obj;

			this._cur_obj_end = Number.MAX_VALUE;
			this._cur_obj = null;
		}


		var cid;
		var len;
		var end;

		cid = reader.readUInt16();
		len = reader.readUInt32();
		end = reader.tell() + (len-6);

		switch (cid) {
			case 0x4D4D: // MAIN3DS
			case 0x3D3D: // EDIT3DS
			case 0xB000: // KEYF3DS
				// This types are "container chunks" and contain only
				// sub-chunks (no data on their own.) This means that
				// there is nothing more to parse at this point, and
				// instead we should progress to the next chunk, which
				// will be the first sub-chunk of this one.
				continue;
				break;

			case 0xAFFF: // MATERIAL
				this._cur_mat_end = end;
				this._cur_mat = this.parseMaterial(reader,end);
				break;

			case 0x4000: // EDIT_OBJECT
				this._cur_obj_end = end;
				this._cur_obj = {};
				this._cur_obj.name = this.readNulTermString(reader);
				this._cur_obj.materials = [];
				this._cur_obj.materialFaces = [];
				break;

			case 0x4100: // OBJ_TRIMESH

				this._cur_obj.type = 'mesh';
				break;

			case 0x4110: // TRI_VERTEXL
				this.parseVertexList(reader);
				break;

			case 0x4120: // TRI_FACELIST
				this.parseFaceList(reader);
				break;

			case 0x4140: // TRI_MAPPINGCOORDS
				this.parseUVList(reader);
				break;

			case 0x4130: // Face materials
				this.parseFaceMaterialList(reader);
				break;

			case 0x4160: // Transform
				this._cur_obj.transform = this.readTransform(reader);
				break;

			case 0xB002: // Object animation (including pivot)
				this.parseObjectAnimation(reader,end);
				break;

			case 0x4150: // Smoothing groups
				this.parseSmoothingGroups(reader);
				break;

			default:
				// Skip this (unknown) chunk
				reader.skip(len-6);
				break;
		}
	}

	if(JSC3D.console) {
		JSC3D.console.logInfo('3DS object was loaded !');
		JSC3D.console.logInfo(' totalFaces=' + this.totalFaces);
	}
};

JSC3D.Autodesk3DSLoader.prototype.onload = null;
JSC3D.Autodesk3DSLoader.prototype.onerror = null;
JSC3D.Autodesk3DSLoader.prototype.onprogress = null;
JSC3D.Autodesk3DSLoader.prototype.onresource = null;

JSC3D.LoaderSelector.registerLoader('3ds', JSC3D.Autodesk3DSLoader);
