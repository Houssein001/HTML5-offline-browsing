
$(function () {
    IndexModule.init();
})

var IndexModule = (function () {
    function init() {
        syncDataAndGetTodoInformations();
        setOnBtnAddClickListener();
        setOnBtnSaveListener();
        cacheStatusEventListener();
        setOnClearCacheClickListener();
    }

    function setOnClearCacheClickListener() {
        $("#clearcache").click(function () {
            clearCache();
        });
    }

    function syncDataAndGetTodoInformations() {
        if (window.ConnectionStatusModule.isOnline()) {
            //    //get data from online database
            window.TodoModule.syncLocalTodoDataFromServer(getTodoInformations);
        } else {
            //get data from local database
            getTodoInformations();
        }
    }

    function getTodoInformations() {
        window.TodoModule.getTodosFromLocalDb(fillTableInfo);
    }

    function fillTableInfo(todoList) {

        for (var i = 0; i < todoList.length; i++) {
            var id = todoList[i].Id;
            var title = todoList[i].Title;
            var description = todoList[i].Description;
            var isDone;
            if (todoList[i].IsDone != 'undefined')
                isDone = todoList[i].IsDone;
            appendItem(id, title, description, isDone);
        }
    }

    function appendItem(id, title, description, isDone) {
        var element = $("#todos #todoList");
        if (!element) return;
        var checkboxLine;
        if (isDone)
            checkboxLine = '<input type="checkbox" class="checkbox" checked id="' + id + '">';
        else
            checkboxLine = '<input type="checkbox" class="checkbox" id="' + id + '">';

        var li = '<li class="treeview">';
        li += '<label name="todoId" hidden>' + id + '</label>';
        li += '<a href="#">' + checkboxLine + '<span class="title">' + title + '</span></a> <i class="fa fa-angle-left pull-right"></i></a>';

        li += '<ul class="treeview-menu">' + '<li class+"description">' + description + '</li>' + '</ul>';
        li += '</ul>';
        element.append(li);
    }


    function setOnBtnSaveListener() {
        $("#btnSave").click(function () {
            var todoList = [];
            $(".checkbox").each(function () {
                var item = {};
                item.Id = this.id;
                item.IsDone = this.checked;
                todoList.push(item);
                window.TodoModule.updateTodoInLocalDb(item);
            });
            window.TodoModule.saveTodoListOnline(todoList);
        });
    }

    function setOnBtnAddClickListener() {
        $('#btnAddTodo').click(function () {
            var todo = {};
            todo.Title = $('#txtTitle').val();
            todo.Description = $('#txtDescription').val();
            todo.Revision = -1;
            window.TodoModule.saveTodoInLocalDb(todo, window.TodoModule.syncServerDbFromLocalDb, appendItem);
        });
    }

    function clearCache() {
        $.ajax({
            url: '../Cache/RemoveUser?username=' + getUsername(),
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                //console.log("success -- " + data);
                applicationCache.update();
              
            },
            error: function (error) {
                //console.log("error -- " + error);
                applicationCache.update();
                
            }
        });
    }



    function cacheStatusEventListener() {
        var appCache = window.applicationCache;
        appCache.addEventListener('checking', function (event) {
            console.log("Checking for updates.");
        }, false);
        appCache.addEventListener('downloading', function (event) {
            console.log("Started Download.");
        }, false);
        appCache.addEventListener('progress', function (event) {
            console.log(event.loaded + " of " + event.total + " downloaded.");
        }, false);
        appCache.addEventListener('cached', function (event) {
            console.log("Done.");
        }, false);
        appCache.addEventListener('error', function (event) {
            console.log("Error");
        }, false);
        appCache.addEventListener('Obsolete', function (event) {
            console.log("Obsolete");
        }, false);
        appCache.addEventListener('cached', function (event) {
            console.log("Cached");
        }, false);
        appCache.addEventListener('no update', function (event) {
            console.log("there is no update for the application cache");
        }, false);
        appCache.addEventListener('updateready', function (event) {
            console.log("appCache update is ready");
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                window.applicationCache.swapCache();
                window.location.reload();
            }
        }, false);
    }




    return {
        init: init,
        clearCache: clearCache
    }
})();