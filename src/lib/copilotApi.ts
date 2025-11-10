interface CopilotMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CopilotResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

export class CopilotAPI {
  private token: string;
  private sessionId: string;
  private machineId: string;

  constructor(token: string) {
    this.token = token;
    this.sessionId = this.generateUUID();
    this.machineId = this.generateUUID();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async chat(messages: CopilotMessage[], stream: boolean = false): Promise<string | AsyncIterable<string>> {
    const url = 'https://api.githubcopilot.com/chat/completions';
    
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Editor-Version': 'vscode/1.96.0',
      'Editor-Plugin-Version': 'copilot-chat/0.23.1',
      'User-Agent': 'GitHubCopilotChat/0.23.1',
      'Accept': stream ? 'text/event-stream' : 'application/json',
      'X-Request-Id': this.generateUUID(),
      'Vscode-Sessionid': this.sessionId,
      'Vscode-Machineid': this.machineId
    };

    const body = JSON.stringify({
      messages,
      model: 'gpt-4o',
      temperature: 0.7,
      top_p: 1,
      n: 1,
      stream,
      max_tokens: 2000
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body
      });

      if (!response.ok) {
        throw new Error(`Copilot API error: ${response.status} ${response.statusText}`);
      }

      if (stream) {
        return this.handleStreamResponse(response);
      } else {
        const data: CopilotResponse = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Copilot API error:', error);
      throw error;
    }
  }

  private async *handleStreamResponse(response: Response): AsyncIterable<string> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

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
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async getToken(): Promise<string> {
    // This would normally authenticate with GitHub
    // For now, we'll use the provided token
    return this.token;
  }
}

export const createCopilotClient = (token?: string): CopilotAPI | null => {
  const githubToken = token || process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('GitHub token not found');
    return null;
  }
  
  return new CopilotAPI(githubToken);
};
