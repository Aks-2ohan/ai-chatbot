var conversationHistory = [];

function sendMessage() {
  var inputBox = document.getElementById('user-input');
  var userText = inputBox.value.trim();

  if (!userText) return;

  inputBox.value = '';

  var welcome = document.querySelector('.welcome');
  if (welcome) welcome.remove();

  addMessageToScreen('user', userText);

  conversationHistory.push({
    role: 'user',
    parts: [{ text: userText }]
  });

  var sendBtn = document.getElementById('send-btn');
  sendBtn.disabled = true;
  sendBtn.textContent = '...';

  var typingEl = addMessageToScreen('ai', 'Typing...');

  var API_KEY = 'AIzaSyClLPtmlRwftqJkauW3a2Mpum3wEUoK414';

  var requestBody = {
    system_instruction: {
      parts: [{ text: 'You are a helpful AI assistant. Keep answers clear and friendly.' }]
    },
    contents: conversationHistory
  };

  fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    console.log('API response:', data);
    if (data.error) {
        typingEl.textContent = 'API Error: ' + data.error.message;
        typingEl.style.color = 'red';
        conversationHistory.pop();
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
        return;
    }
    var aiReply = data.candidates[0].content.parts[0].text;

    conversationHistory.push({
      role: 'model',
      parts: [{ text: aiReply }]
    });

    typingEl.textContent = aiReply;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  })
  .catch(function(error) {
    console.log('Error:', error);
    typingEl.textContent = 'Error: ' + error.message;
    typingEl.style.color = 'red';
    conversationHistory.pop();
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  });
}

function addMessageToScreen(role, text) {
  var chatBox = document.getElementById('chat-box');
  var messageDiv = document.createElement('div');
  messageDiv.className = 'message ' + role;
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return messageDiv;
}

document.addEventListener('DOMContentLoaded', function() {
  var inputBox = document.getElementById('user-input');
  inputBox.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
});