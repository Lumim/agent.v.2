$(document).ready(function(){
  $("#signup-button").click(function(){
    $("#signup-button").html('Submitting..');

    $('#name-error').empty();
    $('#email-error').empty();
    $('#username-error').empty();
    $('#password-error').empty();
    $('#repassword-error').empty();

    const data = {};
    data.name = $('#name').val();
    data.email = $('#email').val();
    data.username = $('#username').val();
    data.password = $('#password').val();
    data.repassword = $('#repassword').val();
    data.portal = $('input[name=portal]:checked').val();

    $.ajax({
              type: 'POST',
              data: JSON.stringify(data),
              contentType: 'application/json',
              url: 'http://localhost:3000/signup',                      
              success: function(data, status) {
                  if (status === 'success') {
                      if(data['valid'] === true) {
                        $('#success-message').css('display', 'block');
                        setTimeout(function() {
                          $('#success-message').fadeOut('fast');
                        }, 3000); // <-- time in milliseconds
                      }
                      else {
                        if (data['name'] === false) {
                         $('#name-error').html('Name cannot be empty');
                        }
                        if(data['email'] === false) {
                          if(data['emailType'] === 1)
                            $('#email-error').html('Invalid email');
                          else
                            $('#email-error').html('This email is already in use');
                        }
                        if(data['username'] === false) {
                          if(data['usernameType'] === 1)
                            $('#username-error').html('Username cannot be empty');
                          else
                            $('#username-error').html('This username is already taken');
                        }
                        if(data['password'] === false) {
                          $('#password-error').html('Password should be at least 6 characters and at most 30 characters');
                        }
                        if(data['repassword'] === false) {
                          $('#repassword-error').html('Passwords do not match');
                        }
                      }
                  }
              }
          });
          $("#signup-button").html('Submit');
  });
});