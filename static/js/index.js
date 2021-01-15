function connect() {
  const wsUrl = `ws://${window.location.host}/ws/chat/`;
  const socketRef = new WebSocket(wsUrl);

  // Local variables
  let isConnected = false;
  let username = "";
  let quitBtnCounter = 0;

  const chatLog = document.getElementById("chat-log");
  const chatInput = document.getElementById("chat-input");
  const submitBtn = document.getElementById("send-button");
  const quitBtn = document.getElementById("quit-button");

  let disconnect = setTimeout(() => {
    document.getElementById("header").textContent =
      "No stranger online. Try again later.";
    socketRef.close();
    quitBtn.innerHTML = "New <span style='font-size:10px'>ESC</span>";
  }, 5000);

  // socket functions
  socketRef.onopen = () => {
    console.log(socketRef.readyState);
  };

  socketRef.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.command === "connected_message") {
      clearTimeout(disconnect);

      isConnected = true;
      username = uuid();

      document.getElementById("header").textContent = data.message;

      chatInput.disabled = false;
      submitBtn.disabled = false;
      chatInput.focus();
    } else if (data.command === "chat_message") {
      const pTag = document.createElement("p");

      pTag.innerHTML = `
      <span class=${data.username === username ? "sent" : "replies"}>
      ${data.username === username ? "You" : "Stranger"}:
      </span> ${data.message}
      `;

      if (data.username === username) {
        if (document.getElementById("typing-message")) {
          console.log(chatLog.lastChild);
          chatLog.insertBefore(pTag, chatLog.lastChild);
        } else {
          chatLog.appendChild(pTag);
        }
      } else {
        if (document.getElementById("typing-message")) {
          document.getElementById("typing-message").remove();
        }
        chatLog.appendChild(pTag);
      }

      chatLog.scrollTop = chatLog.scrollHeight;
    } else if (data.command === "disconnect_message") {
      if (!isConnected) {
        clearTimeout(disconnect);
      }

      const pTag = document.createElement("p");

      if (data.username === undefined) {
        pTag.innerHTML = "Stranger has disconnected the chat.";
      }

      pTag.innerHTML = `${
        data.username === username
          ? "You have disconnected the chat."
          : "Stranger has disconnected the chat."
      }`;

      pTag.classList.add("replies");
      pTag.classList.add("mt-2");

      chatLog.appendChild(pTag);
      chatLog.scrollTop = chatLog.scrollHeight;

      socketRef.close();
      isConnected = false;

      chatInput.disabled = true;
      submitBtn.disabled = true;

      quitBtn.innerHTML = "New <span style='font-size:10px'>ESC</span>";
    } else if (data.command === "user_typing") {
      if (username === data.username) return;

      if (document.getElementById("typing-message")) return;

      const pTag = document.createElement("p");
      pTag.innerHTML = "Stranger is typing...";
      pTag.id = "typing-message";

      chatLog.appendChild(pTag);

      setTimeout(() => {
        if (document.getElementById("typing-message")) {
          document.getElementById("typing-message").remove();
        }
      }, 6000);
    } else {
    }
  };

  socketRef.onclose = () => {};

  // All events
  chatInput.addEventListener("keyup", (e) => {
    if (e.keyCode === 27) {
      return;
    }

    if (e.keyCode === 13) {
      submitBtn.click();
      return;
    }
    socketRef.send(
      JSON.stringify({
        command: "user_typing",
        username,
      })
    );
  });

  submitBtn.addEventListener("click", (e) => {
    const message = chatInput.value;
    if (message.length === 0) return;

    // Reset quit button counter and quit button text
    quitBtnCounter = 0;
    quitBtn.innerHTML = "Quit <span style='font-size:10px'>ESC</span>";

    socketRef.send(
      JSON.stringify({
        command: "new_message",
        username,
        message,
      })
    );
    chatInput.value = "";
    chatInput.focus();
  });

  quitBtn.addEventListener("click", (e) => {
    quitBtnCounter++;

    if (quitBtnCounter === 1 && isConnected) {
      quitBtn.innerHTML = "Sure? <span style='font-size:10px'>ESC</span>";
    } else if (quitBtnCounter === 2 && isConnected) {
      if (!isConnected) return;
      socketRef.send(
        JSON.stringify({
          command: "disconnect_message",
          username,
        })
      );
    } else {
      window.location.reload();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.keyCode === 27) {
      quitBtn.click();
    }
  });

  window.onbeforeunload = () => {
    if (isConnected) return "";
  };
}

connect();
