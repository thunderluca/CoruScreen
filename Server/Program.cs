using CoruScreen.Server.Hubs;
using CoruScreen.Server.Models;

var builder = WebApplication.CreateBuilder(args);

var corsPolicy = builder.Configuration.GetSection("CorsPolicy").Get<CorsPolicy>();
if (corsPolicy != null)
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(corsPolicy.Name, builder => builder.BuildUponPolicy(corsPolicy));
    });

    Console.WriteLine($"Cors policy '{corsPolicy.Name}' successfully registered");
}

builder.Services.AddControllers();
builder.Services.AddSignalR();

await using var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

app.UseRouting();

var corsPolicyName = app.Configuration["CorsPolicy:Name"];
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

await app.RunAsync();