var selectedVideohub = 0;

function refresh(){
    fetch(`/videohub/api`).then((response) => {
        console.log(response);
        response.json().then((data) => {
            $(".videohubSelector").html("")
            data.forEach((videohub, i) => {
                if(i == selectedVideohub){
                    $(".videohubSelector").append(`<option selected="selected" value="${i}">${videohub.name}</option>`);
                }
                else{
                    $(".videohubSelector").append(`<option value="${i}">${videohub.name}</option>`);
                }
                
            });
            console.log(data)
            $(".container").html("");
            for(var i = 0; i < data[selectedVideohub].numberOfOutputs; i++){
                var rowContainer = $(`
                <div class='rowContainer'>
                    <div class="outputNumber">${i + 1}</div>
                </div>`);

                var selectBox = $(`<select value="${i}" onchange="route(this)" name="" id="" data-output="${i}"class="inputSelector"></select>`)
                for(var h = 0; h < data[selectedVideohub].numberOfInputs; h++){
                    if(data[selectedVideohub].outputs[i].routedToInput == h){
                        selectBox.append(`<option selected="selected" value="${h}">${h + 1} - ${data[selectedVideohub].inputs[h].label}</option>`)
                    }
                    else{
                        selectBox.append(`<option value="${h}">${h + 1} - ${data[selectedVideohub].inputs[h].label}</option>`)
                    }
                }
                $(rowContainer).append(selectBox);
                $(rowContainer).append(`
                    <div class="directionArrow">&gt;</div>
                    <div class="outputLabel">${data[selectedVideohub].outputs[i].label}</div>
                `);
                $(".container").append(rowContainer);
            }
        });
    });
}

function route(select){
    console.log("Route input ", select.value, " to output", select.dataset.output);
    fetch(`/videohub/route?input=${select.value}&output=${select.dataset.output}&videohub=${selectedVideohub}`).then((response) => {console.log(response)});
}

function selectVideohub(select){
    console.log("Selected videohub ", select.value);
    selectedVideohub = select.value;
    refresh();
}

refresh();