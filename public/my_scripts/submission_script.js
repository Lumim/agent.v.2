$(document).ready(function(){
  	$( "#datepicker" ).datepicker({ dateFormat: 'mm/dd/yy'});
  	$('#timepicker').timepicker({ timeFormat: 'HH:mm:ss' });

	$('.card').hover(function() {
		const element = $(this).find('.status');
		const endTime = element.data('ms');
		const currentTime = new Date();
		if (Number(endTime) > Number(currentTime)) {
			element.html('Running');
		}
		else {
			element.html('Closed');
		}
	}); 

  	$('#create').click(function() {
  		const title = $('#title').val();
  		const date = $('#datepicker').val();
  		const time = $('#timepicker').val();
  		if (date != '' && time != '') {
  			const dateTime = date+' '+time;
	  		const myDate = new Date(dateTime);
			const milliseconds = myDate.getTime();
			//alert(milliseconds);
			const data = {};
			data.title = title;
			data.endTime = dateTime;
	        data.milliseconds = milliseconds;
	        $.ajax({
	                type: 'POST',
	                data: JSON.stringify(data),
	                contentType: 'application/json',
	                url: postPath+'/submission',                      
	                success: function(data, status) {
	                    if (status === 'success') {
	                    	/*
	                        const card = $('<div>', {
	                            class: 'card',
	                        }).prependTo('#submission-list');

	                        const cardBlock = $('<div>', {
	                            class: 'card-block',
	                        }).appendTo(card);

	                        const cardTitle = $('<div>', {
	                            class: 'card-title',
	                        }).appendTo(cardBlock);

	                        $('<p>', {
	                        	text: data.submission.title,
	                        }).appendTo(cardTitle);
							*/
							location.reload();
	                    }
	                }
	            });
  		}
	});

	$('.change').click(function() {
		const text = $(this).closest('.card-block').find('p').text();
		const ID = $(this).closest('card').data('ID');
		$('#fac').html('Change time here');
		$('#fac').css('color', 'red');
		$('#title').val(text); 
		const date = $('#datepicker').val();
  		const time = $('#timepicker').val();
  		if (date != '' && time != '') {
  			const dateTime = date+' '+time;
	  		const myDate = new Date(dateTime);
			const milliseconds = myDate.getTime();
			//alert(milliseconds);
			const data = {};
			data.endTime = dateTime;
	        data.milliseconds = milliseconds;
	        data.submissionID = ID;
	        $.ajax({
	                type: 'POST',
	                data: JSON.stringify(data),
	                contentType: 'application/json',
	                url: postPath+'/submission/change',                      
	                success: function(data, status) {
	                    if (status === 'success') {
							location.reload();
	                    }
	                }
	            });
  		}
	});

	$('.delete').click(function() {
		const ID = $(this).closest('.card').data('id');
		const data = {};
        data.submissionID = ID;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/submission/delete',                      
                success: function(data, status) {
                    if (status === 'success') {
						location.reload();
                    }
                }
            });
	});
});

