import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AIAdvisor.css';

const AIAdvisor = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
    // Welcome message
    setMessages([{
      type: 'assistant',
      content: `👋 Welcome to your AI Startup Advisor!

I'm here to help you with:
✅ Business strategy and planning
✅ Funding and investor relations
✅ Product development
✅ Team building and hiring
✅ Marketing and growth
✅ Legal and financial advice

Ask me anything about starting or growing your startup!`,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/advisor/suggestions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSubmit = async (e, customQuestion = null) => {
    e?.preventDefault();
    const question = customQuestion || input;
    
    if (!question.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/advisor/ask',
        { question },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
      );

      // Add AI response
      const aiMessage = {
        type: 'assistant',
        content: response.data.answer,
        timestamp: new Date(),
        tokens: response.data.tokens_used
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Refresh suggestions
      loadSuggestions();
    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSubmit(null, suggestion);
  };

  const clearConversation = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/advisor/clear',
        {},
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }}
      );
      setMessages([]);
      loadSuggestions();
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return (
    <div className="advisor-container">
      <div className="advisor-header">
        <div>
          <h1>🤖 AI Startup Advisor</h1>
          <p>Get personalized advice for your startup journey</p>
        </div>
        <button onClick={clearConversation} className="clear-btn">
          Clear Chat
        </button>
      </div>

      <div className="advisor-content">
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                <div className="message-avatar">
                  {msg.type === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString()}
                    {msg.tokens && <span className="tokens"> • {msg.tokens} tokens</span>}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your startup..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>

        <div className="suggestions-sidebar">
          <h3>💡 Suggested Questions</h3>
          <div className="suggestions-list">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-btn"
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="quick-tips">
            <h4>Quick Tips</h4>
            <ul>
              <li>Be specific with your questions</li>
              <li>Provide context about your startup</li>
              <li>Ask follow-up questions</li>
              <li>Request actionable steps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
