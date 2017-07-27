$('#signup_form').validate({
  rules: {
    repassword: {
      equalTo: '#password'
    },
    portal: {
      required: true,
    }
  },
  messages: {
    repassword: {
      equalTo: 'Must match with password typed above'
    },
    portal: {
      required: 'Have to select faculty or student'
    }
  },
  errorClass: 'alert alert-danger'
});