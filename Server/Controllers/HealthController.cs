using Microsoft.AspNetCore.Mvc;

namespace CoruScreen.Server.Controllers
{
    public class HealthController : Controller
    {
        public IActionResult Index()
        {
            return Ok(new { status = "OK" });
        }
    }
}
