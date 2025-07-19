import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  apiKey: string | null;
}

export const ApiKeyInput = ({ onApiKeySet, apiKey }: ApiKeyInputProps) => {
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [isVisible, setIsVisible] = useState(!apiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onApiKeySet(inputValue.trim());
      setIsVisible(false);
    }
  };

  if (!isVisible && apiKey) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Key className="w-4 h-4" />
        <span>API Key configured</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsVisible(true)}
          className="h-auto p-1 text-xs"
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          OpenRouter API Key Required
        </CardTitle>
        <CardDescription>
          To chat with the AI English tutor, you'll need a free OpenRouter API key.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your OpenRouter API key..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={!inputValue.trim()} className="flex-1">
              Set API Key
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
              className="flex items-center gap-2"
            >
              Get Free Key
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </form>
        
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <p className="font-medium mb-1">How to get your free API key:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Visit OpenRouter.ai and sign up for free</li>
            <li>Go to the Keys section</li>
            <li>Create a new API key</li>
            <li>Copy and paste it here</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};