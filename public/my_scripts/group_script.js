$(document).ready(function(){
    $('.delete').on('click', function () {
        const index = $(this).closest('#group-list').children().index($(this).closest('.card'));
       	const element = $(this);
        const data = {};
        data.groupNo = index;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/group/delete',                      
                success: function(data, status) {
                    if (status === 'success') {
                        element.closest('.card').remove();
                        for(let i=0; i<data.members.length; i++) {
                        	nominies.push({name: data.members[i].name, email: data.members[i].email});
                        }
                    }
                }
        	});
    });

    $('.remove').on('click', function () {
        const index1 = $(this).closest('#group-list').children().index($(this).closest('.card'));
        const index2 = $(this).closest('.member-list').children().index($(this).closest('span'));
        const element = $(this);
        const data = {};
        data.groupNo = index1;
        data.memberNo = index2;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/group/remove',                      
                success: function(data, status) {
                    if (status === 'success') {
                        element.closest('span').remove();
                        nominies.push({name: data.name, email: data.email});
                    }
                }
        	});
    });

    $('#newGroup').click(function() {
    	$('.nominies').empty();
    	for(let i=0; i<nominies.length; i++) {
			const input = document.createElement("input");
			input.setAttribute("type", "checkbox");
			input.setAttribute('value', i);
			input.setAttribute('name', 'members');
			input.classList.add('mt-2');
			const span = document.createElement("span");
			span.innerHTML = nominies[i].name + "<br/>";
			span.classList.add('ml-1');
			$('.nominies').append(input);
			$('.nominies').append(span);
		}
    });

    $('#group-button').click(function() {
		var checkedValues = $('input[name="members"]:checked').map(function() {
		    return $(this).val();
		}).get();
		selectedMembers = checkedValues;

		const data = {};
		data.groupName = $('#groupName').val();
		data.taskTitle = $('#taskTitle').val();
		data.members = new Array(); 
		for(let i=0; i<selectedMembers.length; i++) {
			data.members.push({name: nominies[selectedMembers[i]].name, 
							   email: nominies[selectedMembers[i]].email});
		}

		$.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/group',                      
                success: function(data, status) {
                    if (status === 'success') {
                        location.reload();
                    }
                }
        	});
	});
    
    var element;
    $('.newMember').click(function() {
    	element = $(this);
    	$('.nominies').empty();
    	for(let i=0; i<nominies.length; i++) {
			const input = document.createElement("input");
			input.setAttribute("type", "checkbox");
			input.setAttribute('value', i);
			input.setAttribute('name', 'members');
			input.classList.add('mt-2');
			const span = document.createElement("span");
			span.innerHTML = nominies[i].name + "<br/>";
			span.classList.add('ml-1');
			$('.nominies').append(input);
			$('.nominies').append(span);
		}
		
    });

    $('#member-button').click(function() {
		const data = {};
		data.groupNo = $(element).closest('#group-list').children().index($(element).closest('.card'));
		data.members = new Array(); 

		var checkedValues = $('input[name="members"]:checked').map(function() {
		    return $(this).val();
		}).get();
		const selectedMembers = checkedValues;

		for(let i=0; i<selectedMembers.length; i++) {
			data.members.push({name: nominies[selectedMembers[i]].name, 
							   email: nominies[selectedMembers[i]].email});
		}
		$.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/group/add',                      
                success: function(data, status) {
                    if (status === 'success') {
                        location.reload();
                        /*
                        for(let j=0; j<selectedMembers.length; j++) {
                        	const name = nominies[selectedMembers[j]].name;
                        	const email = nominies[selectedMembers[j]].email;

							const i = document.createElement("i");
	                        i.classList.add("fa");
	                        i.classList.add("fa-times");
	                        i.classList.add('remove');

	                        const a = document.createElement("a");
	                        a.classList.add('remove');
	                        a.classList.add('ml-2')
	                        a.setAttribute('href', 'javascript:;'); //attr() doesn't work
	                        a.setAttribute('title', 'Remove');
	                        a.append(i);

	                        var span = document.createElement('span');
	                        span.classList.add('member');
	                        span.classList.add('mr-3');
                            span.innerHTML = name;
                            span.append(a);

                            $('.member-list').append(span);
						}
						*/
                    }
                }
        	});
	});

	$('.groupNameEdit, a.taskTitleEdit').click(function(){
		const classList = $(this).attr('class').split(' ');
		const type = classList[1];
		let txt;
		if (type === 'groupNameEdit')
        	txt = prompt('Group Name', '');
        else
        	txt = prompt('Task Title', '');
        
        if (!(txt == null || txt == '')) {
            const data = {};
            data.type = type;
            data.txt = txt;
            data.groupNo = $(this).closest('#group-list').children().index($(this).closest('.card'));
            const element = $(this);
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/group/name',                      
                success: function(data, status) {
                    if (status === 'success') {
                        if (type === 'groupNameEdit')
                        	element.closest('h5').find('span').text(txt);
                        else
                        	element.closest('p').find('span').text(txt);
                    }
                }
            });
        } 
    });

    $('.discussion').click(function() {
    	const groupNo = $(this).closest('#group-list').children().index($(this).closest('.card'));
       	window.location.href = postPath+'/group/'+groupNo+'/discussion';
    });

    $('.document').click(function() {
    	const groupNo = $(this).closest('#group-list').children().index($(this).closest('.card'));
       	window.location.href = postPath+'/group/'+groupNo+'/document';
    });
    
});