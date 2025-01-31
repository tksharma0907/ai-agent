import ChatInterface from '@/components/ChatInterface';
import { Container, Typography } from '@mui/material';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          color: '#2196f3',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Real Estate AI Advisor
      </Typography>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          color: '#666'
        }}
      >
        Powered by Gemini AI - Market insights updated daily
      </Typography>
      <ChatInterface />
    </Container>
  );
}
