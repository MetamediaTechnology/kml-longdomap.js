# kml-longdomap.js
A Javascript library for importing KML into Longdo Map.

## Quick start
First, you'll need to include `kml-longdomap.js` and `togeojson.js` into your project.

```html
<script src="togeojson.js"></script>
<script src="kml-longdomap.js"></script>
```
And then pass Longdo Map object and KML string as parameter, like so:
```javascript
let overlays = kmlToLongdoMap(MAP_OBJECT, 'KML_STRING')
```
Finally, `kmlToLongdoMap` function will add Longdo Map overlay as in your KML into your Longdo Map and return everything back as an object, so you might use it later.

See the `/examples` directory for more examples.

## Function parameters
kmlToLongdoMap(`MAP_OBJECT`, `'KML_STRING'`, `OPTIONS`)
* `MAP_OBJECT`:`object`*(required)* Longdo Map object
* `KML_STRING`:`string`*(required)* KML string
* `OPTIONS`:`object`*(optional)* an object for overriding Longdo Map overlay, properties below:
>* markerOptions: [MarkerOptions](http://api.longdo.com/map/doc/content/#MarkerOptions)
>* geometryOptions: [GeometryOptions](http://api.longdo.com/map/doc/content/#GeometryOptions)

## References
* [How to import KML into Longdo Map](https://map.longdo.com/docs/javascript/kml)
* [Longdo Map API](https://map.longdo.com/docs/javascript/getting-started)
