const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let users = new Map();
let bannedUsers = new Set(); // BANされたユーザーのリスト
let adminUsername = null; // 管理者の名前を保存する変数

server.on('connection', (socket) => {
  const userId = `User${Math.floor(Math.random() * 1000)}`;
  users.set(socket, userId);

  // 最初の接続者を管理者に設定
  if (!adminUsername) {
    adminUsername = userId;
    console.log(`管理者は ${adminUsername} に設定されました！`);
  }

  socket.on('message', (data) => {
    const parsedData = JSON.parse(data);

    // BAN機能
    if (parsedData.type === 'ban') {
      if (parsedData.user === adminUsername) {
        bannedUsers.add(parsedData.target);
        console.log(`ユーザー ${parsedData.target} がBANされました！`);
      } else {
        console.log(`ユーザー ${parsedData.user} にBAN権限がありません！`);
      }
    }

    // メッセージのブロードキャスト
    if (parsedData.type === 'message' || parsedData.type === 'image') {
      if (!bannedUsers.has(parsedData.user)) {
        broadcast(parsedData);
      }
    }
  });

  socket.on('close', () => {
    users.delete(socket);
  });
});

function broadcast(data) {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log('WebSocketサーバーがポート3000で起動しました！');