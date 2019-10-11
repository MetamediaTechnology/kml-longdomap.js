/**
* This method is use for importing KML into Longdo Map.
*
* @method kmlToLongdoMap
* @param {Object} map A Longdo Map object
* @param {String} kml String of KML
* @param {Object} options An object with markerOptions and geometryOptions properties
* @return {Object} Returns an object of Longdo Map overlay
*/
let kmlToLongdoMap = function (map, kml, options = {}) {
    
    if (!options.hasOwnProperty('markerOptions')) {
        options.markerOptions = {}
    }
    
    if (!options.hasOwnProperty('geometryOptions')) {
        options.geometryOptions = {}
    }
    
    let resultOverlays = {
        Marker: [],
        Polygon: [],
        Polyline: []
    }

    if (!map || typeof map !== 'object') {
        throw new Error('Invalid Longdo Map object')
    }

    if (!kml || typeof kml !== 'string') {
        throw new Error('Unable to read KML.')
    }

    if (typeof toGeoJSON === 'undefined' || typeof toGeoJSON.kml !== 'function') {
        throw new Error('togeojson.js is not found.')
    }

    kml = getKmlData(kml)
    let geoJson = toGeoJSON.kml(kml)
    let features = geoJson.features
    let allLon = []
    let allLat = []

    for (let feature of features) {
        addOverlayByType(feature)
    }

    if (allLon.length > 0 && allLat.length > 0) {
        let minMaxLon = minMaxArr(allLon)
        let minMaxLat = minMaxArr(allLat)
        map.bound({
            minLon: minMaxLon.min,
            minLat: minMaxLat.min,
            maxLon: minMaxLon.max,
            maxLat: minMaxLat.max
        })
    }

    function minMaxArr(arr) {
        let max = arr[0]
        let min = arr[0]
        for (let i = 0; i < arr.length; i++) {
            if (max < arr[i]) {
                max = arr[i]
            }
            if (min > arr[i]) {
                min = arr[i]
            }
        }
        return { max: max, min: min }
    }

    function setDonutGeomData (data) {
        let secArr = []
        let passSec = false
        let replaceIndex = 0
        for (let point of data) {
            if (passSec) {
                secArr.push(point)
            } else {
                passSec = point === null
                replaceIndex++
            }
        }
        if (isClockwise(secArr)) {
            secArr.reverse()
        }
        data.splice(replaceIndex)
        data = data.concat(secArr)
        return data
    }

    function isClockwise (arr = []) {
        let sum = 0
        let pop = null
        let lastIndex = arr.length - 1
        if (arr.length > 0) {
            if ((arr[0].lat === arr[arr.length - 1].lat) && (arr[0].lon === arr[arr.length - 1].lon)) {
                lastIndex--
            }
            for (let i = 0; i < lastIndex + 1; i++) {
                if (i === lastIndex) {
                    sum += (arr[0].lat - arr[i].lat) * (arr[0].lon + arr[i].lon)
                } else {
                    sum += (arr[i+1].lat - arr[i].lat) * (arr[i+1].lon + arr[i].lon)
                }
            }
        }
        return sum >= 0
    }

    function addOverlayByType (feature) {
        let type = feature.geometry.type
        switch (type) {
            case 'Point':
                addMarker(feature)
                break

            case 'Polygon':
                addPolygon(feature)
                break

            case 'LineString':
                addPolyline(feature)
                break

            case 'GeometryCollection':
                addGeometryCollection(feature)
                break
        
            default:
                console.warn(type + ' is not supported.')
                break
        }
    }

    function getKmlData (kml) {
        if (typeof kml === 'string') {
            kml = (new DOMParser()).parseFromString(kml, 'text/xml')
            return kml
        }
    }

    function addGeometryCollection (feature) {
        let features = feature.geometry.geometries
        for (let item of features) {
            let tempObj = {
                geometry: item,
                properties: feature.properties
            }
            addOverlayByType(tempObj)
        }
    }
    
    function addMarker (feature) {
        let pos = feature.geometry.coordinates
        let props = feature.properties
        let lon = pos[0]
        let lat = pos[1]
        let marker = new longdo.Marker({ lon: lon, lat: lat },
            {
              title: props.name,
              detail: props.description,
              ...options.markerOptions
            })
        let temp = map.Overlays.add(marker)
        resultOverlays.Marker.push(temp)
        allLon.push(pos[0])
        allLat.push(pos[1])
    }
    
    function addPolygon (feature) {
        let pos = feature.geometry.coordinates
        let props = feature.properties
        let lineColor = hexToRgb(props.stroke)
        let fillColor = hexToRgb(props.fill)
        let info = {
            title: props.name,
            detail: props.description,
            lineWidth: 1,
            ...options.geometryOptions
        }
        if (setRgbaColor(lineColor)) {
            info.lineColor = setRgbaColor(lineColor)
        }
        if (setRgbaColor(fillColor, 0.4)) {
            info.fillColor = setRgbaColor(fillColor, 0.4)
        }
        let isDonut = pos.length === 2
        let locationList = []
        let count = 0
        for (let item of pos) {
            if (!isDonut) {
                locationList = []
            } else if (isDonut && locationList.length > 0) {
                locationList.push(null)
            }
            for (let row of item) {
                let lon = row[0]
                let lat = row[1]
                locationList.push({ lon: lon, lat: lat })
                allLon.push(lon)
                allLat.push(lat)
            }
            if (!isDonut) {
                let geom = new longdo.Polygon(locationList, info)
                let temp = map.Overlays.add(geom)
                resultOverlays.Polygon.push(temp)
            } else if (isDonut && count === 1) {
                locationList = setDonutGeomData(locationList)
                let geom = new longdo.Polygon(locationList, info)
                let temp = map.Overlays.add(geom)
                resultOverlays.Polygon.push(temp)
            }
            count++
        }
    }

    function addPolyline (feature) {
        let pos = feature.geometry.coordinates
        let props = feature.properties
        let lineColor = hexToRgb(props.stroke)
        let info = {
            title: props.name,
            detail: props.description,
            lineWidth: 1,
            ...options.geometryOptions
        }
        if (setRgbaColor(lineColor)) {
            info.lineColor = setRgbaColor(lineColor)
        }
        let locationList = []
        for (let item of pos) {
            let lon = item[0]
            let lat = item[1]
            locationList.push({ lon: lon, lat: lat })
            allLon.push(lon)
            allLat.push(lat)
        }
        let geom = new longdo.Polyline(locationList, info)
        let temp = map.Overlays.add(geom)
        resultOverlays.Polyline.push(temp)
    }

    function setRgbaColor (colorObj, a = 1) {
        let rgbStr = null
        if (colorObj !== null) {
            rgbStr = `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${a})`
        }
        return rgbStr
    }
    
    function hexToRgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null
    }

    return resultOverlays
}
