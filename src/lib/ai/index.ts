/**
 * AI Service Layer
 * Central interface for all AI/ML operations using Google Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface AIModelConfig {
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface AIGenerationResult {
  text: string;
  confidence?: number;
  finishReason?: string;
  metadata?: Record<string, any>;
}

/**
 * AI Service Class - Singleton for AI operations
 */
export class AIService {
  private static instance: AIService;
  private defaultConfig: AIModelConfig = {
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxOutputTokens: 2048,
  };

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate text using AI model
   */
  async generate(
    prompt: string,
    config?: Partial<AIModelConfig>
  ): Promise<AIGenerationResult> {
    try {
      const modelConfig = { ...this.defaultConfig, ...config };
      const model = genAI.getGenerativeModel({
        model: modelConfig.model,
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
          topP: modelConfig.topP,
          topK: modelConfig.topK,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        finishReason: response.candidates?.[0]?.finishReason,
        metadata: {
          model: modelConfig.model,
          promptTokens: response.usageMetadata?.promptTokenCount,
          completionTokens: response.usageMetadata?.candidatesTokenCount,
        },
      };
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate content with conversation history
   */
  async chat(
    messages: Array<{ role: 'user' | 'model'; parts: string }>,
    config?: Partial<AIModelConfig>
  ): Promise<AIGenerationResult> {
    try {
      const modelConfig = { ...this.defaultConfig, ...config };
      const model = genAI.getGenerativeModel({
        model: modelConfig.model,
        generationConfig: {
          temperature: modelConfig.temperature,
          maxOutputTokens: modelConfig.maxOutputTokens,
        },
      });

      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role,
          parts: [{ text: msg.parts }],
        })),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        finishReason: response.candidates?.[0]?.finishReason,
      };
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new Error(`AI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate structured JSON output
   */
  async generateJSON<T = any>(
    prompt: string,
    schema?: any,
    config?: Partial<AIModelConfig>
  ): Promise<T> {
    try {
      const enhancedPrompt = schema
        ? `${prompt}\n\nRespond only with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`
        : `${prompt}\n\nRespond only with valid JSON.`;

      const result = await this.generate(enhancedPrompt, config);
      
      // Extract JSON from markdown code blocks if present
      let jsonText = result.text;
      const jsonMatch = jsonText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      return JSON.parse(jsonText.trim());
    } catch (error) {
      console.error('AI JSON Generation Error:', error);
      throw new Error(`AI JSON generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Embed text for semantic search
   */
  async embed(text: string): Promise<number[]> {
    try {
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('AI Embedding Error:', error);
      throw new Error(`AI embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch embed multiple texts
   */
  async batchEmbed(texts: string[]): Promise<number[][]> {
    try {
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const results = await Promise.all(
        texts.map(text => model.embedContent(text))
      );
      return results.map(r => r.embedding.values);
    } catch (error) {
      console.error('AI Batch Embedding Error:', error);
      throw new Error(`AI batch embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
