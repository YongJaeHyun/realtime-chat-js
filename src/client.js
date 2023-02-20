// cors 설정
const socket = io.connect("http://localhost:3000", {
  cors: { origin: "*" },
});

socket.on("connect", () => {
  console.log("소켓으로 접속 됨.");
  const initialNickname = `익명${Math.floor(Math.random() * 10000)}`;
  $("#nickname").val(initialNickname);
  socket.emit("greeting", initialNickname);
});

// 시스템 챗
socket.on("addSystemChat", ({ content }) => {
  const chatBox = $(`
      <div id='server-chatBox' class='chatBox'>
          <div id='server-inside-chatBox' class='inside-chatBox' style=background-color:#8c7ae6;color:whitesmoke;>
              <div id='server-contentBox'>
                  <p id='chat-content'>${content}</p>
              </div>
          </div>
      </div> 
      `);
  $("#chatContainer").prepend(chatBox);
});

// 서버에서 받는 채팅
socket.on("addChat", ({ nickname, content }) => {
  const chatBox = $(`
      <div id='server-chatBox' class='chatBox'>
          <div id='server-inside-chatBox' class='inside-chatBox'>
              <div id='server-nicknameBox' class='nicknameBox'>
                  <span id='chat-nickname'>${nickname}</span>
              </div>
              <div id='server-contentBox'>
                  <p id='chat-content'>${content}</p>
              </div>
          </div>
      </div> 
      `);
  $("#chatContainer").prepend(chatBox);
});

function setConnection() {
  const nickname = $("#nickname").val();
  socket.emit("modify nickname", nickname);
}

// client쪽에서 받은 데이터는 client단에서 렌더링하고 서버로 데이터를 넘김
function addChatData(e) {
  e.preventDefault();
  const nickname = $("#nickname").val();
  const content = $("#chatInput").val();
  const chatBox = $(`
    <div id='client-chatBox' class='chatBox'>
        <div id='client-inside-chatBox' class='inside-chatBox'>
            <div id='client-nicknameBox' class='nicknameBox'>
                <span id='chat-nickname'>나</span>
            </div>
            <div id='client-contentBox'>
                <p id='chat-content'>${content}</p>
            </div>
        </div>
    </div> 
    `);
  $("#chatContainer").prepend(chatBox);
  $("#chatInput").val("");
  socket.emit("addChat", { nickname, content });
}

$(document).ready(() => {
  $("#addChatForm").on("submit", (e) => addChatData(e));
  $("#nicknameBtn").on("click", setConnection);
});
