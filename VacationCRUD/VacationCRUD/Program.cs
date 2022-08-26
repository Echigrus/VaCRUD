using Microsoft.EntityFrameworkCore;
using System.Web.Mvc;
using VacationCRUD;
using VacationCRUD.DBModels;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<ApiContext>(opt => opt.UseInMemoryDatabase("master"));
builder.Services.AddMvc(opt => opt.EnableEndpointRouting = false);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    SeedData.Initialize(services);
}
app.UseMvc();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.MapFallbackToFile("index.html"); ;

app.Run();