$(document).ready(function(){
  	$( "#datepicker" ).datepicker({ dateFormat: 'mm/dd/yy'});
  	$('#timepicker').timepicker({ timeFormat: 'HH:mm:ss' });

	/*$('.status').hover(function() {
		const element = $(this);
		const endTime = element.data('end');
		const currentTime = new Date();
		if (Number(endTime) > Number(currentTime)) {
			element.html('Running');
		}
		else {
			element.html('Closed');
		}
	}); */

	function() {
		const element = $('.small');
		const endTime = element.data('end');
		const currentTime = new Date();
		if (Number(endTime) > Number(currentTime)) {
			element.html('Running');
		}
		else {
			element.html('Closed');
		}
	};

  	

  	$('#create').click(function() {
  		const date = $('#datepicker').val();
  		const time = $('#timepicker').val();
  		const dateTime = date+' '+time;
  		const myDate = new Date(dateTime);
		const milliseconds = myDate.getTime();
		//alert(milliseconds);
		const data = {};
        data.milliseconds = milliseconds;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/submission',                      
                success: function(data, status) {
                    if (status === 'success') {
                        location.reload();
                    }
                }
            });
	});
});

