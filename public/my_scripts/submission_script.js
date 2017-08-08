$(document).ready(function(){
  	$( "#datepicker" ).datepicker({ dateFormat: 'mm/dd/yy'});
  	$('#timepicker').timepicker({ timeFormat: 'HH:mm:ss' });

	$('.status').hover(function() {
		const element = $(this);
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
	                        const card = $('<div>', {
	                            class: 'card',
	                            "data-id": data.submission._id, 
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

	                        const a = $('<a>', {
	                        	href: '/user/'+username+'/submission/'+data.submission._id,
	                        	target: '_blank',
	                        }).appendTo(cardBlock);

	                        const img = $('<img>', {
	                        	src: '/public/image/folder_image.png',
	                        	width: '50',
	                        	height: '50',
	                        }).appendTo(a);

	                        $('<br>', {
	                        }).appendTo(cardBlock);

	                        $('<small>', {
	                        	class: 'mr-3',
	                        	text: data.submission.endTime,
	                        }).appendTo(cardBlock);

	                        $('<small>', {
	                        	class: 'mr-3 status',
	                        	text: Status,
	                        	"data-ms": data.submission.milliseconds,
	                        }).appendTo(cardBlock);

	                        const small = $('<small>', {
	                        }).appendTo(cardBlock);

	                        $('<a>', {
	                            class: 'mr-3 change',
	                            href: 'javascript:;',
	                            text: Change Time,
	                        }).appendTo(small);

	                        $('<a>', {
	                            class: 'mr-3 delete',
	                            href: 'javascript:;',
	                            text: Deltete,
	                        }).appendTo(small);

							//location.reload();
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

