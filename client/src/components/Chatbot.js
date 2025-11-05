import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ChatbotContainer = styled.div`
  position: fixed;
  bottom: ${props => props.isOpen ? '20px' : '20px'};
  right: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const ChatButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ChatWindow = styled.div`
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 16px;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin-bottom: 10px;
  
  @media (max-width: 480px) {
    width: calc(100vw - 40px);
    height: calc(100vh - 100px);
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 16px 16px 0 0;
`;

const BotAvatar = styled.div`
  font-size: 36px;
  margin-right: 12px;
`;

const BotInfo = styled.div`
  flex: 1;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  p {
    margin: 4px 0 0;
    font-size: 13px;
    opacity: 0.9;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ChatBox = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8f9fa;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const Message = styled.div`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Bubble = styled.div`
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px;
  line-height: 1.5;
  font-size: 14px;
  background: ${props => props.isUser ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ffffff'};
  color: ${props => props.isUser ? 'white' : '#333'};
  border-bottom-left-radius: ${props => props.isUser ? '16px' : '4px'};
  border-bottom-right-radius: ${props => props.isUser ? '4px' : '16px'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  word-wrap: break-word;
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 10px 14px;
  background: #ffffff;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  max-width: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #667eea;
    animation: bounce 1.4s infinite;
    
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
  
  @keyframes bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-8px);
    }
  }
`;

const Suggestions = styled.div`
  margin-top: 8px;
  
  p {
    font-size: 12px;
    color: #666;
    margin: 0 0 8px 0;
  }
`;

const SuggestionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SuggestionButton = styled.button`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
  
  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
  }
`;

const ChatForm = styled.form`
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
  border-top: 1px solid #e0e0e0;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  border: 1px solid #e0e0e0;
  padding: 10px 14px;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const FileLabel = styled.label`
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '👋 Hi! Welcome to <strong>Seven Four Clothing</strong>! I\'m your Customer Virtual Assistant. How can I help you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);

  const suggestions = [
    'Where is my order?',
    'Do you have items on sale?',
    'How can I request a refund?',
    'Can I order custom designs?'
  ];

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Hide suggestions after first user message
    setShowSuggestions(false);

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/get_response', {
        message: text
      });

      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);
      }, 800);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I\'m having trouble connecting. Please try again later.' 
      }]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Add file upload message
    setMessages(prev => [...prev, { sender: 'user', text: `📎 Uploaded: ${file.name}` }]);
    setIsTyping(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/upload_file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);

        if (response.data.follow_up) {
          setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', text: response.data.follow_up }]);
          }, response.data.delay || 2000);
        }
      }, 800);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, there was an issue processing your file.' 
      }]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ChatbotContainer isOpen={isOpen}>
      <ChatWindow isOpen={isOpen}>
        <ChatHeader>
          <BotAvatar>🤖</BotAvatar>
          <BotInfo>
            <h2>Seven Four Assistant</h2>
            <p>🟢 Online • Ready to help!</p>
          </BotInfo>
          <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
        </ChatHeader>

        <ChatBox ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <Message key={index} isUser={msg.sender === 'user'}>
              <Bubble 
                isUser={msg.sender === 'user'}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </Message>
          ))}

          {isTyping && (
            <Message isUser={false}>
              <TypingIndicator>
                <span></span>
                <span></span>
                <span></span>
              </TypingIndicator>
            </Message>
          )}

          {showSuggestions && messages.length === 1 && (
            <Suggestions>
              <p>💡 You may want to ask:</p>
              <SuggestionButtons>
                {suggestions.map((suggestion, index) => (
                  <SuggestionButton 
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </SuggestionButton>
                ))}
              </SuggestionButtons>
            </Suggestions>
          )}
        </ChatBox>

        <ChatForm onSubmit={handleSubmit}>
          <FileLabel htmlFor="file-input">📎</FileLabel>
          <input
            ref={fileInputRef}
            type="file"
            id="file-input"
            accept="image/jpeg,image/jpg,image/png,video/mp4,video/quicktime"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <SendButton type="submit" disabled={!inputValue.trim()}>
            Send
          </SendButton>
        </ChatForm>
      </ChatWindow>

      <ChatButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </ChatButton>
    </ChatbotContainer>
  );
};

export default Chatbot;
