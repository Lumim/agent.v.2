$(document).ready(function(){

	const classTime = [];

	$('#time-add').click(function() {
        const day = $('#day').val();
        const startHour = $('#startHour').val();
        const startMin = $('#startMin').val();
        const amOrPm1 = $('#amOrPm1').val();
        const endHour = $('#endHour').val();
        const endMin = $('#endMin').val();
        const amOrPm2 = $('#amOrPm2').val();
        const timePeriod = day+': '+startHour+':'+startMin+' '+amOrPm1+' - '+endHour+':'+endMin+' '+amOrPm2;
        classTime.push(timePeriod);

        const t = document.createTextNode(timePeriod);
        const newItem = document.createElement("li");
		newItem.appendChild(t);
		$('#class-time-list').append(newItem);
    });

    $('#course-button').click(function() {
    	const data = {};
        data.nickName = $('#nickName').val();
        data.code = $('#code').val();
        data.fullName = $('#fullName').val();
        data.section = $('#section').val();
        data.classRoom = $('#classRoom').val();
        data.classTime = classTime;
        data.description = $('#description').val();
        
        $(this).html('Submitting..');
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/course/add',         
                success: function(data, status) {
                    if (status === 'success') {
                    	window.location.href = postPath;
                    }
                }
            });
        $(this).html('Submit'); 
    });

    $('a.close').click(function() {
    	if (confirm('	The action cannot be undone.\nAre you sure you want to archive this course?')) {
    		const element = this; 
    		const index = $('#activeCourses').children().index($(this).closest('.card'));
    		const data = {};
    		data.index = index;
    		$.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/course/close',         
                success: function(data, status) {
                    if (status === 'success') {
                        $(element).closest('.card').appendTo('#archivedCourses');
    					$(element).closest('.card').find('a.close').remove();
                    }
                }
            });
    	}
    });

    $('a.delete').click(function() {
    	if (confirm('	The action cannot be undone.\nAre you sure you want to delete this course?')) {
    		const element = this;
	    	const index = $(this).closest('.card').parent().children().index($(this).closest('.card'));
	    	const name = $(this).closest('.card').parent().attr('id');
	    	const data = {};
	    		data.index = index;
	    		data.name = name;
	    		$.ajax({
	                type: 'POST',
	                data: JSON.stringify(data),
	                contentType: 'application/json',
	                url: postPath+'/course/delete',         
	                success: function(data, status) {
	                    if (status === 'success') {
	                        $(element).closest('.card').remove();
	                    }
	                }
	            });
    	}
    });

    $('a.view, a.marksheet, a.group, a.resource, a.post, a.submission').click(function() {
    	const index = $(this).closest('.card').parent().children().index($(this).closest('.card'));
    	const name = $(this).closest('.card').parent().attr('id');
    	const classes = $(this).attr('class').split(' ');
        const type = classes[0];
    	const data = {};
    		data.index = index;
    		data.name = name;
    		$.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/course/index',         
                success: function(data, status) {
                    if (status === 'success') {
                       window.location.href = postPath+'/course/'+data.index+'/'+type;
                    }
                }
            });
    });
});