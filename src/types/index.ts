export interface Message {
  text: string;
  isUser: boolean;
}

export interface ApiResponse {
  text: string;
  error?: string;
} 