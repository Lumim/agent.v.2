$(document).ready(function(){
    $('.toggle').css('display', 'none');

    $('#postButton').click(function() {
        const data = {};
        data.text = $('#message').val();
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/post',                      
                success: function(data, status) {
                    if (status === 'success') {

                        const card = $('<div>', {
                            class: 'card',
                        }).prependTo('#posts-list');

                        const cardBlock = $('<div>', {
                            class: 'card-block',
                        }).appendTo(card);

                        const media = $('<div>', {
                            class: 'media',
                        }).appendTo(cardBlock);

                        const image = $('<img>', {
                            class: 'd-flex mr-3',
                            src: '/'+data.message.posterImage.path,
                            width: '50',
                            height: '50',
                           
                        }).appendTo(media);

                        const mediaBody = $('<div>', {
                            class: 'media-body',
                            "data-id": data.message._id,
                        }).appendTo(media);

                        const span = $('<span>', {
                            text: data.message.text,
                        }).appendTo(mediaBody);

                        const br = $('<br>', {
                        }).appendTo(mediaBody);
                        
                        const small = $('<small>', {
                            text: data.message.date,
                        }).appendTo(mediaBody);

                        const a0 = $('<a>', {
                            class: 'ml-2',
                            href: '/user/'+data.message.username+'/profile',
                            text: data.message.posterName,
                        }).appendTo(small);

                        const a1 = $('<a>', {
                            class: 'ml-2 comments',
                            href: 'javascript:;',
                            text: 'Comments',
                        }).appendTo(small);
                        
                        const a2 = $('<a>', {
                            class: 'ml-2 addComment',
                            href: 'javascript:;',
                            "data-toggle": 'modal',
                            "data-target": '#commentModal',
                            text: 'Add comments',
                        }).appendTo(small);

                        const a3 = $('<a>', {
                            class: 'ml-2 edit',
                            href: 'javascript:;',
                            "data-toggle": 'modal',
                            "data-target": '#editModal',
                            text: 'Edit',
                        }).appendTo(small);

                        const a4 = $('<a>', {
                            class: 'ml-2 delete',
                            href: 'javascript:;',
                            text: 'Delete',
                        }).appendTo(small);

                        const toggle = $('<div>', {
                            class: 'toggle',
                        }).appendTo(mediaBody);
                    }
                }
            });
    });

    var postID, toggle;

    $('#posts-list').on('click', ' .addComment', function () {
        postID = $(this).closest('.media-body').data('id');
        toggle = $(this).closest('.media-body').find('.toggle');
    });

    $('#commentButton').click(function() {
        const data = {};
        data.text = $('#comment').val();
        data.postID = postID;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/post/comment',                      
                success: function(data, status) {
                    if (status === 'success') {
                        const media = $('<div>', {
                            class: 'media mt-3',
                        }).appendTo(toggle);

                        const image = $('<img>', {
                            class: 'd-flex mr-3',
                            src: '/'+data.message.posterImage.path,
                            width: '30',
                            height: '30',
                           
                        }).appendTo(media);

                        const mediaBody = $('<div>', {
                            class: 'media-body',
                            "data-id": data.message._id,
                        }).appendTo(media);

                        const span = $('<span>', {
                            text: data.message.text,
                        }).appendTo(mediaBody);

                        const br = $('<br>', {
                        }).appendTo(mediaBody);
                        
                        const small = $('<small>', {
                            text: data.message.date,
                        }).appendTo(mediaBody);

                        const a0 = $('<a>', {
                            class: 'ml-2',
                            href: '/user/'+data.message.username+'/profile',
                            text: data.message.posterName,
                        }).appendTo(small);

                        const a1 = $('<a>', {
                            class: 'ml-2 edit',
                            href: 'javascript:;',
                            "data-toggle": 'modal',
                            "data-target": '#editModal',
                            text: 'Edit',
                        }).appendTo(small);

                        const a2 = $('<a>', {
                            class: 'ml-2 delete',
                            href: 'javascript:;',
                            text: 'Delete',
                        }).appendTo(small);
                    }
                }
            });
    });

    $('#posts-list').on('click', ' .comments', function () {
        const element = $(this).closest('.media-body').find('.toggle');
        if (element.css('display') === 'none') {
            element.css('display', 'block');
        } else {
            element.css('display', 'none');
        }
    });

    var element;
    $('#posts-list').on('click', ' .edit', function () {
        element = $(this).closest('.media-body').children('span');
        const text = $(this).closest('.media-body').children('span').text();
        $('#editMessage').val(text);
        postID = $(this).closest('.media-body').data('id');
    });

    $('#editButton').click(function() {
        const text = $('#editMessage').val();
        const data = {};
        data.text = text;
        data.postID = postID;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/post/edit',                      
                success: function(data, status) {
                    if (status === 'success') {
                        element.html(text + '<br>');
                    }
                }
            });
    });

    $('#posts-list').on('click', ' .delete', function () {
        postID = $(this).closest('.media-body').data('id');
        const mediaElement = $(this).closest('.media');
        const cardElement = $(this).closest('.card');
        const data = {};
        data.postID = postID;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/post/delete',                      
                success: function(data, status) {
                    if (status === 'success') {
                        if (data.type == 1)
                            cardElement.remove();
                        else
                            mediaElement.remove();
                    }
                }
            });
    });
});