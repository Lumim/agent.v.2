$(document).ready(function(){
	$('#two').hide();
  	$( ".datepicker" ).datepicker({ dateFormat: 'mm/dd/yy'});
  	$('.timepicker').timepicker({ timeFormat: 'HH:mm:ss' });
  	$( ".datepicker1" ).datepicker({ dateFormat: 'mm/dd/yy'});
  	$('.timepicker1').timepicker({ timeFormat: 'HH:mm:ss' });

  	$('#create').click(function() {
  		const title = $('.title').val();
  		const date = $('.datepicker').val();
  		const time = $('.timepicker').val();
  		if (date != '' && time != '') {
  			const ddmmyyy = date.split('/');
  			const str = ddmmyyy[1]+'/'+ddmmyyy[0]+'/'+ddmmyyy[2]+' '+time;
  			const dateTime = date+' '+time;
	  		const myDate = new Date(dateTime);
			const milliseconds = myDate.getTime();
			const data = {};
			data.title = title;
			data.endTime = str;
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
	                        	class: 'time mr-3',
	                        	text: data.submission.endTime,
	                        }).appendTo(cardBlock);
	                        
	                        const currentTime = new Date();
	                        if(Number(data.submission.milliseconds) > Number(currentTime)) {
	                        	$('<small>', {
		                        	class: 'status mr-3',
		                        	text: 'Open',
		                        }).appendTo(cardBlock);
	                        } else {
	                        	$('<small>', {
		                        	class: 'status mr-3',
		                        	text: 'Closed',
		                        }).appendTo(cardBlock);
	                        }
	                        
	                        const small = $('<small>', {
	                        }).appendTo(cardBlock);

	                        $('<a>', {
	                            class: 'mr-3 change',
	                            href: 'javascript:;',
	                            text: 'Change Time',
	                        }).appendTo(small);
	                        
	                        $('<a>', {
	                            class: 'mr-3 delete',
	                            href: 'javascript:;',
	                            text: 'Delete',
	                        }).appendTo(small);
	                        
	                    }
	                }
	            });
  		}
	});

  	var ID, element;
	$('#submission-list').on('click', 'a.change', function() {
		element = $(this);
		$('#one').hide();
		$('#two').show();
		const text = element.closest('.card-block').find('p').text();
		ID = element.closest('.card').data('id'); // I spent more than an hour behind this ID
		$('.title1').html(text); 
	});

	$('#change').click(function() {
		const date = $('.datepicker1').val();
  		const time = $('.timepicker1').val();
  		if (date != '' && time != '') {
  			const ddmmyyy = date.split('/');
  			const str = ddmmyyy[1]+'/'+ddmmyyy[0]+'/'+ddmmyyy[2]+' '+time;
  			const dateTime = date+' '+time;
	  		const myDate = new Date(dateTime);
			const milliseconds = myDate.getTime();
			const data = {};
			data.endTime = str;
	        data.milliseconds = milliseconds;
	        data.submissionID = ID;
	        $.ajax({
	                type: 'POST',
	                data: JSON.stringify(data),
	                contentType: 'application/json',
	                url: postPath+'/submission/change',                      
	                success: function(data, status) {
	                    if (status === 'success') {
							element.closest('.card-block').find('.time').html(str);
							const currentTime = new Date();
							if(Number(milliseconds) > Number(currentTime))
								element.closest('.card-block').find('.status').html('Open');
							else
								element.closest('.card-block').find('.status').html('Closed');	
	                    }
	                }
	            });
  		}
  		$('#two').hide();
		$('#one').show();
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

