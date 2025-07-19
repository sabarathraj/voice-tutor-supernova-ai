import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', speechCode: 'ur-PK' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', speechCode: 'de-DE' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', speechCode: 'zh-CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', speechCode: 'ko-KR' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', speechCode: 'ar-SA' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', speechCode: 'pt-BR' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', speechCode: 'ru-RU' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', speechCode: 'it-IT' }
];

export const useLanguage = () => {
  const { profile } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isNativeMode, setIsNativeMode] = useState<boolean>(false);

  useEffect(() => {
    if (profile?.native_language) {
      setCurrentLanguage(isNativeMode ? profile.native_language : 'en');
    }
  }, [profile, isNativeMode]);

  const getCurrentLanguage = (): Language => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const getNativeLanguage = (): Language => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === profile?.native_language) || SUPPORTED_LANGUAGES[0];
  };

  const toggleLanguageMode = () => {
    setIsNativeMode(!isNativeMode);
  };

  const getTranslations = () => {
    const lang = getCurrentLanguage();
    
    // Basic translations for common UI elements
    const translations: Record<string, Record<string, string>> = {
      en: {
        tapToSpeak: "Tap to speak",
        listening: "Listening...",
        processing: "Processing...",
        typeMessage: "Type your message...",
        send: "Send",
        aiTutor: "AI English Tutor",
        practiceConversation: "Practice conversation with your AI teacher",
        switchToNative: "Switch to Native Language",
        switchToEnglish: "Switch to English",
        recordingVoice: "Recording voice message...",
        playMessage: "Play message",
        pauseMessage: "Pause message"
      },
      hi: {
        tapToSpeak: "बोलने के लिए टैप करें",
        listening: "सुन रहा है...",
        processing: "प्रोसेसिंग...",
        typeMessage: "अपना संदेश टाइप करें...",
        send: "भेजें",
        aiTutor: "AI अंग्रेजी शिक्षक",
        practiceConversation: "अपने AI शिक्षक के साथ बातचीत का अभ्यास करें",
        switchToNative: "मातृभाषा में बदलें",
        switchToEnglish: "अंग्रेजी में बदलें",
        recordingVoice: "आवाज़ संदेश रिकॉर्ड कर रहे हैं...",
        playMessage: "संदेश चलाएं",
        pauseMessage: "संदेश रोकें"
      },
      ta: {
        tapToSpeak: "பேச டேப் செய்யுங்கள்",
        listening: "கேட்டுக்கொண்டிருக்கிறது...",
        processing: "செயலாக்கம்...",
        typeMessage: "உங்கள் செய்தியை தட்டச்சு செய்யுங்கள்...",
        send: "அனுப்பு",
        aiTutor: "AI ஆங்கில ஆசிரியர்",
        practiceConversation: "உங்கள் AI ஆசிரியருடன் உரையாடல் பயிற்சி செய்யுங்கள்",
        switchToNative: "தாய்மொழிக்கு மாறு",
        switchToEnglish: "ஆங்கிலத்திற்கு மாறு",
        recordingVoice: "குரல் செய்தி பதிவு செய்கிறது...",
        playMessage: "செய்தியை இயக்கு",
        pauseMessage: "செய்தியை நிறுத்து"
      }
    };

    return translations[lang.code] || translations.en;
  };

  return {
    currentLanguage: getCurrentLanguage(),
    nativeLanguage: getNativeLanguage(),
    isNativeMode,
    toggleLanguageMode,
    translations: getTranslations(),
    supportedLanguages: SUPPORTED_LANGUAGES
  };
};