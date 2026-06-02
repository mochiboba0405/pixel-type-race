import { useEffect, useRef } from 'react';

type TypingInputProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function TypingInput({ value, disabled, onChange }: TypingInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <label className="typing-input">
      <span>Your typing</span>
      <textarea
        ref={inputRef}
        value={value}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
