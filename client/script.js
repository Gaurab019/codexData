import bot from "./assets/bot.svg";
import user from "./assets/user.svg";
import uuid4 from "uuid4";

const form = document.querySelector("form");
const chatcontainer = document.querySelector("#chat_container");

let loadinterval;

function loader(element) {
  element.textContent = "";

  loadinterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index += 1;
    } else {
      clearInterval(interval);
    }
  }, 20);
  // element.innerHTML += text;
}

function generateUid() {
  const hexa = uuid4();
  return `id-${hexa}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && "ai"}">
      <div class = "chat">
        <div class="profile">
          <img
          src = "${isAi ? bot : user}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
      </div>
      `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chat stripe
  chatcontainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //bot's chat stripe
  const uniqueId = generateUid();
  chatcontainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatcontainer.scrollTop = chatcontainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server -> bot's response

  const response = await fetch("https://codex-5w7f.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });
  clearInterval(loadinterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedata = data.bot.trim();

    typeText(messageDiv, parsedata);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});
