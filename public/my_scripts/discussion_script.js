$(document).ready(function(){
    $('.toggle').css('display', 'none');

    $('#discussionButton').click(function() {
        const data = {};
        data.text = $('#message').val();
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/discussion',                      
                success: function(data, status) {
                    if (status === 'success') {
                        location.reload();
                    }
                }
            });
    });

    var postID;
    $('.addComment').click(function() {
        postID = $(this).closest('.media-body').data('id');
    });

    $('#commentButton').click(function() {
        const data = {};
        data.text = $('#comment').val();
        data.postID = postID;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/discussion/comment',                      
                success: function(data, status) {
                    if (status === 'success') {
                        location.reload();
                    }
                }
            });
    });

    $('.comments').click(function() {
        const element = $(this).closest('.media-body').find('.toggle');
        if (element.css('display') === 'none') {
            element.css('display', 'block');
        } else {
            element.css('display', 'none');
        }
    });

    $('.edit').click(function() {
        const text = $(this).closest('.media-body').children('span').text();
        $('#editMessage').val(text);
        postID = $(this).closest('.media-body').data('id');
    })

    $('#editButton').click(function() {
        const data = {};
        data.text = $('#editMessage').val();
        data.postID = postID;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/discussion/edit',                      
                success: function(data, status) {
                    if (status === 'success') {
                        location.reload();
                    }
                }
            });
    });

    $('.delete').click(function() {
        postID = $(this).closest('.media-body').data('id');
        const data = {};
        data.postID = postID;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/discussion/delete',                      
                success: function(data, status) {
                    if (status === 'success') {
                        location.reload();
                    }
                }
            });
    });
});