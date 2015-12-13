using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Routing;


namespace Html5Offline.Controllers.Services
{

    public class TodoServiceController : ApiController
    {        public dynamic Get()
        {
            int x = 2;
            x += 2;
            return null;
        }
        /// <summary>
        /// To get the latest changes after the revision
        /// </summary>
        /// <param name="revision"></param>
        /// <returns></returns>

        public dynamic Get(int revision)
        {

            var Todo = new Business_Layer.Todo();

            int currentRevision = Todo.GetMaxRevision();
            if (revision == -1)
            {
                return new
                {
                    Revision = currentRevision,
                    Todos = Todo.GetAllToDos()
                    .Select(x => new
                    {
                        Id = x.Id,
                        Title = x.Title,
                        Description = x.Description,
                        IsDone = x.IsDone,
                        Revision = x.Revision ?? 0
                    }).ToList()

                };
            }
            else if (revision == currentRevision)
            {
                return new { Revision = currentRevision };
            }
            else
            {
                return new
                {
                    Revision = currentRevision,
                    //to be changed when copying this code
                    Todos = Todo.GetAllToDosForGraterRevision(revision)
                    .Select(x => new
                    {
                        Id = x.Id,
                        Title = x.Title,
                        Description = x.Description,
                        IsDone = x.IsDone,
                        Revision = x.Revision ?? 0
                    }).ToList()
                };
            }
        }


        private readonly object _updatePointsLock = new object();
        /// <summary>
        /// To save the changes
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public dynamic Post(JObject data)
        {
            dynamic json = data;
            int revision = json.revision;
            int appID = json.appID;

            List<Data_Layer.ToDo> todoList = ((JArray)json.Todos).Select(t => new Data_Layer.ToDo
            {
                Id = ((dynamic)t).Id,
                Title = ((dynamic)t).Title,
                Description = ((dynamic)t).Description,
                IsDone = ((dynamic)t).IsDone,
                Revision = ((dynamic)t).Revision ?? 0
            }).ToList();


            lock (_updatePointsLock)
            {
                var Todo = new Business_Layer.Todo();
                int currentRevision = Todo.GetMaxRevision();
                //check version
                if (currentRevision == revision)
                {
                    Todo.InsertOrUpdateToDoList(todoList, currentRevision);
                    return new
                    {
                        Revision = Todo.GetMaxRevision(),
                    Todos = Todo.GetAllToDosForGraterRevision(revision).Select(x => new
                        {
                            Id = x.Id,
                            Title = x.Title,
                            Description = x.Description,
                            IsDone = x.IsDone,
                            Revision = x.Revision
                        }).ToList()
                    };
                }
                else
                {
                    return new { Revision = revision };
                }

            }
        }
    }
}
