const peopleOnline = JSON.parse(
  document.getElementById("people_online").textContent
);

document.getElementById("strangers-online").innerText = peopleOnline;
