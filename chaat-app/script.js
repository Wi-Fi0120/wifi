const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');
const usernameInput = document.getElementById('username-input');
const changeUsernameButton = document.getElementById('change-username');
const showUsersButton = document.getElementById('show-users');
const imageInput = document.getElementById('image-input');

let username = `User${Math.floor(Math.random() * 1000)}`;

const socket = new WebSocket('ws://localhost:3000');

// メッセージを受信
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'message') {
    const messageElement = document.createElement('div');
    // HTMLタグを有効化（注意: セキュリティリスクに注意）
    messageElement.innerHTML = `${data.user}: ${data.message}`;
    chatBox.appendChild(messageElement);
  } else if (data.type === 'users') {
    alert(`現在のオンラインユーザー: ${data.users.join(', ')}`);
  } else if (data.type === 'image') {
    const img = document.createElement('img');
    img.src = data.imageData;
    img.style.maxWidth = '100%';
    chatBox.appendChild(img);
  }
  chatBox.scrollTop = chatBox.scrollHeight;
};

// エンターキーで送信
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// 送信ボタン
sendButton.addEventListener('click', sendMessage);

function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    socket.send(JSON.stringify({ type: 'message', user: username, message }));
    messageInput.value = '';
  }
}

// 名前を変更
changeUsernameButton.addEventListener('click', () => {
  const newName = usernameInput.value.trim();
  if (newName) {
    username = newName;
    alert(`名前が「${username}」に変更されました！`);
  }
});

// オンラインユーザーを確認
showUsersButton.addEventListener('click', () => {
  socket.send(JSON.stringify({ type: 'getUsers', user: username }));
});

// 履歴をクリア
clearButton.addEventListener('click', () => {
  chatBox.innerHTML = '';
});

// 画像を送信
imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.send(JSON.stringify({ type: 'image', user: username, imageData: reader.result }));
    };
    reader.readAsDataURL(file);
  }
});