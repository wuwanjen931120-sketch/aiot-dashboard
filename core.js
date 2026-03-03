document.addEventListener("DOMContentLoaded", function () {

  const isProtectedPage =
    location.pathname.endsWith("dashboard.html") ||
    location.pathname.endsWith("logs.html") ||
    location.pathname.endsWith("settings.html");

  if (isProtectedPage && localStorage.getItem("isLogin") !== "true") {
    window.location.replace("login.html");
  }

});
