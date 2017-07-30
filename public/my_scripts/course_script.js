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

});