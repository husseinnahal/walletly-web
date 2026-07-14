'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const answers = [
  'Check your budget first',
  'Your savings goal comes first',
  'You can plan for it',
  'Review your spending flow',
  'A small step is enough today',
  'Set some money aside first',
  'Clear a bill before deciding',
  'Keep your debt plan on track',
  'This can wait until payday',
  'Your budget has the answer',
  'Track the cost, then decide',
  'Choose the wallet-friendly option',
  'Ask Coiny for a second opinion',
  'Your future balance will thank you',
  'Make room for it in your budget',
  'Save now and revisit it later',
];

export default function FatePage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState('ask');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  const isChooseMode = selectedMode === 'choose';

  const customOptions = useMemo(
    () => input
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
    [input]
  );

  const changeMode = (mode) => {
    setSelectedMode(mode);
    setResult('');
    setInput('');
    setIsSpinning(false);
  };

  const runBall = () => {
    if (!input.trim() || isSpinning) return;

    if (isChooseMode && customOptions.length < 2) {
      setResult('Add at least 2 options');
      return;
    }

    setResult('');
    setIsSpinning(true);

    window.setTimeout(() => {
      const source = isChooseMode ? customOptions : answers;
      const randomIndex = Math.floor(Math.random() * source.length);
      setResult(source[randomIndex]);
      setIsSpinning(false);
    }, 1200);
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>

        <div className={styles.modeSwitch} aria-label="Fate mode">
          <ModeButton
            label="Ask Fate"
            isSelected={selectedMode === 'ask'}
            onClick={() => changeMode('ask')}
          />
          <ModeButton
            label="Choose For Me"
            isSelected={selectedMode === 'choose'}
            onClick={() => changeMode('choose')}
          />
        </div>

        <section className={styles.gameArea}>
          <div className={`${styles.magicBall} ${isSpinning ? styles.spinning : ''}`}>
            <div className={styles.ballHighlight} />
            <div className={styles.answerWindow}>
              <span className={result ? styles.resultText : styles.eightText}>
                {result || '8'}
              </span>
            </div>
          </div>

          <p className={styles.resultLine}>
            {result
              ? `"${result}"`
              : isChooseMode
                ? 'Add options and let the ball choose'
                : 'Ask anything...'}
          </p>
        </section>

        <section className={styles.inputPanel}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={isChooseMode ? 4 : 1}
            className={styles.input}
            placeholder={
              isChooseMode
                ? 'Save, Pay a bill, Clear a debt or write each option on a new line'
                : 'Should I spend or save today?'
            }
          />
        </section>

        <button
          type="button"
          className={styles.askButton}
          onClick={runBall}
          disabled={!input.trim() || isSpinning}
        >
          <Sparkles size={18} />
          <span>{isSpinning ? 'Thinking...' : isChooseMode ? 'Choose For Me' : 'Ask the Ball'}</span>
        </button>
      </div>
    </main>
  );
}

function ModeButton({ label, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.modeButton} ${isSelected ? styles.modeButtonSelected : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
