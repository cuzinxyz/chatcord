const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const countActiveConvertations = document.getElementById(
  "active-conversations"
);
const currentUserElement = document.getElementById("current-user");
const currentUserAvatar = document.getElementById("current-user-avatar");

console.log(currentUserElement);
// Get username and room from URL
let { username, room, private } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

if (!room && !private) {
  room = "Commundity";
}

if (!room) {
  room = private;
}

console.log(room);

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);

  countActiveConvertations.innerText = users.length;
});

// Get current user
socket.on("currentUser", (user) => {
  currentUserElement.innerText = user.username;
  currentUserAvatar.src = `https://ui-avatars.com/api/?name=${user.username}&background=random`;
});

// Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  if (message.isBot) {
    const div = document.createElement("div");
    div.classList.add("col-span-full");
    div.classList.add("text-sm");
    div.classList.add("text-gray-800");
    div.classList.add("text-center");
    div.classList.add("py-4");
    div.innerText = message.text;
    document.querySelector(".chat-messages").appendChild(div);
  } else {
    const div = createMessageHTML(message, message.username === username);
    document.querySelector(".chat-messages").appendChild(div);
  }
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    console.log(user);

    const button = document.createElement("button");
    button.className =
      "flex flex-row items-center hover:bg-gray-100 rounded-xl p-2";

    const avatarDiv = document.createElement("div");
    avatarDiv.className =
      "flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full";
    avatarDiv.innerText = user.username.charAt(0);

    const nameDiv = document.createElement("div");
    nameDiv.className = "ml-2 text-sm font-semibold";
    const truncatedUsername =
      user.username.length > 16
        ? user.username.substring(0, 16) + "..."
        : user.username;
    nameDiv.innerText = truncatedUsername;

    button.appendChild(avatarDiv);
    button.appendChild(nameDiv);

    userList.appendChild(button);
  });
}

function outputUsername(user) {
  userName.innerText = user;
}

//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});

function createMessageHTML(message, isCurrentUser) {
  const div = document.createElement("div");
  div.classList.add("py-1", "px-3", "rounded-lg");

  if (isCurrentUser) {
    div.classList.add("col-start-6", "col-end-13");
  } else {
    div.classList.add("col-start-1", "col-end-8");
  }

  div.innerHTML = `
    <div class="flex ${
      isCurrentUser
        ? "items-center justify-start flex-row-reverse"
        : "flex-row items-center"
    }">
      <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
        ${message.username.charAt(0).toUpperCase()}
      </div>
      <div class="relative ${isCurrentUser ? "mr-3" : "ml-3"} text-sm ${
    isCurrentUser ? "bg-indigo-100" : "bg-white"
  } py-2 px-4 shadow rounded-xl">
        <div>${message.text}</div>
      </div>
    </div>
  `;

  return div;
}
