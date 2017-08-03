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

  $('a.assesmentHeadAnchor').click(function() {
    const exam = ($(this).data('exam'));

    $('#assessmentHeadModal .assessmentName').text(exam.name);
    $('#assessmentHeadModal .assessmentDate').val(exam.date);
    $('#assessmentHeadModal .assessmentDate').text(exam.date);
    $('#assessmentHeadModal .assessmentTotalMark').val(exam.totalMark);
    $('#assessmentHeadModal .assessmentTotalMark').text(exam.totalMark);
    $('#assessmentHeadModal .assessmentHighestMark').text(exam.highestMark);
    var chart = new CanvasJS.Chart("chartContainer1",
    {
      title:{
        text: "Class Performance",
        fontSize: 25,
        fontWeight: "normal",
      },
      data: [
      {
        type: "pie",
        showInLegend: true,
        radius:  "50%", 
        legendText: "{indexLabel}",
        dataPoints: [
          { y: exam.pieChart[0], indexLabel: "0%-10%" },
          { y: exam.pieChart[1], indexLabel: "11%-20% " },
          { y: exam.pieChart[2], indexLabel: "21%-30%" },
          { y: exam.pieChart[3], indexLabel: "31%-40%"},
          { y: exam.pieChart[4], indexLabel: "41%-50%" },
          { y: exam.pieChart[5], indexLabel: "51%-60%"},
          { y: exam.pieChart[6], indexLabel: "61%-70%"},
          { y: exam.pieChart[7], indexLabel: "71%-80%" },
          { y: exam.pieChart[8], indexLabel: "81%-90%"},
          { y: exam.pieChart[9], indexLabel: "91%-100%"},
        ]
      }
      ]
    });
    chart.render();
  });

});