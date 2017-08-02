$(document).ready(function(){
	$('#csvQ').click(function() {
		alert('Add several students at a time by uploadig a csv file.\n The order of data should be name, id, email.');
	});

	$('#uploadCSV').submit(function() {
        $('#status').empty().text('File is uploading...');
         $(this).ajaxSubmit({
            error: function(xhr) {
            	alert('Server error please try again');
                status('Error: ' + xhr.status);
            },
            success: function(data) {
            	if (data.fileEx === false)
            		alert('Please upload a file with extension csv');
            	else
               		location.reload();
            }
        });
        $('#status').empty();
        //Very important line, it disable the page refresh.
        return false;
        
    });

    $('#studentQ').click(function() {
		alert('Add single student.');
	});

	$('#studentButton').click(function() {
		const data = {};
		data.name = $('#name').val();
		data.ID = $('#ID').val();
		data.email = $('#email').val();
		$.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/marksheet/student',         
                success: function(data, status) {
                    if (status === 'success') {
                       if (data.name === false) {
                       		$('#name-error').text('Name cannot be empty');
                       }
                       if (data.email === false) {
                       		if (data.emailType === 1)
                       			$('#email-error').text('Email cannot be empty');
                       		else
                       			$('#email-error').text('It is a faculty email');
                       }
                       if (data.ID === false) {
                       		$('#ID-error').text('ID cannot be empty');
                       }
                       if (data.name === true && data.email === true && data.ID === true) {
                       		location.reload();
                       }
                    }
                }
            });
	});

	$('#assessmentButton').click(function() {
		const data = {};
		data.assessment = $('#assessment').val();
		$.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/marksheet/assessment',         
                success: function(data, status) {
                    if (status === 'success') {
                       location.reload();
                    }
                }
            });
	});
});