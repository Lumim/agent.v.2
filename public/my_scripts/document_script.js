$(document).ready(function(){
    $('#new').click(function() {
        $('#status').empty();
    });

    $('#documents-list').on('click', 'a.delete', function () {
        const data = {};
        data.path = $(this).data('path');
        const element = $(this);
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/document/delete',                      
                success: function(data, status) {
                    if (status === 'success') {
                        element.closest('.card').remove();
                    }
                }
            });
    });

    
    $('#upload').submit(function() {
        $('#status').empty().text('File is uploading...');
         $(this).ajaxSubmit({
            error: function(xhr) {
                status('Error: ' + xhr.status);
            },
            success: function(data, status) {
                //location.reload();
                if (status === 'success') {
                    const i = document.createElement("i");
                    i.classList.add("fa");
                    i.classList.add("fa-trash");

                    const a = document.createElement("a");
                    a.classList.add('delete');
                    a.setAttribute('href', 'javascript:;'); //attr() doesn't work
                    a.setAttribute('title', 'Delete');
                    a.setAttribute('data-path', data.file.path);
                    a.append(i);

                    const col1 = document.createElement('div');
                    col1.classList.add('col-1');
                    col1.append(a);

                    const t = document.createTextNode(data.file.name);

                    const a1 = document.createElement("a");
                    a1.setAttribute('href', '/download/'+data.file.path);
                    a1.append(t);
                    
                    const cardTitle = document.createElement('div');
                    cardTitle.classList.add('card-title');
                    cardTitle.append(a1);
                    
                    const col11 = document.createElement('div');
                    col11.classList.add('col-11');
                    col11.append(cardTitle);

                    const row = document.createElement('div');
                    row.classList.add('row');
                    row.append(col11);
                    row.append(col1);

                    const t2 = document.createTextNode(data.file.posterName);

                    const a2 = document.createElement("a");
                    a2.classList.add('name')
                    a2.setAttribute('href', '/user/'+data.file.username+'/profile');
                    a2.append(t2);

                    const small = document.createElement('small');
                    small.append(a2);

                    const br = document.createElement('br');

                    const t3 = document.createTextNode(data.file.date);

                    const small1 = document.createElement('small');
                    small1.append(t3);

                    const cardBlock = document.createElement('div');
                    cardBlock.classList.add('card-block');
                    cardBlock.append(row);
                    cardBlock.append(small);
                    cardBlock.append(br);
                    cardBlock.append(small1);

                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.append(cardBlock);

                    $('#documents-list').prepend(card);

                    $('#status').empty().text('Successfully Uploaded.');
                }
            }
        });
        //Very important line, it disable the page refresh.
        return false;
    });   
});