using Html5Offline.Data_Layer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Html5Offline.Business_Layer
{
    public class Todo
    {
        TodoDataClassDataContext mContext { get; set; }

        TodoDataClassDataContext DataContext
        {
            get
            {
                if (mContext == null)
                    mContext = new TodoDataClassDataContext();
                return mContext;
            }
        }

        public ToDo GetToDoById(Guid id)
        {
            var query = from q in DataContext.ToDos
                        where q.Id.Equals(id)
                        select q;
            return query.FirstOrDefault();
        }

        public List<ToDo> GetAllToDos()
        {
            var query = from q in DataContext.ToDos
                        orderby q.Title descending
                        select q;
            return query.ToList();
        }

        public List<ToDo> GetAllToDosForGraterRevision(int revision)
        {
            var query = from q in DataContext.ToDos
                        orderby q.Title descending
                        where q.Revision > revision
                        select q;
            return query.ToList();
        }

        public int GetMaxRevision()
        {
            var query = from q in DataContext.ToDos
                        orderby q.Revision descending
                        select q;
            var first = query.FirstOrDefault();
            if (first != null && first.Revision != null)
                return (int)first.Revision;
            return 0;
        }

        public bool InsertToDo(ToDo todo)
        {
            bool result = false;
            try
            {
                DataContext.ToDos.InsertOnSubmit(todo);
                DataContext.SubmitChanges();
                result = true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
            }
            return result;
        }

        public bool UpdateToDo(ToDo todo)
        {
            bool result = false;
            try
            {
                var obj = GetToDoById(todo.Id);
                if (todo.Title!=null)
                {
                    obj.Title = todo.Title;
                    obj.Description = todo.Description;
                }
                obj.IsDone = todo.IsDone;
                obj.Revision = todo.Revision;
                DataContext.SubmitChanges();
                result = true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
            }
            return result;
        }

        public bool InsertToDoList(List<ToDo> todoList)
        {
            bool result = false;
            try
            {
                DataContext.ToDos.InsertAllOnSubmit(todoList);
                DataContext.SubmitChanges();
                result = true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
            }
            return result;
        }

        public bool InsertOrUpdateToDoList(List<ToDo> todoList, int revision)
        {
            bool result = false;
            try
            {
                foreach(var todo in todoList)
                {
                    todo.Revision = revision + 1;
                    var obj = GetToDoById(todo.Id);
                    if (obj == null)
                        InsertToDo(todo);
                    else
                        UpdateToDo(todo);
                }
                result = true;
            }catch(Exception e)
            {
                Console.WriteLine(e.ToString());
            }
            return result;
        }
    }

}