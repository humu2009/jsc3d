# Getting Started with JSC3D #

_JSC3D_ is very easy to setup and run. It requires only a few lines of code to initialize.

_JSC3D_ uses _**[canvas](https://developer.mozilla.org/en-US/docs/HTML/Canvas)**_ element for rendering, so the first step is to declare a _**canvas**_ with non-zero sizes in the _**body**_ section of the page.

```
<body>
    <canvas id="cv" width=640 height=480></canvas>
</body>
```

The script file `jsc3d.js` or `jsc3d.min.js` should be included which contains the main implementation of _JSC3D_ library.

```
<script type="text/javascript" src="jsc3d.js"></script>
```

For touch devices, an additional script file `jsc3d.touch.js` should also be included which provides support for touch/multi-touch based control.

```
<script type="text/javascript" src="jsc3d.touch.js"></script>
```

An instance of `JSC3D.Viewer` should be constructed with the _**canvas**_ element declared previously as the render target. The following code demonstrates how to do this.

```
var viewer = new JSC3D.Viewer(document.getElementById('cv'));
```

The `viewer` must be initialized before any further use. Optionally, there are a series of startup parameters which can be set before initialization to customize some important features of the `viewer`. The most useful startup parameters are `SceneUrl` and `RenderMode`. The `SceneUrl` parameter specifies a URL where the model file is located. If it is not empty, a loading will be started immediately after the initialization of the `viewer`. This is very convenient especially for simple applications that only display a single model. The `RenderMode` parameter specifies how the model will be rendered. For example if `RenderMode` is set to `'flat'`, each polygon of the model will be shaded based on the direction of its surface normal and the result looks faceted.

The following code specifies the URL of a model that will be rendered facetedly with the given color `#CAA618`, as well as a gradient background whose color will be interpolated from `#E5D7BA` to `#383840` from top down.

```
viewer.setParameter('SceneUrl',         'my_model.obj');
viewer.setParameter('ModelColor',       '#CAA618');
viewer.setParameter('BackgroundColor1', '#E5D7BA');
viewer.setParameter('BackgroundColor2', '#383840');
viewer.setParameter('RenderMode',       'flat');
```

Then invoke `init()` method to initialize the `viewer` object. The startup parameters set above will be applied too.

```
viewer.init();
```

It is recommended to also invoke the `update()` method once after the initializtion to draw the first frame on canvas.

```
viewer.update();
```

Put these altogether and we get a working example.

```
<!DOCTYPE html>
<html>
    <head>
        <title>Getting Started with JSC3D</title>
    </head>
    <body>
        <canvas id="cv" width=640 height=480>
        It seems you are using an outdated browser that does not support canvas :-(
        </canvas>
        <script type="text/javascript" src="jsc3d.js"></script>
        <script type="text/javascript" src="jsc3d.touch.js"></script>
        <script type="text/javascript">
            var viewer = new JSC3D.Viewer(document.getElementById('cv'));
            viewer.setParameter('SceneUrl',         'my_model.obj');
            viewer.setParameter('ModelColor',       '#CAA618');
            viewer.setParameter('BackgroundColor1', '#E5D7BA');
            viewer.setParameter('BackgroundColor2', '#383840');
            viewer.setParameter('RenderMode',       'flat');
            viewer.init();
            viewer.update();
        </script>
    </body>
</html>
```

That is our first application with _JSC3D_.