using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Html5Offline.Controllers
{
    public class BaseController : Controller
    {
        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            try
            {
                Session["UserName"] = User.Identity.Name;
                //string[] rolesArray = Roles.GetRolesForUser(User.Identity.Name);
                //ViewData["UserRole"] = rolesArray[0];
                //  ViewData["UserAccessLevel"] = (Utilities.GetAllAccessFeaturesBy(rolesArray.ToList()));
            }
            catch (Exception e)
            {
                RedirectToAction("login", "Account");
            }
        }
    }
}