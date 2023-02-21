// cors 설정
const socket = io.connect("http://localhost:3000", {
  cors: { origin: "*" },
});

socket.on("connect", () => {
  console.log("소켓으로 접속 됨.");
  const initialNickname = `익명${Math.floor(Math.random() * 10000)}`;
  $("#nickname").val(initialNickname);
  socket.nickname = initialNickname;
  socket.emit("greeting", initialNickname);
});

// 서버에서 상대방의 greeting처리가 끝나면 DM을 할 수 있도록 option추가.
socket.on("greeting", ({ nickname, socketId }) => {
  const value = $(`<option value='${socketId}'>${nickname}</option>`);
  $("#chatTarget").append(value);
});

// 서버로부터 받는 데이터로 시스템 챗 블럭 생성
socket.on("addSystemChat", ({ content }) => {
  const chatBox = $(`
      <div id='server-chatBox' class='chatBox'>
          <div id='system-server-inside-chatBox' class='system-inside-chatBox'>
              <div>
                  <p id='chat-content'>${content}</p>
              </div>
          </div>
      </div> 
      `);
  $("#chatContainer").prepend(chatBox);
});

// 서버로부터 받는 데이터로 채팅 블럭 생성
socket.on("addChat", ({ nickname, content, isDM }) => {
  const chatBox = $(`
      <div id='server-chatBox' class='chatBox'>
          <div id='server-inside-chatBox' class='inside-chatBox'>
              <div class='nicknameBox'>
                  <span>${nickname}</span>
                  <span id='dm'>${isDM ? "(DM)" : ""}</span>
              </div>
              <div>
                  <p>${content}</p>
              </div>
          </div>
      </div> 
      `);
  $("#chatContainer").prepend(chatBox);
});

function modifyNickname() {
  const nickname = $("#nickname").val();
  if (nickname != socket.nickname) {
    const chatBox = $(`
    <div id='client-chatBox' class='chatBox'>
        <div id='system-client-inside-chatBox' class='system-inside-chatBox'>
            <div>
                <p>닉네임이 ${socket.nickname} 에서 ${nickname}으로 변경되었습니다.</p>
            </div>
        </div>
    </div> 
    `);
    $("#chatContainer").prepend(chatBox);
    socket.emit("modify nickname", nickname);
    socket.nickname = nickname;
  }
}

// client쪽에서 받은 데이터로 client단에서 채팅 블럭 생성 후, 서버로 데이터를 넘김
function addClientChatData(e) {
  e.preventDefault();
  const nickname = $("#nickname").val();
  const content = $("#chatInput").val();
  const chatTarget = $("#chatTarget").val();
  const chatTargetNickname = $("#chatTarget option:selected").html();
  const chatBox = $(`
    <div id='client-chatBox' class='chatBox'>
        <div id='client-inside-chatBox' class='inside-chatBox'>
            <div class='nicknameBox'>
                <span>나</span>
                <span>${
                  chatTarget === "ALL" ? "" : ` -> ${chatTargetNickname}`
                }</span>
            </div>
            <div>
                <p>${content}</p>
            </div>
        </div>
    </div> 
    `);
  $("#chatContainer").prepend(chatBox);
  $("#chatInput").val("");
  socket.emit("addChat", { nickname, content, chatTarget });
}

$(document).ready(() => {
  $("#addChatForm").on("submit", (e) => addClientChatData(e));
  $("#nicknameBtn").on("click", modifyNickname);
});
