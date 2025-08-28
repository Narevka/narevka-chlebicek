# 🤖 AI Chatbot System

Kompletny system chatbota AI z integracją OpenAI i Supabase jest gotowy!

## 🚀 Funkcjonalności

- ✅ **OpenAI Assistant API** - Zaawansowane odpowiedzi AI
- ✅ **Supabase Database** - Przechowywanie rozmów i wiadomości  
- ✅ **Wielojęzyczność** - Automatyczne wykrywanie języka
- ✅ **Embed Script** - Łatwa integracja z dowolną stroną
- ✅ **Debug Panel** - Zaawansowane debugowanie
- ✅ **Responsive Design** - Działa na wszystkich urządzeniach

## 🛠 Jak używać

### 1. Dla deweloperów - Test w przeglądarce
Otwórz: `https://your-domain.com/chatbot/AGENT_ID`

### 2. Osadzenie na stronie internetowej
```html
<!-- Dodaj ten kod do swojej strony HTML -->
<script>
  window.chatbaseConfig = {
    chatbotId: 'YOUR_AGENT_ID',
    domain: 'https://your-domain.com',
    title: 'Chat z AI',
    primaryColor: '#4F46E5'
  };
</script>
<script src="https://your-domain.com/embed.min.js"></script>
```

### 3. Konfiguracja iframe
```html
<iframe 
  src="https://your-domain.com/chatbot-iframe/YOUR_AGENT_ID" 
  width="400" 
  height="600"
  style="border: none; border-radius: 12px;">
</iframe>
```

## 🔧 Konfiguracja

### Wymagane zmienne środowiskowe (już skonfigurowane):
- `OPENAI_API_KEY` ✅ - Klucz API OpenAI
- `SUPABASE_URL` ✅ - URL projektu Supabase  
- `SUPABASE_SERVICE_ROLE_KEY` ✅ - Klucz serwisowy Supabase

### Baza danych (już skonfigurowana):
- `agents` - Agenci AI
- `conversations` - Rozmowy użytkowników
- `messages` - Wiadomości w rozmowach
- `agent_sources` - Źródła wiedzy agentów
- `user_roles` - Role użytkowników (admin/user)

## 📁 Struktura plików

```
public/
├── embed.min.js              # Skrypt do osadzania na stronach
├── chatbot-iframe-template.html # Template dla iframe
├── chatbot.html              # Standalone chatbot
└── chatbot/
    ├── main.js               # Główna logika chatbota
    ├── message-handlers.js   # Obsługa wiadomości
    ├── db-handlers.js        # Operacje na bazie danych
    ├── debug-utils.js        # Narzędzia debugowania
    └── styles.css            # Style CSS

supabase/functions/
└── chat-with-assistant/
    ├── index.ts              # Główna funkcja Edge
    ├── conversation-manager.ts # Zarządzanie rozmowami
    ├── language-utils.ts     # Wykrywanie języka
    └── security-utils.ts     # Bezpieczeństwo
```

## 🧪 Testing

### Debug Mode
1. Otwórz chatbot w przeglądarce
2. Kliknij przycisk "Debug" 
3. Zobacz szczegółowe logi żądań i odpowiedzi

### Test na różnych urządzeniach
- ✅ Desktop - pełne funkcje
- ✅ Mobile - responsywny design  
- ✅ Tablet - optymalne wyświetlanie

## 🔐 Bezpieczeństwo

- ✅ **CORS Headers** - Zabezpieczenie cross-origin
- ✅ **Rate Limiting** - Ochrona przed spamem
- ✅ **Input Validation** - Walidacja danych wejściowych
- ✅ **RLS Policies** - Row Level Security w Supabase
- ✅ **API Key Protection** - Bezpieczne przechowywanie kluczy

## 📈 Monitorowanie

- **Debug Panel** - Podgląd żądań i błędów w czasie rzeczywistym
- **Supabase Dashboard** - Statystyki bazy danych
- **OpenAI Usage** - Monitoring zużycia API

## 🎨 Personalizacja

### Kolory i wygląd
Edytuj `public/chatbot/styles.css` aby zmienić:
- Kolory główne
- Czcionki
- Animacje
- Layout

### Komunikaty
Edytuj pliki JavaScript aby zmienić:
- Wiadomości powitalne
- Komunikaty błędów  
- Teksty interfejsu

## 🚨 Tymczasowe ograniczenia

- **Role użytkowników**: Tymczasowo wyłączone (zawsze 'user') - zostanie włączone gdy typy TypeScript się zaktualizują
- **Tytuły rozmów**: Tymczasowo wyłączone - zostanie włączone gdy typy TypeScript się zaktualizują

Te funkcje zostaną automatycznie przywrócone po aktualizacji typów Supabase.

## 💡 Porady

1. **Performance**: Używaj cache dla częstych zapytań
2. **SEO**: Dodaj meta tagi dla chatbot pages  
3. **Analytics**: Dodaj tracking eventów rozmów
4. **Backup**: Regularne kopie zapasowe bazy danych

---

**System gotowy do użycia!** 🎉

Aby przetestować, otwórz: `/chatbot/test-agent` lub osadź na swojej stronie używając embed script.