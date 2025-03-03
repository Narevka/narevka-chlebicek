
import { useEffect, useState, useRef } from 'react'

export function HighlightedPasswordDisplay({
  password, 
  confirmPassword,
  onChange
}: {
  password: string;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Render password dots with highlighting based on confirmation input
  const renderPasswordDots = () => {
    const dots = [];
    
    for (let i = 0; i < password.length; i++) {
      // Determine if this character has been matched in the confirmation
      const isMatched = i < confirmPassword.length && password[i] === confirmPassword[i];
      const isNonMatch = i < confirmPassword.length && password[i] !== confirmPassword[i];
      
      // Only add background color if it's been typed in confirmation
      const bgColor = isMatched ? 'bg-green-500/15' : (isNonMatch ? 'bg-red-500/15' : '');
      
      dots.push(
        <div 
          key={i}
          className={`inline-block ${bgColor}`}
          style={{ width: '6px', height: '100%', marginRight: '0px' }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="w-1 h-1 rounded-full bg-black"></div>
          </div>
        </div>
      );
    }
    
    return dots;
  };

  return (
    <div className="relative">
      {/* Custom password field with highlighting */}
      <div 
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 mt-1"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex items-center h-full">
          {renderPasswordDots()}
          
          {/* Blinking cursor positioned after the last typed character */}
          {isFocused && (
            <div 
              className="h-4 w-0.5 bg-black animate-blink"
              style={{ 
                position: 'absolute',
                left: `${12 + (password.length * 6)}px` // Position after last character
              }}
            ></div>
          )}
        </div>
      </div>
      
      {/* Hidden input field for actual typing */}
      <input
        ref={inputRef}
        id="password"
        type="password"
        value={password}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required
        className="sr-only"
        placeholder="Password"
      />
    </div>
  )
}
