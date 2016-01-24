(function() {

  var onContainerCrete = function(container) {
    var $btn = $(this);
    $btn.button('loading');
    vmId = $('#vm-combobox').val();
    vmName = $('#vm-combobox option:selected').text()
    var data = {
      name: $('#container-name-combobox').val(),
      cpuset: $('#container-cpuset-input').val(),
      mem_units: parseInt($('#container-mem-input').val())
    };
    $.ajax({
      url: '/api/vm/{0}/container'.format(vmId),
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data), 
      success: function(resp) {
        $btn.button('reset');
        $('#add-container-modal').modal('hide');
        resp.vm = {
          id: vmId,
          name: vmName
        };
        toastr.success('Container {0} is created on VM "{1}" (time={2}s)'.format(resp.name, resp.vm.name, resp.time));
        insert_row(resp);
      },
      error: function() {
        $btn.button('reset');
        toastr.error('Error creating container')
        console.error('Error creating container')
      }
    });
  };

  var onContainerStop = function() {
    var container = $(this).closest('tr').data('container');
    var vm = container.vm;
    var $btn = $(this).button('loading');
    $.post('/api/vm/{0}/container/{1}/stop'.format(vm.id, container.id), function(data) {
      $btn.button('reset');
      toastr.success('Container "{0}" is stopped on VM "{1}" in {2}s'.format(container.name, vm.name, data.time))
    }).fail(function() {
      $btn.button('reset');
      toastr.error('Error stopping container "{0}" on VM "{1}"'.format(container.name, vm.name));
      console.error('Error stopping container');
    });
  };

  var onContainerStart = function() {
    var container = $(this).closest('tr').data('container');
    var vm = container.vm;
    var $btn = $(this).button('loading');
    $.post('/api/vm/{0}/container/{1}/start'.format(vm.id, container.id), function(data) {
      $btn.button('reset');
      toastr.success('Container "{0}" is started on VM "{1}" in {2}s'.format(container.name, vm.name, data.time))
    }).fail(function() {
      $btn.button('reset');
      toastr.error('Error starting container "{0}" on VM "{1}"'.format(container.name, vm.name));
      console.error('Error starting container');
    });
  };

  var onVmDelete = function() {};

  var insert_row = function(container) {
    var $row = $('<tr>');
    var td = $('<td>').text(container.id).appendTo($row);
    $('<td>').text(container.vm.name).appendTo($row);
    $('<td>').text(container.name).appendTo($row);
    $('<td>').text(container.cpuset).appendTo($row);
    $('<td>').text('{0} ({1}gb)'.format(container.mem_units, container.mem)).appendTo($row);
    var $btnGroup = $('<div>').addClass('btn-group');
    $('<button>').addClass('btn btn-default').text('Delete').click(onVmDelete).appendTo($btnGroup);
    $('<button>').addClass('btn btn-default').text('Stop').click(onContainerStop).appendTo($btnGroup);
    $('<button>').addClass('btn btn-default').text('Start').click(onContainerStart).appendTo($btnGroup);
    $('<td>').append($btnGroup).appendTo($row);
    $row.appendTo($('#containers'));
    $row.data('container', container);
  };

  $(document).ready(function () {
    'use strict';

    $.get('/api/vm', function(data) {
      $.each(data, function(i, vm) {
        $('<option>').val(vm.id).text(vm.name).appendTo('#vm-combobox')
        $.each(vm.containers, function(j, container) {
          container.vm = vm;
          insert_row(container);
        });
      });
    });

    $('#create-container-btn').click(function() {
      var isValid = $('#add-container-form')[0].checkValidity();
      if (!isValid) {
        $('#add-container-form').find(':submit').click();
      } else {
        onContainerCrete.call(this);
      }
    });
  });

})();