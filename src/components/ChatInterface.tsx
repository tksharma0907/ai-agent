'use client';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Paper, IconButton, TextField, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '12px',
  backgroundColor: '#f5f5f5',
  maxWidth: '800px',
  margin: 'auto',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
}));

const ChatContainer = styled('div')({
  height: '60vh',
  overflowY: 'auto',
  marginBottom: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '16px',
  scrollBehavior: 'smooth',
});

const MarkdownContent = styled('div')(({ theme }) => ({
  '& p': {
    margin: '0 0 8px 0',
    '&:last-child': {
      marginBottom: 0,
    }
  },
  '& code': {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    padding: '2px 4px',
    borderRadius: '4px',
    fontSize: '0.9em',
  },
  '& pre': {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    padding: theme.spacing(1),
    borderRadius: '4px',
    overflowX: 'auto',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    }
  },
  '& ul, & ol': {
    marginTop: '4px',
    marginBottom: '4px',
    paddingLeft: '20px',
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    margin: '8px 0',
    '& th, & td': {
      border: '1px solid rgba(0, 0, 0, 0.12)',
      padding: '6px',
    },
    '& th': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    }
  },
  '& blockquote': {
    borderLeft: '4px solid rgba(0, 0, 0, 0.12)',
    margin: '8px 0',
    padding: '4px 12px',
    color: 'rgba(0, 0, 0, 0.7)',
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
}));

const MessageBubble = styled('div')<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  backgroundColor: isUser ? '#2196f3' : '#ffffff',
  color: isUser ? 'white' : 'black',
  maxWidth: '70%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
  wordBreak: 'break-word',
  '& .markdown-content': {
    '& code': {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      color: isUser ? 'white' : 'inherit',
    },
    '& pre': {
      backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
    },
    '& blockquote': {
      borderLeftColor: isUser ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.12)',
      color: isUser ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
    },
    '& a': {
      color: isUser ? 'white' : theme.palette.primary.main,
    },
    '& table': {
      '& th, & td': {
        border: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)'}`,
      },
      '& th': {
        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
      }
    }
  }
}));

const InputContainer = styled('div')({
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  position: 'relative',
});

interface Message {
  text: string;
  isUser: boolean;
}

// Add this type for better error handling
type ApiResponse = {
  text: string;
  error?: string;
};

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { text: input.trim(), isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages(prev => [...prev, { text: data.text, isUser: false }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        text: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.', 
        isUser: false 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Add useEffect for scroll behavior
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const renderMessage = (message: Message) => (
    <MessageBubble key={message.text} isUser={message.isUser}>
      <MarkdownContent className="markdown-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // This ensures links open in new tab
            a: ({ node, ...props }) => (
              <a target="_blank" rel="noopener noreferrer" {...props} />
            ),
            // Prevent XSS in code blocks
            code: ({ node, inline, ...props }) => (
              <code {...props} style={inline ? {} : { display: 'block', whiteSpace: 'pre-wrap' }} />
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>
      </MarkdownContent>
    </MessageBubble>
  );

  return (
    <Container elevation={3}>
      <ChatContainer className="chat-container">
        {messages.map((msg, i) => renderMessage(msg))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </div>
        )}
      </ChatContainer>
      
      <InputContainer>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about real estate..."
          disabled={loading}
          InputProps={{ 
            style: { 
              borderRadius: '24px',
              backgroundColor: '#ffffff',
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          sx={{ 
            backgroundColor: '#2196f3',
            color: 'white',
            '&:hover': { backgroundColor: '#1976d2' },
            '&:disabled': { backgroundColor: '#ccc' },
            width: '48px',
            height: '48px',
          }}
        >
          <SendIcon />
        </IconButton>
      </InputContainer>
    </Container>
  );
} 