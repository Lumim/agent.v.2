$(document).ready(function(){
    // Initiate some actions
    var educationList = $("ul.education");
    //educationList.off('click');
    educationList.on('click', 'li a', function () {
        var idx = educationList.children().index($(this).closest('li'));
        deleteFunction('education', idx, $(this).closest('li'));
    });

    var experienceList = $("ul.experience");
    experienceList.on('click', 'li a', function () {
        var idx = experienceList.children().index($(this).closest('li'));
        deleteFunction('experience', idx, $(this).closest('li'));
    });

    var aapList = $("ul.aap");
    aapList.on('click', 'li a', function () {
        var idx = aapList.children().index($(this).closest('li'));
        deleteFunction('awardsAccomplishmentsAndPapers', idx, $(this).closest('li'));
    });

    var officeList = $("ul.office");
    officeList.on('click', 'li a', function () {
        var idx = officeList.children().index($(this).closest('li'));
        deleteFunction('office', idx, $(this).closest('li'));
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
        const txt = prompt('Name', '');
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
        const txt = prompt('ID','');
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
                        i.classList.add("fa-trash");
                        i.classList.add('delete');

                        const a = document.createElement("a");
                        a.classList.add('delete');
                        a.setAttribute('href', 'javascript:;'); //attr() doesn't work
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
                        
                        $(educationList).append(newItem);
                    }
                }
            });
            $(this).html('Submit');      
        }
    });

    $('button.experience').click(function() {
        const title = $('#title').val();
        const company = $('#company').val();
        const fromYear = $('#experienceFromYear').val();
        const toYear = $('#experienceToYear').val();
        if(!(title === '' && company === '' && fromYear === '' && toYear === '')) {
            $(this).html('Submitting..');
            const data = {};
            data.title = title;
            data.company = company;
            data.fromYear = fromYear;
            data.toYear = toYear;
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/profile/experience',         
                success: function(data, status) {
                    if (status === 'success') {
                        const i = document.createElement("i");
                        i.classList.add("fa");
                        i.classList.add("fa-trash");
                        i.classList.add('delete');

                        const a = document.createElement("a");
                        a.classList.add('delete');
                        a.setAttribute('href', 'javascript:;'); //attr() doesn't work
                        a.append(i);

                        const col10 = document.createElement('div');
                        col10.classList.add('col-10');
                        
                        if(title != '') {
                            var span = document.createElement('span');
                            span.innerHTML = "<b>" + title + "</b>" + "<br/>";
                            col10.appendChild(span);
                        }
                        if(company != '') {
                            var span = document.createElement('span');
                            span.innerHTML = company + "<br/>";
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
                        
                        $(experienceList).append(newItem);
                    }
                }
            });
            $(this).html('Submit');      
        }
    });

    $('button.aap').click(function() {
        const title = $('#aaptitle').val();
        const description = $('#description').val();
        const year = $('#year').val();
        if(!(title === '' && description === '' && year === '')) {
            $(this).html('Submitting..');
            const data = {};
            data.title = title;
            data.description = description;
            data.year = year;
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/profile/aap',         
                success: function(data, status) {
                    if (status === 'success') {
                        const i = document.createElement("i");
                        i.classList.add("fa");
                        i.classList.add("fa-trash");
                        i.classList.add('delete');

                        const a = document.createElement("a");
                        a.classList.add('delete');
                        a.setAttribute('href', 'javascript:;'); //attr() doesn't work
                        a.append(i);

                        const col10 = document.createElement('div');
                        col10.classList.add('col-10');
                        
                        if(title != '') {
                            var span = document.createElement('span');
                            span.innerHTML = "<b>" + title + "</b>" + "<br/>";
                            col10.appendChild(span);
                        }
                        if(description != '') {
                            var span = document.createElement('span');
                            span.innerHTML = description + "<br/>";
                            col10.appendChild(span);
                        }
                        if(year != '') {
                            var span = document.createElement('span');
                            span.innerHTML = year + "<br/>";
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
                        
                        $(aapList).append(newItem);
                    }
                }
            });
            $(this).html('Submit');      
        }
    });

    $('button.office').click(function() {
        const room = $('#room').val();
        const day = $('#day').val();
        const startHour = $('#startHour').val();
        const startMin = $('#startMin').val();
        const amOrPm1 = $('#amOrPm1').val();
        const endHour = $('#endHour').val();
        const endMin = $('#endMin').val();
        const amOrPm2 = $('#amOrPm2').val();
        const timePeriod = day+': '+startHour+':'+startMin+' '+amOrPm1+' - '+endHour+':'+endMin+' '+amOrPm2;

        if(!(room === '')) {
            $(this).html('Submitting..');
            const data = {};
            data.room = room;
            data.timePeriod = timePeriod;
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/profile/office',         
                success: function(data, status) {
                    if (status === 'success') {
                        const i = document.createElement("i");
                        i.classList.add("fa");
                        i.classList.add("fa-trash");
                        i.classList.add('delete');

                        const a = document.createElement("a");
                        a.classList.add('delete');
                        a.setAttribute('href', 'javascript:;'); //attr() doesn't work
                        a.append(i);

                        const col10 = document.createElement('div');
                        col10.classList.add('col-10');
                        
                        if(room != '') {
                            var span = document.createElement('span');
                            span.innerHTML = "<b>" + room + "</b>" + "<br/>";
                            col10.appendChild(span);
                        }
                        if(timePeriod != '') {
                            var span = document.createElement('span');
                            span.innerHTML = timePeriod + "<br/>";
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
                        
                        $(officeList).append(newItem);
                    }
                }
            });
            $(this).html('Submit');      
        }
    });

    const deleteFunction = function(type, index, item) {
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
});