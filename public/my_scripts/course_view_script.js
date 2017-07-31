$(document).ready(function(){

    $('#description').val(description);

	const classTimeAdd = [];
    const classTimeDelete = [];

	$('#time-add').click(function() {
        const day = $('#day').val();
        const startHour = $('#startHour').val();
        const startMin = $('#startMin').val();
        const amOrPm1 = $('#amOrPm1').val();
        const endHour = $('#endHour').val();
        const endMin = $('#endMin').val();
        const amOrPm2 = $('#amOrPm2').val();
        const timePeriod = day+': '+startHour+':'+startMin+' '+amOrPm1+' - '+endHour+':'+endMin+' '+amOrPm2;
        classTimeAdd.push(timePeriod);

        const t = document.createTextNode(timePeriod);
        const newItem = document.createElement("li");
		newItem.appendChild(t);
		$('#class-time-list').append(newItem);
    });

    $('a.delete').click(function() {
        const time = $(this).closest('li').text();
        classTimeDelete.push(time);
        $(this).closest('li').remove();
    });

    $('#courseEditButton').click(function() {
        const data = {};
        data.nickName = $('#nickName').val();
        data.code = $('#code').val();
        data.fullName = $('#fullName').val();
        data.section = $('#section').val();
        data.classRoom = $('#classRoom').val();
        data.classTimeAdd = classTimeAdd;
        data.classTimeDelete = classTimeDelete;
        data.description = $('#description').val();
        
        $(this).html('Submitting..');
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/course/'+courseNo+'/view',         
                success: function(data, status) {
                    if (status === 'success') {
                        window.location.href = postPath+'/course/'+courseNo+'/view';
                    }
                }
            });
        $(this).html('Submit'); 
    });


});