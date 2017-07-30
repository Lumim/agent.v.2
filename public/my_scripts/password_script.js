$(document).ready(function(){
  $("#password-button").click(function(){
    $("#password-button").html('Submitting..');

    $('#cpassword-error').empty();
    $('#npassword-error').empty();
    $('#rpassword-error').empty();

    const data = {};
    data.cpassword = $('#cpassword').val();
    data.npassword = $('#npassword').val();
    data.rpassword = $('#rpassword').val();

    $.ajax({
              type: 'POST',
              data: JSON.stringify(data),
              contentType: 'application/json',
              url: postPath+'/profile/password',                      
              success: function(data, status) {
                  if (status === 'success') {
                      if(data.cpassword && data.npassword && data.rpassword) {
                        window.location.href = "/";
                      }
                      if (data.cpassword === false) {
                        $('#cpassword-error').html('Wrong password');
                      }
                      if (data.npassword === false) {
                        $('#npassword-error').html('Password should be at least 6 characters and at most 30 characters');
                      }
                      if (data.rpassword === false) {
                        $('#rpassword-error').html('Passwords do not match');
                      }
                  }   
              }
          });
          $("#signup-button").html('Submit');
  });
});