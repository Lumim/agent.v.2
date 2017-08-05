$(document).ready(function(){
    $('.delete').on('click', function () {
        var index = $(this).data('index');
        const data = {};
        data.groupNo = index;
        $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/group/delete',                      
                success: function(data, status) {
                    if (status === 'success') {
                        location.reload();
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
    
    var elemet;
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
		data.groupNo = element.data('index');
		data.members = new Array(); 

		var checkedValues = $('input[name="members"]:checked').map(function() {
		    return $(this).val();
		}).get();
		selectedMembers = checkedValues;

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
            data.groupNo = $(this).data('index');
            $.ajax({
                type: 'POST',
                data: JSON.stringify(data),
                contentType: 'application/json',
                url: postPath+'/group/name',                      
                success: function(data, status) {
                    if (status === 'success') {
                        if (type === 'groupNameEdit')
                        	$('.name').text(txt);
                        else
                        	$('.title').text(txt);
                    }
                }
            });
        } 
    });
    
});