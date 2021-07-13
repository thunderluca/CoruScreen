using CoruScreen.Server.Hubs;
using CoruScreen.Server.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;

namespace CoruScreen.Server
{
    public class Startup
    {
        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public void ConfigureServices(IServiceCollection services)
        {
            var corsPolicy = _configuration.GetSection("CorsPolicy").Get<CorsPolicy>();
            if (corsPolicy != null)
            {
                services.AddCors(options =>
                {
                    options.AddPolicy(corsPolicy.Name, builder => builder.BuildUponPolicy(corsPolicy));
                });

                Console.WriteLine($"Cors policy '{corsPolicy.Name}' successfully registered");
            }

            services.AddControllers();
            services.AddSignalR();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();
            
            var corsPolicyName = _configuration["CorsPolicy:Name"];
            if (!string.IsNullOrWhiteSpace(corsPolicyName))
            {
                app.UseCors(corsPolicyName);
            }

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapHub<StreamHub>("/stream");
            });
        }
    }
}
