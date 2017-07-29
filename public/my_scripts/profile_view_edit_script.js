$(document).ready(function(){

    var final = $("ul.education");
    final.off('click');
    final.on('click', 'li a', function () {
        var idx = final.children().index($(this).closest('li'));
        deleteFunction('education', idx, $(this).closest('li'));
    });

    $('#uploadImage').submit(function() {
        $('#status').empty().text('File is uploading...');
         $(this).ajaxSubmit({
            error: function(xhr) {
                alert('Please upload a file with extension jpg|jpeg|png|gif');
                status('Error: ' + xhr.status);
            },
            success: function(response) {
                $('#image').attr('src', '/'+response.path);
            }
        });
        $('#status').empty();
        //Very important line, it disable the page refresh.
        return false;
    });   
    
    $('a.name').click(function(){
        const txt = prompt('');
        if (!(txt == null || txt == '')) {
            const data = {};
            data.name = txt;
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/profile/name',                      
                success: function(data, status) {
                    if (status === 'success') {
                        $('span.name').html(txt);
                    }
                }
            });
        }
    });

    $('a.ID').click(function(){
        const txt = prompt('');
        if (!(txt == null || txt == '')) {
            const data = {};
            data.ID = txt;
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/profile/ID',                      
                success: function(data, status) {
                    if (status === 'success') {
                        $('span.ID').html(txt);
                    }
                }
            });
        }
    });

    $('button.education').click(function() {
        const school = $('#school').val();
        const degree = $('#degree').val();
        const grade = $('#grade').val();
        const fromYear = $('#educationFromYear').val();
        const toYear = $('#educationToYear').val();
        if(!(school === '' && degree === '' && grade === '' && fromYear === '' && toYear === '')) {
            $(this).html('Submitting..');
            const data = {};
            data.school = school;
            data.degree = degree;
            data.grade = grade;
            data.fromYear = fromYear;
            data.toYear = toYear;
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/profile/education',         
                success: function(data, status) {
                    if (status === 'success') {
                        const i = document.createElement("i");
                        i.classList.add("fa");
                        i.classList.add("fa-times");
                        i.classList.add('delete');

                        const a = document.createElement("a");
                        a.append(i);

                        const col10 = document.createElement('div');
                        col10.classList.add('col-10');
                        
                        if(school != '') {
                            var span = document.createElement('span');
                            span.innerHTML = "<b>" + school + "</b>" + "<br/>";
                            col10.appendChild(span);
                        }
                        if(degree != '') {
                            var span = document.createElement('span');
                            span.innerHTML = degree + "<br/>";
                            col10.appendChild(span);
                        }
                        if(grade != '') {
                            var span = document.createElement('span');
                            span.innerHTML = grade + "<br/>";
                            col10.appendChild(span);
                        }
                        if(fromYear != '' && toYear != '') {
                            var span = document.createElement('span');
                            span.innerHTML = fromYear + ' - ' + toYear + "<br/>";
                            col10.appendChild(span);
                        }

                        const col2 = document.createElement('div');
                        col2.classList.add('col-2');
                        col2.appendChild(a);

                        const row = document.createElement('div');
                        row.classList.add('row');
                        row.appendChild(col10);
                        row.appendChild(col2);

                        const hr = document.createElement('hr');

                        const newItem = document.createElement("li");
                        newItem.appendChild(row);
                        newItem.appendChild(hr);
                        
                        $(final).append(newItem);
                        /*
                        $("ul.education").append(newItem).on('click', 'li a', function() {
                             alert('Please reload the page to delete');
                        });
                        */
                    }
                }
            });
            $(this).html('Submit');      
        }
    });

    const deleteFunction = function(type, index, item) {
        console.log(index);
        const data = {};
        data.index = index;
        data.type = type;
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: postPath+'/profile/delete',         
            success: function(data, status) {
                if (status === 'success') {
                    item.remove();
                }
            }
        });
    }

    /*
    $('a.delete.education').click(function() {
        const item = $(this).closest('li');  //list item
        const index = item.index();
        const data = {};
        data.index = index;
        data.type = 'education';
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: postPath+'/profile/delete',         
            success: function(data, status) {
                if (status === 'success') {
                    $('ul.education li').eq(index).remove();
                }
            }
        });
    });
    */
});