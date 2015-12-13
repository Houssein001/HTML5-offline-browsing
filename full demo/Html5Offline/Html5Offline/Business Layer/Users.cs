using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using Html5Offline.Data_Layer;

namespace Html5Offline.Business_Layer
{
    public class Users
    {
        TodoDataClassDataContext mContext{get; set;}

        TodoDataClassDataContext DataContext
        {
            get
            {
                if (mContext == null)
                    mContext = new TodoDataClassDataContext();
                return mContext;
            }
        }

        public List<User> GetDepartments()
        {
            var query = from q in DataContext.Users
                        orderby q.Username descending
                        select q;
            return query.ToList();
        }

        public bool checkUserPass(string username,string password)
        {
            var query = from q in DataContext.Users
                        where q.Username.Equals(username) & q.Password.Equals(password)
                        select q;
            return query.FirstOrDefault() != null;
        }

    }
}