// Backend API endpoint for AI replies
// This would typically be in a separate backend service
// For now, we'll create a mock implementation

export interface AIReplyRequest {
  message: string;
  language: string;
  isNativeMode: boolean;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  userProfile?: any;
}

export interface AIReplyResponse {
  text: string;
  audioUrl?: string;
  translatedText?: string;
}

// This is a mock implementation - in production, this would be a proper backend endpoint
export async function getAIReply(request: AIReplyRequest): Promise<AIReplyResponse> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  // Prepare system prompt based on language mode
  let systemPrompt = `You are a friendly, patient English teacher helping non-native speakers improve their English. Your responses should be:

1. Clear and simple - use everyday vocabulary
2. Encouraging - always praise effort and progress
3. Corrective but gentle - if you notice grammar mistakes, gently correct them by including the correct form in your response
4. Conversational - ask follow-up questions to keep the conversation going
5. Educational - provide brief explanations when helpful
6. Supportive - create a safe space for learning

Keep responses conversational and under 100 words. Always end with a question or encouragement to continue the conversation.`;

  if (request.userProfile) {
    systemPrompt += `\n\nThe user's English proficiency level is: ${request.userProfile.proficiency_level}. Their native language is: ${request.userProfile.native_language}.`;
  }

  if (request.isNativeMode && request.language !== 'en') {
    systemPrompt += `\n\nIMPORTANT: The user is in native language mode. Respond in their native language (${request.language}) while teaching English concepts. Explain English grammar and vocabulary using their native language for better understanding.`;
  }

  // Call OpenRouter API
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Voice Tutor'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat-v3:free',
      messages: [
        { role: 'system', content: systemPrompt },
        ...request.conversationHistory,
        { role: 'user', content: request.message }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const aiText = data.choices?.[0]?.message?.content;

  if (!aiText) {
    throw new Error('Invalid response from OpenRouter');
  }

  // TODO: Implement text-to-speech conversion
  // For now, we'll return just the text
  return {
    text: aiText,
    // audioUrl: await convertTextToSpeech(aiText, request.language)
  };
}