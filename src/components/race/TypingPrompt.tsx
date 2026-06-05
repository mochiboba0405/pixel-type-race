import { getPromptDisplayTokens } from '../../features/race/typingAlignment';

type TypingPromptProps = {
  prompt: string;
  typed: string;
};

export function TypingPrompt({ prompt, typed }: TypingPromptProps) {
  const displayTokens = getPromptDisplayTokens(prompt, typed);

  return (
    <div className="typing-prompt" aria-label="Typing prompt">
      {displayTokens.map((token, index) => (
        <span className={getTokenClassName(token.kind)} key={`${token.kind}-${token.promptIndex}-${token.typedIndex}-${index}`}>
          {token.char}
        </span>
      ))}
    </div>
  );
}

function getTokenClassName(kind: ReturnType<typeof getPromptDisplayTokens>[number]['kind']) {
  const classNames = ['typing-prompt__char'];

  if (kind === 'correct') {
    classNames.push('typing-prompt__char--correct');
  }

  if (kind === 'wrong') {
    classNames.push('typing-prompt__char--wrong');
  }

  if (kind === 'missing') {
    classNames.push('typing-prompt__char--wrong', 'typing-prompt__char--missing');
  }

  if (kind === 'extra') {
    classNames.push('typing-prompt__char--extra');
  }

  if (kind === 'current') {
    classNames.push('typing-prompt__char--current');
  }

  return classNames.join(' ');
}
