type TypingPromptProps = {
  prompt: string;
  typed: string;
};

export function TypingPrompt({ prompt, typed }: TypingPromptProps) {
  return (
    <div className="typing-prompt" aria-label="Typing prompt">
      {prompt.split('').map((character, index) => {
        const typedCharacter = typed[index];
        const isCurrent = index === typed.length;
        const className =
          typedCharacter === undefined
            ? isCurrent
              ? 'typing-prompt__char typing-prompt__char--current'
              : 'typing-prompt__char'
            : typedCharacter === character
              ? 'typing-prompt__char typing-prompt__char--correct'
              : 'typing-prompt__char typing-prompt__char--wrong';

        return (
          <span className={className} key={`${character}-${index}`}>
            {character === ' ' ? '\u00A0' : character}
          </span>
        );
      })}
    </div>
  );
}
