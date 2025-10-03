import React, { useEffect, useRef, useState } from 'react';

const SAMPLE_QUESTIONS = [
  { id: 1, q: "According to Youmio’s tweet, approximately how many wearable SBTs have been minted and mentioned as listed on OpenSea?", options: ["~6,500", "~65,000", "~650,000", "~65"], a: 1 },
  { id: 2, q: "In the Youmio announcement, the project said its ecosystem will be “living on its own L1” in partnership with which network?", options: ["Ethereum", "Solana", "Avalanche (AVAX)", "Polygon"], a: 2 },
  { id: 3, q: "What does “L1” most commonly refer to in blockchain terminology (as used in the Youmio announcement)?", options: ["A second-layer scaling solution", "A Layer-1 blockchain (base/mainchain)", "A token standards committee", "A decentralized exchange (DEX)"], a: 1 },
  { id: 4, q: "What is OpenSea in the context of Youmio’s tweet about wearable SBTs?", options: ["A hardware wallet brand", "An NFT marketplace where digital assets like wearables can be listed and viewed", "A Layer-1 blockchain", "A decentralized identity protocol"], a: 1 },
  { id: 5, q: "Youmio mentioned a “Mint to Chain” style utility in their posts. Which of the following best describes “mint-to-chain”?", options: ["Sending NFTs from one chain to another automatically", "Minting an asset (NFT/SBT) directly on a blockchain so the token exists on-chain immediately", "A swap between tokens across DEXs", "Off-chain storage of metadata only"], a: 1 },
  { id: 6, q: "Which Youmio milestone was explicitly mentioned in their posts as a measure of early network activity?", options: ["10,000 wallets created", "Closed Testnet crossed 500k transactions", "1 million active users", "Mainnet launch on Ethereum"], a: 1 },
  { id: 7, q: "What kind of reward mechanic did Youmio reference as part of their L1 ecosystem (useful for community/utility)?", options: ["Proof-of-Work mining rewards", "Affinity rewards mechanics tied to utility and 3D assets", "Only simple airdrops with no utility", "Yield farming for stablecoins"], a: 1 },
  { id: 8, q: "If a user wants to view Youmio’s wearable SBT listings as referenced in the tweet, what’s the most direct place to check?", options: ["A centralized exchange order book", "The OpenSea marketplace listing for the project", "An email newsletter archive", "A private Discord DM only"], a: 1 },
  { id: 9, q: "Why would a project choose to run its own L1 (as Youmio announced) instead of staying entirely on another chain? (Best single answer)", options: ["To avoid needing any validators or nodes", "To have custom consensus, lower fees, and tighter control over protocol features and economics", "To become fully centralized under one company", "To eliminate the need for wallets"], a: 1 },
  { id: 10, q: "Which claim below best matches Youmio’s public positioning from the analysed tweets?", options: ["Youmio is primarily a hardware wallet company.", "Youmio is building an on-chain AI/3D agent ecosystem with NFTs/SBT utilities, launching L1 infrastructure (partnering with AVAX) and achieving testnet growth.", "Youmio is only a social media marketing agency.", "Youmio is shutting down operations."], a: 1 }
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [questions, setQuestions] = useState(() => shuffle(SAMPLE_QUESTIONS));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(15);
  const [running, setRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [minted, setMinted] = useState(false);
  const timerRef = useRef(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('quiz_leaderboard');
      if (raw) setLeaderboard(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (running) startTimer();
    else stopTimer();
    return () => stopTimer();
  }, [running]);

  useEffect(() => {
    if (timeLeft <= 0 && running) {
      handleNext();
    }
  }, [timeLeft]);

  function startTimer() {
    stopTimer();
    setTimeLeft(15);
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startQuiz() {
    setQuestions(shuffle(SAMPLE_QUESTIONS));
    setIndex(0);
    setAnswers({});
    setScore(0);
    setShowResult(false);
    setMinted(false);
    setRunning(true);
    setTimeLeft(15);
  }

  function selectOption(qid, optIdx) {
    setAnswers((s) => ({ ...s, [qid]: optIdx }));
  }

  function handleNext() {
    stopTimer();
    const isLast = index === questions.length - 1;
    if (!isLast) {
      setIndex((i) => i + 1);
      setTimeLeft(15);
      startTimer();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    stopTimer();
    setRunning(false);
    const totalCorrect = questions.reduce((acc, q) => acc + (answers[q.id] === q.a ? 1 : 0), 0);
    setScore(totalCorrect);
    setShowResult(true);
  }

  function saveResult() {
    const entry = { name: name || 'Anonymous', score, total: questions.length, date: new Date().toISOString() };
    const updated = [entry, ...leaderboard].slice(0, 50);
    setLeaderboard(updated);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('quiz_leaderboard', JSON.stringify(updated)); } catch (e) {}
    }
  }

  function exportLeaderboard() {
    const csv = leaderboard.map((r) => `${r.name},${r.score},${r.total},${r.date}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leaderboard.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function mintNFT() {
    setMinted(true);
  }

  const current = questions[index] || { q: '', options: [], a: null, id: null };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold">Youmio Quiz</h1>
            <div className="text-sm text-gray-500">10 Questions · 15s each</div>
          </div>

          {!running && !showResult && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-white to-indigo-50 rounded-2xl">
                <p className="text-gray-700">Test your knowledge of Youmio. Score at least 7/10 to unlock an NFT mint option.</p>
                <div className="mt-4 flex gap-2">
                  <input className="border rounded px-3 py-2 w-full" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={startQuiz} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full">Start Quiz</button>
                  <button onClick={exportLeaderboard} className="px-4 py-2 bg-gray-100 rounded-full">Export Leaderboard</button>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-white to-purple-50 rounded-2xl flex flex-col justify-center">
                <div className="text-sm text-gray-500">How it works</div>
                <ol className="list-decimal ml-5 mt-2 text-sm text-gray-700">
                  <li>10 randomized questions</li>
                  <li>15 seconds per question</li>
                  <li>Answer 7 or more to unlock NFT mint</li>
                </ol>
                <div className="mt-4 text-xs text-gray-400">Your answers are stored locally in your browser.</div>
              </div>
            </div>
          )}

          {running && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">Question {index + 1} / {questions.length}</div>
                <div className="text-sm font-medium">Time: {Math.max(0, timeLeft)}s</div>
              </div>

              <div className="mb-4 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl">
                <div className="text-xl font-semibold mb-3">{current.q}</div>
                <div className="mt-3 grid gap-3">
                  {current.options.map((opt, i) => (
                    <button key={i} onClick={() => selectOption(current.id, i)} className={`text-left p-4 rounded-xl border w-full text-sm ${answers[current.id] === i ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-gray-200 bg-white'}`}>
                      <div className="font-medium">{String.fromCharCode(65 + i)}. {opt}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => { setRunning(false); stopTimer(); }} className="px-4 py-2 bg-gray-100 rounded-full">Pause</button>
                <div className="flex gap-2">
                  <button onClick={() => { const prev = Math.max(0, index - 1); setIndex(prev); setTimeLeft(15); }} className="px-4 py-2 bg-gray-100 rounded-full">Prev</button>
                  <button onClick={handleNext} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full">Next</button>
                </div>
              </div>
            </div>
          )}

          {showResult && (
            <div className="mt-6">
              <div className="text-center mb-4">
                <div className="text-4xl font-extrabold">{score} / {questions.length}</div>
                <div className="text-sm text-gray-600">{Math.round((score / questions.length) * 100)}% correct</div>
              </div>
              <div className="flex justify-center gap-3 mb-4">
                <button onClick={() => { setShowResult(false); setRunning(false); startQuiz(); }} className="px-6 py-2 bg-indigo-600 text-white rounded-full">Retry</button>
                <button onClick={saveResult} className="px-6 py-2 bg-green-500 text-white rounded-full">Save Result</button>
                <button onClick={() => { setShowResult(false); }} className="px-6 py-2 bg-gray-100 rounded-full">Close</button>
              </div>

              {score >= 7 && !minted && (
                <div className="flex justify-center mb-4">
                  <button onClick={mintNFT} className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full font-bold">Mint your NFT</button>
                </div>
              )}

              {minted && (
                <div className="text-center mb-4 p-4 bg-yellow-50 rounded-xl">Congratulations — your NFT mint was simulated and marked as minted in this demo.</div>
              )}

              <div>
                <h3 className="font-semibold">Answer Key</h3>
                <ul className="list-disc ml-5 mt-2">
                  {questions.map((q) => (
                    <li key={q.id}><strong>{q.q}</strong> — {String.fromCharCode(65 + q.a)}. {q.options[q.a]}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
        <div className="bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Leaderboard</div>
            <div className="text-sm text-gray-500">Top {leaderboard.length}</div>
          </div>
          <div>
            {leaderboard.length === 0 && <div className="text-sm text-gray-500">No results yet</div>}
            {leaderboard.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-white">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-gray-500">{new Date(r.date).toLocaleString()}</div>
                </div>
                <div className="font-medium">{r.score} / {r.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
