const net = require('net');

videohubServer = {

    videohubs: [
            {
                ip:"10.220.0.201",
                version: '',
                present: '',
                model: '',
                name: '',
                numberOfInputs: 0,
                numberOfOutputs: 0,
                inputs: [],
                outputs: [],
            },
            {
                ip:"10.220.0.202",
                version: '',
                present: '',
                model: '',
                name: '',
                numberOfInputs: 0,
                numberOfOutputs: 0,
                inputs: [],
                outputs: [],
            },
        ],
    start: function (params) {
        this.videohubs.forEach((videohub, i) => {
            console.log(videohub.ip)
            videohub.client = new net.Socket();
            videohub.client.connect({port: 9990, host: videohub.ip});
            
            videohub.client.on('connect', () => {
                console.log("connected");
                videohub.client.write('configuration\r\n\r\n');
            });
            videohub.client.on('data', (data) => {
                console.log("data");
                console.log(data.toString());
            var dataArray = data.toString().split(/\r?\n/);
            console.log(dataArray);
            if(dataArray.indexOf('PROTOCOL PREAMBLE:') != -1){
                var index = dataArray.indexOf('PROTOCOL PREAMBLE:');
                videohub.version = dataArray[index + 1].split(": ")[1];
            }
            if(dataArray.indexOf('VIDEOHUB DEVICE:') != -1){
                var index = dataArray.indexOf('VIDEOHUB DEVICE:');
                videohub.present = dataArray[index + 1].split(": ")[1];
                videohub.model = dataArray[index + 2].split(": ")[1];
                videohub.name = dataArray[index + 3].split(": ")[1];
                videohub.numberOfInputs = parseFloat(dataArray[index + 5].split(": ")[1]);
                videohub.numberOfOutputs = parseFloat(dataArray[index + 7].split(": ")[1]);
            }
            if(dataArray.indexOf('INPUT LABELS:') != -1){
                var index = dataArray.indexOf('INPUT LABELS:');
                for(var i = 0; i < videohub.numberOfInputs; i++){
                    if(videohub.inputs[i] == undefined){
                        videohub.inputs[i] = {}
                    }
                    videohub.inputs[i]["label"] = dataArray[index + 1 + i].substring((i.toString().length + 1), dataArray[1 + i].length + i.toString().length)
                }
            }
            if(dataArray.indexOf('OUTPUT LABELS:') != -1){
                var index = dataArray.indexOf('OUTPUT LABELS:');
                for(var i = 0; i < videohub.numberOfOutputs; i++){
                    if(videohub.outputs[i] == undefined){
                        videohub.outputs[i] = {}
                    }
                    videohub.outputs[i]["label"] = dataArray[index + 1 + i].substring((i.toString().length + 1), dataArray[1 + i].length + i.toString().length)
                }
            }
            if(dataArray.indexOf('VIDEO OUTPUT LOCKS:') != -1){
                var index = dataArray.indexOf('VIDEO OUTPUT LOCKS:');
                for(var i = 0; i < videohub.numberOfOutputs; i++){
                    if(videohub.outputs[i] == undefined){
                        videohub.outputs[i] = {}
                    }
                    if(dataArray[index + 1 + i].split(" ")[1] == "U"){
                        videohub.outputs[i]["locked"] = false;
                    }
                    if(dataArray[index + 1 + i].split(" ")[1] == "L"){
                        videohub.outputs[i]["locked"] = true;
                    }
                }
            }
            if(dataArray.indexOf( 'VIDEO OUTPUT ROUTING:') != -1){
                console.log("Output routing in progress...")
                var index = dataArray.indexOf('VIDEO OUTPUT ROUTING:');
                for(var i = 0; i < videohub.numberOfOutputs && dataArray[index + 1 + i] != ""; i++){
                    if(videohub.outputs[i] == undefined){
                        videohub.outputs[i] = {}
                    }
                    videohub.outputs[parseFloat(dataArray[index + 1 + i].split(" ")[0])]["routedToInput"] = parseFloat(dataArray[index + 1 + i].split(" ")[1]);
                    console.log("Routed output ", parseFloat(dataArray[index + 1 + i].split(" ")[0]) , "from input", parseFloat(dataArray[index + 1 + i].split(" ")[1]))
                }
                console.log("Output routing done")
            }
            console.log(videohub);
            });
            videohub.client.on('end', () => {
                console.log('disconnected from server');
            });
            });
    },

    route: function(...routeArray){
        this.videohubs[routeArray[0].videohub].client.write("VIDEO OUTPUT ROUTING:\r\n")
        routeArray.forEach(routeObject => {
            console.log(this.videohubs[routeArray[0].videohub].name + ": Routing input ", routeObject.input, " to output ", routeObject.output)
            
            this.videohubs[routeArray[0].videohub].client.write(`${routeObject.input} ${routeObject.output}\r\n`)
        });
        this.videohubs[routeArray[0].videohub].client.write("\r\n")
    }
}

exports.videohubServer = videohubServer;