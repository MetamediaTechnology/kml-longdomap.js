document.addEventListener("DOMContentLoaded", (event) => {
    map = new longdo.Map({
        placeholder: document.getElementById('map'),
        lastView: false
    })

    document.getElementById('upload').addEventListener('change', readFileAsString)
})

function readFileAsString() {
    var files = this.files;
    if (files.length === 0) {
        console.log('No file is selected');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(event) {
        var overlays = kmlToLongdoMap(map, event.target.result)
        console.log(overlays)
    };
    reader.readAsText(files[0]);
}
