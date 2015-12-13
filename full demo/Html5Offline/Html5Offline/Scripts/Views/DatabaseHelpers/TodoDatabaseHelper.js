//this javascript file handle the communication with localDb and onlineDb
//local DB is an IndexedDb
//online DB is an sqlServer Db
//Communication with Online Db is handled by a serviceController


//--------------------------- Shared configurations for IndexedDb --------------------------------------///
var config = {
    dbName: 'ToDOoDatabase',
    version: 1,
    TodoObjectStoreName: 'ToDo',
    appID: 123
};

var databaseDefinition = [{
    version: config.version,
    //an object store in the IndexedDb is like a table in the sqlServer DB
    objectStores: [{ name: config.TodoObjectStoreName, objectStoreOptions: { autoIncrement: false, keyPath: "Id" } },
    ],
    //indexedDb uses indexes to search objects
    indexes: [{ objectStoreName: config.TodoObjectStoreName, propertyName: "Id", indexOptions: { unique: true, multirow: false } }
    ]
}];

var dbConfig = {
    version: config.version,
    definition: databaseDefinition
};

var db = window.linq2indexedDB(config.dbName, dbConfig, false);

//---------------------------END Shared configurations for IndexedDb --------------------------------------///



var TodoModule = (function () {
    //saving the current version of the Todo ObjectStore (table in sql) in a localStorage object
    if (!localStorage.TodoRevision) {
        localStorage.TodoRevision = -1;
    }

    //return local todoList in the callback function
    function getTodosFromLocalDb(callback) {
        if (!callback) return;
        //global variable to hold data
        var todoList = [];
        window.db.linq.from(window.config.TodoObjectStoreName).select().then(function () {
            callback(todoList);
        }, function () { }, function (sdata) {
            //this function is like a loop on the local Todo objects
            todoList.push(sdata);
        });
    }

    function updateTodoInLocalDb(item, value, success) {
        window.db.linq.from(window.config.TodoObjectStoreName).select().then(function () {
            if (success) success();
        }, function () { }, function (sdata) {
            if (sdata.Id == item.Id) {
                sdata.IsDone = item.IsDone;
                sdata.Revision = -1;
                saveTodoInLocalDb(sdata);
                return;
            }
        });
    }

    //insert or update in the local Db
    function saveTodoInLocalDb(todo, success, appendFunction) {
        var ids = [];

        if ((todo.Id && todo.Id.length != 0) || $.inArray(todo.Id, ids) > -1) {
            //if the id is already generated --> todo exists in the local db
            todo.Revision = todo.Revision + 1;
            window.db.linq.from(config.TodoObjectStoreName).update(todo).then(function (data) {
                //window.requestFormModule.showRequestForm(data.object);
                //update succes function
                if (success)
                    success();
                if (appendFunction) {
                    appendFunction(todo.Id, todo.Title, todo.Description, todo.IsDone);
                }
            });
        } else {
            todo.Id = generateGuid();
            todo.Revision = -1;
            window.db.linq.from(config.TodoObjectStoreName).insert(todo).then(function (data) {
                //window.requestFormModule.showRequestForm(data.object);
                //insert succes function
                if (success)
                    success();
                if (appendFunction) 
                    appendFunction(todo.Id, todo.Title, todo.Description, todo.IsDone);
            });
        }
    }

    //--------------------------------- synchronization of offline and online databases ----------------------------

    //push data to the server
    function syncServerDbFromLocalDb() {
        var todos = [];
        window.db.linq.from(window.config.TodoObjectStoreName).select().then(function () {
            if (todos.length > 0) {
                var postData = {
                    revision: parseInt(localStorage.TodoRevision, 10),
                    appID: window.config
                        .appID,
                    Todos: todos
                };
                $.ajax({
                    url: '../api/TodoService',
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify(postData),
                    success: function (data) {
                        if (data.Revision == localStorage.TodoRevision) {
                            alert('There is newer version on the server. Please Sync from server first.');
                        } else {
                            //when data is saved correctly online, the server will return a list containing updates (basically on the revision) on the saved data
                            syncData(data);
                        }
                    }
                });
            } else {
                alert('There is no change in data after your last synchronization.');
            }
        }, handleError("syncServerDbFromLocalDb"), function (data) {
            if (data.Revision == -1) {
                todos.push(data);
            }
        });
    };

    //pull data from server
    function syncLocalTodoDataFromServer(callback) {
        $.ajax({
            url: '../api/TodoService?revision=' + localStorage.TodoRevision,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.Revision == localStorage.TodoRevision) {
                    console.log('You are already working on the latest version.');
                    //window.CasaModule.getCasaData(window.requestFormModule.addCasaToSelectBox);
                    //window.requestFormModule.controlLoaded();
                    if (callback)
                        callback();
                }
                else {
                    syncData(data, callback);
                }
            }, error: function () {
                if (callback)
                    callback();
            }
        });
    }

    //insert or update online data in the localsDb
    function syncData(data, callback) {
        var ids = [];
        window.db.linq.from(window.config.TodoObjectStoreName).select(["Id"]).then(function () {
            $.each(data.Todos, function () {
                if ($.inArray(this.Id, ids) > -1) {
                    //update
                    window.db.linq.from(window.config.TodoObjectStoreName).update(this).then(function (data) {
                    }, function (error) {
                        alert('updating error ' + error);
                    });
                } else {
                    //insert
                    window.db.linq.from(window.config.TodoObjectStoreName).insert(this).then(function (data) {
                    }, function (error) {
                        alert('inserting error ' + error);
                    });
                }

            });
            //Rebind Grid
            localStorage.TodoRevision = data.Revision;

            if (callback)
                callback(this);
            alert('data synchronized successfully');

            //alert('The synchronization of Casas has been completed successfully.');
            //window.requestFormModule.controlLoaded();
        }, handleError("syncData"), function (data) {
            ids.push(data.Id);
        });
    }
    //---------------------------------END synchronization of offline and online databases ----------------------------

    function handleError(errorFunction) {
        console.log('an error occured in ' + errorFunction);
    }

    function saveTodoListOnline(todos) {
        //push data to the server
        if (todos.length > 0) {
            var postData = {
                revision: parseInt(localStorage.TodoRevision, 10),
                appID: window.config
                    .appID,
                Todos: todos
            };
            $.ajax({
                url: '../api/TodoService',
                type: 'POST',
                dataType: 'json',
                contentType: "application/json",
                data: JSON.stringify(postData),
                success: function (data) {
                    if (data.Revision == localStorage.TodoRevision) {
                        alert('There is newer version on the server. Please Sync from server first.');
                    } else {
                        syncData(data);
                    }
                }
            });
        } else {
            alert('There is no change in data after your last synchronization.');
        }

    }

    function generateGuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    };

    //in this return object we define which functions are publics
    return {
        saveTodoListOnline:saveTodoListOnline,
        getTodosFromLocalDb: getTodosFromLocalDb,
        saveTodoInLocalDb :saveTodoInLocalDb ,
        updateTodoInLocalDb: updateTodoInLocalDb,
        syncServerDbFromLocalDb: syncServerDbFromLocalDb,
        syncLocalTodoDataFromServer: syncLocalTodoDataFromServer,
        generateGuid: generateGuid
    }
})();