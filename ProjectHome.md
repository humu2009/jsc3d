# Introduction #
Welcome to _JSC3D_. This project provides a 3d object viewer for presenting 3d models and small scenes on a web page. _JSC3D_ is coded entirely in Javascript and requires an HTML canvas to perform rendering and interactions. <br>
<i>JSC3D</i> does not target at a serious all-purpose 3d engine. It is made especially for online design sharing and product exhibition.  <i>JSC3D</i> is built on pure Javascript software rendering using 2d canvas technology as well as an optional WebGL back-end that provides more efficient rendering. It is designed to be widely compatible with most major browsers that support HTML5 Canvas feature. <i>JSC3D</i> has been tested on Opera, Chrome, Firefox, Safari, IE9 and more. A modified edition for Microsoft IE versions less than 9 is also available.<br>
<br>
<h1>Features</h1>
<ul><li>CAD Style Orthographic View<br>
</li><li>Z-Buffering<br>
</li><li>Fixed Directional Lighting (Headlight)<br>
</li><li>Render as Points<br>
</li><li>Render as Wireframe<br>
</li><li>Flat Shading<br>
</li><li>Smooth Shading with Crease Angle<br>
</li><li>Texturing<br>
</li><li>Mip-mapping<br>
</li><li>Environment Mapping<br>
</li><li>Multiple Graphic Qualities (0.5x0.5, 1x1, 2x2 FSAA)<br>
</li><li>Picking<br>
</li><li>Dual Render Back-ends (WebGL, Software)<br>
</li><li>Built-in Loader for Wavefront obj File<br>
</li><li>Built-in Loader for STL File<br>
</li><li>Optional Loader for Autodesk 3DS File<br>
</li><li>Optional Loader for OpenCTM File<br>
</li><li>Multi-touch Based Control on Mobile Devices</li></ul>

=Live Demos=<table><thead><th><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/avatar.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/avatar.png' /></a></th><th><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/bmw.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/bmw.png' /></a></th><th><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/statue.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/statue.png' /></a></th><th><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/house.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/house.png' /></a></th></thead><tbody>
<tr><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/sandiego.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/city.png' /></a></td><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/test.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/dragon.png' /></a></td><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/earth.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/earth.png' /></a>  </td><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/md2viewer.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/md2.png' /></a></td></tr>
<tr><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/map3d.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/map.png' /></a>    </td><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/iphoneg4.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/iphone4.png' /></a></td><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/temple.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/temple.png' /></a></td><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/street.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/street2.png' /></a></td></tr>
<tr><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/submarina.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/submarine.png' /></a></td><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/tricera.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/tricera.png' /></a></td><td><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/characteranimation.html'><img src='http://jsc3d.googlecode.com/svn/screenshots/characteranimation.png' /></a></td><td><img src='http://jsc3d.googlecode.com/svn/screenshots/wallcorner.png' />                                                                      </td></tr></tbody></table>

<h1>Support for IE <9</h1>
IE9 already makes good support for canvas element, on which <i>JSC3D</i> has been tested to run smoothly. <br>
For other older IE versions (IE7 and IE8), <i>JSC3D</i> provides a slightly modified version which utilize Adobe Flash plugin to simulate an HTML5 compatible canvas and renders on it. You can see some IE7 and IE8 compatible demos here. Please note that you should have installed and enabled Flash plugin on your browser to run these.<br>
<a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/test_ie_compatible.html'>http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/test_ie_compatible.html</a><br>
<a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/avatar_ie_compatible.html'>http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/avatar_ie_compatible.html</a><br><a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/bmw_ie_compatible.html'>http://jsc3d.googlecode.com/svn/trunk/jsc3d/demos/bmw_ie_compatible.html</a>

<h1>Documentation</h1>
Some documents can be found in the <a href='http://code.google.com/p/jsc3d/w/list'>wiki</a> section. A detailed description of <i>JSC3D</i>'s programming interface is availabe <a href='http://jsc3d.googlecode.com/svn/trunk/jsc3d/docs/index.html'>here</a>. You can also check out the demos from the <a href='http://code.google.com/p/jsc3d/source/checkout'>respository</a> as guidance for advanced applications.<br>
<br>
