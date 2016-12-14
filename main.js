// >$ npm install request --save 
var request = require("request");
var dal = require('./storage.js');

// http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


var BASE_URL = "https://web-ims.thomasmore.be/datadistribution/API/2.0";
var Settings = function (url) {
	this.url = BASE_URL + url;
	this.method = "GET";
	this.qs = {format: 'json'};
	this.headers = {
		authorization: "Basic aW1zOno1MTJtVDRKeVgwUExXZw=="
	};
};

var Drone = function (id, name, mac) {
	this._id = id;
	this.name = name;
	this.mac = mac;
};
var File = function (id,date_loaded,date_first_record,date_last_record,contents_count){
    this._id=id;
    this.date_loaded = date_loaded;
    this.date_first_record = date_first_record;
    this.date_last_record = date_last_record;
    this.contents_count = contents_count;
    
};
var dronesSettings = new Settings("/drones?format=json");

dal.clearDrone();

request(dronesSettings, function (error, response, dronesString) {
	var drones = JSON.parse(dronesString);
	console.log(drones);
	console.log("***************************************************************************");
	drones.forEach(function (drone) {
		var droneSettings = new Settings("/drones/" + drone.id + "?format=json");
		request(droneSettings, function (error, response, droneString) {
			var drone = JSON.parse(droneString);
			dal.insertDrone(new Drone(drone.id, drone.name, drone.mac_address));
             //console.log(drone.id);
                    var droneInfoSettings= new Settings("/files?drone_id.is="+ drone.id + "&format=JSON");
                   //console.log(droneInfoSettings);
                    request(droneInfoSettings, function (error,response, droneInfoString){
                 var droneInfo= JSON.parse(droneInfoString);
                 //console.log(droneInfoString);
                       // console.log(droneInfo);
                      droneInfo.forEach(function(fileInfo) {
                          var fileInfoSettings = new Settings("/files/"+fileInfo.id+ "?format=JSON");
                          request (fileInfoSettings,function (error,response,fileInfoString){
                              var fileInfos = JSON.parse(fileInfoString);
                              //console.log (fileInfos);
                              dal.insertfileInfos(new File(
                                      fileInfos.id,
                              fileInfos.date_loaded,
                              fileInfos.date_first_record,
                              fileInfos.date_last_record,
                              fileInfos.contents_count
                            ));
                    var contentSettings= new Settings("/files/"+ fileInfo.id + "/contents?format=JSON");
                   //console.log(droneInfoSettings);
                    request(contentSettings, function (error,response, contentString){
                 var contents= JSON.parse(contentString);
                    //console.log(contents);
                    
                    contents.forEach(function(contentFile){
                        var contentFileSettings = new Settings("/files/"+ fileInfo.id + "/contents/"+contentFile.id+"?format=JSON");
                        request (contentFileSettings,function (error,response,contentFileString){
                            var contentFile=JSON.parse(contentFileString);
                            dal.instertFilecontent(
                                    new FileContent(
                                    contentFile.id,
                             contentFile.mac_address,
                              contentFile.datetime,
                               contentFile.rssi,
                                contentFile.url,
                                contentFile.ref //veel meer informatie in JSOn formaat /makkerlijker af te lezezn
                                    )
                                    );
                            
                        });
                    });
                    });
                          });
                      });
             });
		});    
	});
});

console.log("Hello World!");


