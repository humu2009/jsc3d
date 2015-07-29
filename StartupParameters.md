# The Startup Parameters #

## SceneUrl ##

Set `SceneUrl` to URL of a model file so that the `viewer` will load it automatically. The loading will be started immediately after the `init()` call. This is very convenient for applications that just display a single model. The default value for this parameter is '' which lets the scene empty and only background will be drawn after the first `update()` call. And after initialization, the `replaceSceneFromUrl()` method can be used to begin to load the model at an appropriate moment.

## InitRotationX, InitRotationY and InitRotationZ ##

Set `InitRotationX`, `InitRotationY` and/or `InitRotationZ` to adjust the initial orientation of the model. Each value should be an angle (in degrees) that specifies rotation around the corresponding axis. By default there are no additional initial rotations and the model will displayed as defined.

## ModelColor ##

Set `ModelColor` to specify the color of the default material which will be used for rendering of meshes that do not have an own material. For example, an STL model does not contain any material information, so it will be rendered using the default material. An valid value for this parameter should be the color's string representation formated as '`#`<font color='red'><code>RR</code></font><font color='green'><code>GG</code></font><font color='blue'><code>BB</code></font>'.

## BackgroundColor1 and BackgroundColor2 ##

Set `BackgroundColor1` and `BackgroundColor2` to customize the background colors. The first parameter defines the color for the topmost row and the other one defines that for the bottom row. Then color will be linearly interpolated from top down. Both parameters receive a string represented color that should be formated as '`#`<font color='red'><code>RR</code></font><font color='green'><code>GG</code></font><font color='blue'><code>BB</code></font>'.

## BackgroundImageUrl ##

Set `BackgroundImageUrl` to URL of an image that will be used as the background. The loading will be started automatically after the `init()` call. The image will be scaled to fit the actual dimensions of the canvas. So it is recommended to adjust the image's size to be the same as the canvas in preparation to avoid distortion.

## Background ##

Set `Background` to `'on'` to indicate the background area should be filled up with specified colors on images. If this parameter is set to `'off'`, then the background area becomes completely transparent. As a result, the DOM element behind the canvas will be visible accordingly.

## RenderMode ##

Set `RenderMode` to specify the initial render mode the `viewer` adopts. Render mode controls how the model will be rendered. The following render modes are available in current implementation:

  * `point` - meshes will be rendered as points.
  * `wireframe` - meshes will be rendered as wireframe.
  * `flat` - meshes will be rendered using flat shading. This is the default value for the `RenderMode` parameter.
  * `smooth` - meshes will be rendered using smooth shading.
  * `texture` - meshes will be rendered as textured primitives with no lighting applied. If textures are unavailable, the `flat` mode will be used as the fallback.
  * `textureflat` - meshes will be rendered as textured primitives with lighting computed per face. If textures are unavailable, the `flat` mode will be used as the fallback.
  * `texturesmooth` - meshes will be rendered as textured primitives with lighting computed per vertex and then interpolated. If textures are unavailable, the `smooth` mode will be used as the fallback.

The `setRenderMode()` method can be used to change current render mode at runtime.

## Definition ##

Set `Definition` to specify the graphical quality for rendering. Available values are:

  * `low` - the model will be rendered into frame buffers with half the dimensions of the canvas and then resampled to put to display. The output quality is rather low. Especially there will be apparent 'jagged' effect on edges of the polygons.
  * `high` - dimensions of frame buffers will be set to twice of those of the canvas. The rendering will be resampled to put to display. This technique is also known as 2x2 FSAA([Full Screen Anti-Anliasing](http://en.wikipedia.org/wiki/FSAA#Super_sampling_.2F_full-scene_anti-aliasing)) which helps to reduce artificial on edge area and thus produces better results.
  * `standard` - dimensions of frame buffers will be set to the same with the canvas. This is the default value for the `Definition` parameter.

The `setDefinition()` method can be used to change the definition setting at runtime.

## MipMapping ##

Set `MipMapping` to `'on'` to enable automatically mipmap generation for textures. [Mipmaps](http://en.wikipedia.org/wiki/Mipmap) are a group of images that are generated from a main texture by cascaded downsampling. This is a technique to improve the rendering quality for textured meshes. Mipmap generation is disabled by default.

## CreaseAngle ##

Set `CreaseAngle` to define an angle threshold (in degrees) to preserve sharp edges in smooth rendering. Crease angle affects how vertex normals are generated. If the angle between the normals of two adjacent faces is less than the given crease angle, the vertex normals should be computed so that the faces will be shaded smoothly across the edge. Otherwise there should be a lighting discontinuity (aka a crease) across the edge. This parameter only works under the `'smooth'` and `'texturesmooth'` render modes. If it is set to 0, the rendered result is equivalent to that under the `'flat'` or `'textureflat'` render mode. In most cases, an angle value between 30~45 degrees produces nice output.

## SphereMapUrl ##

Set `SphereMapUrl` to URL of an image that will be used as the [spherical reflection map](http://en.wikipedia.org/wiki/Reflection_mapping#Sphere_mapping) for the model. Sphere mapping is an image-based simulation technique to cast environment onto surfaces of the model. _In current implementation, sphere mapping is available only under the `'texturesmooth'` render mode_. A mesh's `isEnvironmentCast` property should be set to `true` to indicate it is involved in shpere mapping.

## ProgressBar ##

Set `ProgressBar` to `'on'`/`'off'` to enable/disable the default progress bar. The viewer provides a default progress bar which will be displayed when a model file is still in loading. By setting this parameter to `'off'`, the default progress bar is turned off so that a user-defined progress indicator can be used. The default value is `'on'`.

## Renderer ##

Set `Renderer` to `'webgl'` to enable [WebGL](http://en.wikipedia.org/wiki/WebGL) to take charge of all rendering. If this is set, the `viewer` instance will be internally initialized with the WebGL render back-end to replace the default software rendering modules. This brings about better graphic output and more efficient rendering especially for large models. For browsers without WebGL support, software rendering will be automatically enabled as the fallback. It should be noted that in current implementation, the WebGL render back-end is provided as an optional component through a separate JavaScript source file **jsc3d.webgl.js**, which should also be included to enable WebGL rendering. Otherwise, this parameter has no effect.