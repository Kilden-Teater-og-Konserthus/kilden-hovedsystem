$(".maincontent").sortable();
$(".maincontent").sortable({ cancel: '.textHeaders' });
$(".maincontent").sortable("option", "axis", "y");
$(".maincontent").sortable({containment: ".maincontent"});
$(".maincontent").sortable({ handle: '.arrangeHandle' });
$(".maincontent").sortable({ update: function(event, ui) {
    updateSortable();
} });

var cameraLastResponse = {};
var videohubLastResponse = {};

function updateSortable(){
    var sortableIds = $(".maincontent").sortable("toArray");
    sortableIds.shift();
    console.log(sortableIds);
    var postArray = [];
    for (var i = 0; i < sortableIds.length; i++){
        postArray[i] = cameraLastResponse[sortableIds[i]];
    }
    console.log(JSON.stringify(postArray))
    fetch("/setCameras",{
        method: "POST",
        body: JSON.stringify(postArray),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    })
  }

fetch('/getCameras')
  .then(function(response) {
    return response.json();
  }).then(function(cameraData) {
    cameraLastResponse = cameraData;
    fetch('/videohub/api')
    .then(function(response) {
        return response.json();
    }).then(function(videohubData) {
        videohubLastResponse = videohubData;
        generateCameras(cameraData, videohubData);
    });
  });

  function generateCameras(cameraArray, videohubs) {
      $(".maincontent").html(``)
      $(".maincontent").append(`
      <div class="cameraRow textHeaders">
        <div class="arrangeHandle"></div>
        <div class="cameraImage"></div>
        <div class="cameraType">Kamera Type</div>
        <div class="ipAddress">IP Adresse</div>
        <div class="videohubSelect">Videohub Input</div>
        <div class="hyperdeckSelect">Hyperdeck opptak Input</div>
        <div class="convertSelect">4K -> HD</div>
        <button class="btn btn-danger" type="button">Clear all presets</button>
    </div>
      `)

      cameraArray.forEach((camera, i) => {
          $(".maincontent").append(`
          <div class="cameraRow" id="${i}">
            <div class="arrangeHandle">⭥</div>
            <div class="cameraImage"></div>
            <div class="cameraType">${camera.model}</div>
            <div class="ipAddress">${camera.IP}</div>
            <select name="" id="" class="videohubSelect">
            ${generateVideohubOptions(videohubs, camera)}
                <option value="">AM1</option>
            </select>
            <select name="" id="" class="hyperdeckSelect">
            
                <option value="">Hyperdeck 1</option>
            </select>
            <input type="checkbox" class="convertSelect">
            <button class="btn btn-danger" type="button">Clear Presets</button>
        </div>
          `)
      });
  }

  function generateVideohubOptions(videohubObject, camera) {
    var returnString = ""
    videohubObject[0].inputs.forEach((input, i) => {
        if(i == camera.videohubInput){

            returnString += `<option selected value="${i}">${input.label}</option>`
        }
        else{
            returnString += `<option value="${i}">${input.label}</option>`
        }
    });
    return returnString;
  }