using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Html5Offline.Controllers
{
    public class CacheController : Controller
    {
        
        public void RemoveUser(string username)
        {
            Session[username] = 1;
          
        }


        public ActionResult Manifest(string username)
        {
            if (username==null || username.Length == 0 || (int)Session[username] > 2) return null;
            var manifest = "CACHE MANIFEST" + Environment.NewLine +
                           "# App Version: 1.0.2" + Environment.NewLine +
                           "NETWORK:" + Environment.NewLine +
                           "*" + Environment.NewLine +
                           "CACHE:" + Environment.NewLine;

            if (Session[username]!=null && (int)Session[username] > 0)
            {
                Session[username] = (int)Session[username] + 1;
                return Content(manifest, "text/cache-manifest");
            }

            manifest +=
            Url.Content("~/Scripts/modernizr-2.6.2.js") + Environment.NewLine +
            Url.Content("~/Scripts/jquery-1.10.2.min.js") + Environment.NewLine +
            Url.Content("~/Scripts/IndexedDBShim.min.js") + Environment.NewLine +
            Url.Content("~/Scripts/IndexedDB/Linq2IndexedDB.js") + Environment.NewLine +
            Url.Content("~/Scripts/Views/Home/Index.js") + Environment.NewLine +
            Url.Content("~/Scripts/Views/Shared/ConnectionStatus.js") + Environment.NewLine +
            Url.Content("~/Scripts/Views/DatabaseHelpers/TodoDatabaseHelper.js") + Environment.NewLine +
            Url.Content("~/Scripts/bootstrap.js") + Environment.NewLine +
            Url.Content("~/Scripts/jquery.validate.js") + Environment.NewLine +
            Url.Content("~/Scripts/Views/DatabaseHelpers/TodoDatabaseHelper.js") + Environment.NewLine +
            Url.Content("~/Content/site.css") + Environment.NewLine +
            Url.Content("~/Content/Views/Home/Index.css") + Environment.NewLine +
            Url.Content("~/Content/bootstrap.css") + Environment.NewLine +
            Url.Content("~/Content/bootstrap.min.css") + Environment.NewLine +
            Url.Content("~/Resources/GitHub.png") + Environment.NewLine +
            Url.Content("~/Resources/Mario-icon1.png") + Environment.NewLine +
            Url.Content("~/Resources/Mario-icon2.png") + Environment.NewLine;

            return Content(manifest, "text/cache-manifest");
        }

    }
}

//caching controller actions
//Url.Action("Index", "Home") + Environment.NewLine +
//caching scripts
//Url.Content("~/bundles/jquery") + Environment.NewLine +
//Url.Content("~/ bundles / bootstrap") + Environment.NewLine +
//Url.Content("~/Scripts/IndexedDB/modernizr-2.6.2.js") + Environment.NewLine +
//Url.Content("~/Scripts/jquery-1.10.2.js") + Environment.NewLine +
//Url.Content("~/Scripts/IndexedDBShim.min.js") + Environment.NewLine +
//Url.Content("~/Scripts/IndexedDB/Linq2IndexedDB.js") + Environment.NewLine +
//Url.Content("~/Content/Views/Home/Index.css") + Environment.NewLine +
//Url.Content("~/Scripts/Views/Home/Index.js") + Environment.NewLine +
//Url.Content("~/Scripts/Views/Shared/ConnectionStatus.js") + Environment.NewLine +
//Url.Content("~/Scripts/Views/DatabaseHelpers/TodoDatabaseHelper.js") + Environment.NewLine;
