'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChatMessage } from '@/types';
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Loader2, Trash2, Download, Sparkles, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AITutorProps {
  weakAreas: string[];
}

// Enhanced message type with UI components
interface EnhancedChatMessage extends ChatMessage {
  uiComponent?: 'quiz' | 'progress' | 'formula' | 'example' | 'hint';
  uiData?: any;
  isStreaming?: boolean;
}

export default function AITutor({ weakAreas = [] }: AITutorProps) {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatHistoryKey = 'ai-tutor-chat-history';

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(chatHistoryKey);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse chat history:', e);
      }
    } else {
      // Initial greeting
      const initialMessage: EnhancedChatMessage = {
        id: '1',
        role: 'assistant',
        content: language === 'th' 
          ? 'สวัสดีค่ะ! ฉันคือ AI Tutor ที่พัฒนาด้วย Generative UI ฉันสามารถสร้างส่วนประกอบเชิงโต้ตอบ แบบทดสอบ และภาพประกอบเพื่อช่วยคุณเรียนรู้ได้ค่ะ มีอะไรให้ช่วยไหมคะ? 🎓'
          : "Hello! I'm your AI Tutor with Generative UI capabilities. I can create interactive components, quizzes, and visualizations to help you learn better. How can I assist you today? 🎓",
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [language]);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language === 'th' ? 'th-TH' : 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(language === 'th' 
        ? 'เบราว์เซอร์ของคุณไม่รองรับการรับรู้เสียง' 
        : 'Your browser does not support speech recognition');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === 'th' ? 'th-TH' : 'en-US';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'th' ? 'th-TH' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Real AI streaming response
  const streamAIResponse = async (userMessage: string) => {
    setStreamingText('');
    setIsTyping(true);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Prepare conversation history
      const conversationHistory = messages
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Add system prompt with weak areas context
      const systemPrompt = {
        role: 'system' as const,
        content: language === 'th'
          ? `คุณเป็นครูสอนพิเศษ AI ที่เชี่ยวชาญในการสอนนักเรียนไทย คุณให้คำแนะนำด้วยการให้คำใบ้และคำถามที่กระตุ้นการคิด ไม่ใช่การให้คำตอบโดยตรง ${weakAreas.length > 0 ? `พื้นที่ที่นักเรียนต้องปรับปรุง: ${weakAreas.join(', ')}` : ''} ใช้อิโมจิเพื่อทำให้การเรียนรู้สนุกยิ่งขึ้น`
          : `You are an expert AI tutor for Thai students. You provide guidance through hints and thought-provoking questions, not direct answers. ${weakAreas.length > 0 ? `Student's weak areas: ${weakAreas.join(', ')}` : ''} Use emojis to make learning engaging.`
      };

      const chatMessages = [
        systemPrompt,
        ...conversationHistory,
        { role: 'user' as const, content: userMessage }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: chatMessages,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.content;
              
              if (content) {
                fullText += content;
                setStreamingText(fullText);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setIsTyping(false);
      setStreamingText('');

      // Add the complete message
      const assistantMessage: EnhancedChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: fullText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (autoSpeak && fullText) {
        speak(fullText);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      console.error('AI streaming error:', error);
      setIsTyping(false);
      setStreamingText('');

      // Fallback to friendly error message
      const errorMessage: EnhancedChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: language === 'th'
          ? '😔 ขออภัยค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้งค่ะ'
          : '😔 Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: EnhancedChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');

    // Call real AI API
    await streamAIResponse(messageText);
  };

  const generateUIData = (type: string) => {
    switch(type) {
      case 'quiz':
        return {
          question: language === 'th' ? 'ข้อใดเป็นคำตอบที่ถูกต้อง?' : 'Which is the correct answer?',
          options: language === 'th' 
            ? ['ตัวเลือก A', 'ตัวเลือก B', 'ตัวเลือก C', 'ตัวเลือก D']
            : ['Option A', 'Option B', 'Option C', 'Option D'],
          correct: 2
        };
      case 'progress':
        return {
          topic: weakAreas[0] || 'Mathematics',
          value: Math.floor(Math.random() * 100)
        };
      case 'formula':
        return {
          name: 'a² + b² = c²',
          description: language === 'th' ? 'ทฤษฎีบทพีทาโกรัส' : 'Pythagorean Theorem'
        };
      case 'example':
        return {
          problem: '2x + 5 = 15',
          steps: ['2x = 15 - 5', '2x = 10', 'x = 5']
        };
      case 'hint':
        return {
          hints: language === 'th' 
            ? ['ลองแยกตัวแปรออกมาก่อน', 'คิดถึงการดำเนินการผกผัน', 'ตรวจสอบคำตอบโดยแทนค่ากลับ']
            : ['Try isolating the variable first', 'Think about inverse operations', 'Check your answer by substituting back']
        };
      default:
        return {};
    }
  };

  const clearHistory = () => {
    if (confirm(language === 'th' ? 'ต้องการลบประวัติการสนทนาทั้งหมดหรือไม่?' : 'Are you sure you want to clear all chat history?')) {
      localStorage.removeItem(chatHistoryKey);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: language === 'th' 
          ? 'ประวัติการสนทนาถูกล้างแล้วค่ะ มีอะไรให้ช่วยไหมคะ? 🎓'
          : 'Chat history cleared. How can I help you? 🎓',
        timestamp: new Date()
      }]);
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString()}.json`;
    link.click();
  };

  const renderUIComponent = (message: EnhancedChatMessage) => {
    if (!message.uiComponent || !message.uiData) return null;

    switch(message.uiComponent) {
      case 'quiz':
        return (
          <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
            <p className="font-medium mb-3">{message.uiData.question}</p>
            <div className="space-y-2">
              {message.uiData.options.map((opt: string, idx: number) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (idx === message.uiData.correct) {
                      alert(language === 'th' ? '✅ ถูกต้อง!' : '✅ Correct!');
                    } else {
                      alert(language === 'th' ? '❌ ลองใหม่อีกครั้ง' : '❌ Try again');
                    }
                  }}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        );
      
      case 'progress':
        return (
          <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{message.uiData.topic}</span>
              <span className="text-sm font-bold">{message.uiData.value}%</span>
            </div>
            <Progress value={message.uiData.value} className="h-2" />
          </div>
        );
      
      case 'formula':
        return (
          <Alert className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <div className="font-mono text-lg font-bold my-2">{message.uiData.name}</div>
              <div className="text-sm">{message.uiData.description}</div>
            </AlertDescription>
          </Alert>
        );
      
      case 'example':
        return (
          <div className="mt-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg border">
            <p className="font-medium mb-2">{language === 'th' ? 'ตัวอย่าง:' : 'Example:'}</p>
            <div className="font-mono bg-white dark:bg-gray-900 p-3 rounded mb-2">
              {message.uiData.problem}
            </div>
            <div className="space-y-1">
              {message.uiData.steps.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <Badge variant="secondary">{idx + 1}</Badge>
                  <span className="font-mono">{step}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'hint':
        return (
          <div className="mt-3 p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-lg border">
            <p className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {language === 'th' ? 'คำใบ้:' : 'Hints:'}
            </p>
            <ul className="space-y-2">
              {message.uiData.hints.map((hint: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">💡</span>
                  <span className="text-sm">{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Sidebar */}
      <div className="flex h-full">
        {/* Left Sidebar - Chat History */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <Button className="w-full gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Today
              </div>
              <Button variant="ghost" className="w-full justify-start text-sm font-normal">
                Current Chat
              </Button>
            </div>
          </ScrollArea>

          <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={exportHistory}
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {language === 'th' ? 'ส่งออกประวัติ' : 'Export History'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={clearHistory}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Clear</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {language === 'th' ? 'ล้างประวัติ' : 'Clear History'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="max-w-3xl mx-auto py-8 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 max-w-[70%]">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                    
                    {renderUIComponent(message)}
                    
                    <div className="flex items-center gap-2 px-2">
                      <p className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => speak(message.content)}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {streamingText && (
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 max-w-[70%]">
                    <p className="text-sm leading-relaxed">{streamingText}<span className="animate-pulse">▊</span></p>
                  </div>
                </div>
              )}
              
              {isTyping && !streamingText && (
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="max-w-3xl mx-auto">
              {isListening && (
                <div className="flex items-center justify-center gap-2 p-2 mb-2 bg-red-50 dark:bg-red-950 rounded-lg animate-pulse">
                  <Mic className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {language === 'th' ? 'กำลังฟัง...' : 'Listening...'}
                  </span>
                </div>
              )}
              
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={isListening 
                      ? (language === 'th' ? 'กำลังฟัง...' : 'Listening...') 
                      : (language === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...')
                    }
                    className="pr-24 py-6 rounded-3xl"
                    disabled={isListening || isTyping}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setAutoSpeak(!autoSpeak);
                              if (isSpeaking) stopSpeaking();
                            }}
                          >
                            {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {language === 'th' ? 'เปิด/ปิดเสียง' : 'Toggle Voice'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", isListening && "text-red-600")}
                            onClick={toggleListening}
                            disabled={isTyping}
                          >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {language === 'th' ? 'พูด/หยุด' : 'Speak/Stop'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  disabled={!input.trim() || isTyping || isListening}
                  className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700"
                >
                  {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}