function download(){
	var start_date = ;
	var end_date = ;
	var room_number = ;
	var sensor_type = ;
	
	url_string = "https://api.usb.urbanobservatory.ac.uk/api/v2.0a/sensors/timeseries/room-" + room_number + "/" + sensor_type + "/raw/historic?startTime=" + start_date + "T00:00:00&endTime=" + end_date + "T23:59:59&outputAs=csv" ;
	
	var api_request = new XMLHttpRequest();
	api_request.open("GET", url_string, true);
	api_request.onload = function(){
		if(api_request.status == 200){
			var output_data = "data:text/csv;charset=utf-8," + encodeURIComponent(this.response);

			var d_link = document.createElement("a");
			d_link.href = output_data;
			d_link.download = sensor_type + ":" + room_number + ".csv";
			d_link.click();
		} else if(api_request.status == 400){
			window.alert("Error. Incorrect request parameters.");
		} else {
			window.alert("Error");
		}
	}
	api_request.send();
}
