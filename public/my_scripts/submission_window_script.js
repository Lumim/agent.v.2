$(document).ready(function(){
	
	function msToTime(duration) {

        x = duration / 1000
		seconds = parseInt(x) % 60
		x /= 60
		minutes = parseInt(x) % 60
		x /= 60
		hours = parseInt(x) % 24
		x /= 24
		days = parseInt(x)

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return days + ' Days ' + hours + " hourse " + minutes + " minitues " + seconds +" seconds";
    }

	const currentTime = new Date();
	if(Number(currentTime) >= Number(endTime)) {
		$('#remain').html('Closed');
		$('form').remove();
	}
	else {
		const dif = msToTime(Number(endTime) - Number(currentTime));
		$('#remain').html('Time remain: ' + dif);
	}

	$('#upload').submit(function() {
        $('#status').empty().text('File is uploading...');
         $(this).ajaxSubmit({
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },
            success: function(data, status) {
                location.reload();
            }
        });
        //Very important line, it disable the page refresh.
        return false;
    });   
	
});