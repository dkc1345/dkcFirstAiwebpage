"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { sound } from "../audio";
import { FlashcardDeck, quizQuestions } from "../schoolData";
import {
  BookOpen,
  HelpCircle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Shuffle,
  Sparkles,
  Trophy,
  Brain,
  ListCheck,
} from "lucide-react";

interface FlashcardsTabProps {
  decks: FlashcardDeck[];
}

export default function FlashcardsTab({ decks }: FlashcardsTabProps) {
  const [activeDeckId, setActiveDeckId] = useState<string>(decks[0].id);
  const [mode, setMode] = useState<"flashcards" | "quiz">("flashcards");

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const currentCard = currentDeck.cards[cardIndex] || currentDeck.cards[0];

  // Filter quiz questions for the active deck
  const activeQuizList = quizQuestions.filter((q) => q.deckId === activeDeckId);
  const currentQuestion = activeQuizList[currentQuizIndex];

  const handleFlip = () => {
    sound.playClick();
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    sound.playClick();
    setIsFlipped(false);
    setShowHint(false);
    setCardIndex((prev) => (prev + 1) % currentDeck.cards.length);
  };

  const handlePrevCard = () => {
    sound.playClick();
    setIsFlipped(false);
    setShowHint(false);
    setCardIndex((prev) => (prev - 1 + currentDeck.cards.length) % currentDeck.cards.length);
  };

  const handleShuffle = () => {
    sound.playClick();
    setIsFlipped(false);
    setShowHint(false);
    setCardIndex(Math.floor(Math.random() * currentDeck.cards.length));
  };

  const markMastery = (mastered: boolean) => {
    if (mastered) {
      sound.playSuccess();
    } else {
      sound.playClick();
    }
    setMasteredCards((prev) => ({
      ...prev,
      [currentCard.id]: mastered,
    }));
    handleNextCard();
  };

  // Quiz handlers
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    sound.playClick();
    setSelectedAnswer(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    setIsAnswerSubmitted(true);

    if (selectedAnswer === currentQuestion.correctIndex) {
      sound.playSuccess();
      setQuizScore((prev) => prev + 1);
    } else {
      sound.playClick();
    }
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentQuizIndex + 1 < activeQuizList.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz completed!
      setQuizFinished(true);
      sound.playTimerBell();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#38bdf8", "#fbbf24"],
      });
    }
  };

  const resetQuiz = () => {
    sound.playClick();
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const masteredCount = currentDeck.cards.filter((c) => masteredCards[c.id]).length;
  const masteryPercent = Math.round((masteredCount / currentDeck.cards.length) * 100);

  return (
    <div className="flex flex-col min-w-0" style={{ gap: 'var(--section-gap)' }}>
      {/* Header and Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-indigo-400" />
            Study Decks & Quiz Arena
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Master high-yield subject concepts with 3D flashcards and test your recall with interactive quizzes.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => {
              setMode("flashcards");
              sound.playClick();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              mode === "flashcards"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => {
              setMode("quiz");
              resetQuiz();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              mode === "quiz"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ListCheck className="w-4 h-4" />
            <span>Quiz Mode</span>
          </button>
        </div>
      </div>

      {/* Deck Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 'var(--card-gap)' }}>
        {decks.map((deck) => {
          const isSelected = deck.id === activeDeckId;
          return (
            <button
              key={deck.id}
              onClick={() => {
                setActiveDeckId(deck.id);
                setCardIndex(0);
                setIsFlipped(false);
                setShowHint(false);
                resetQuiz();
                sound.playClick();
              }}
              className={`p-3.5 rounded-2xl text-left border transition-all duration-200 relative group overflow-hidden ${
                isSelected
                  ? "bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400/40"
                  : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{deck.icon}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${deck.color}20`,
                    color: deck.color,
                    border: `1px solid ${deck.color}40`,
                  }}
                >
                  {deck.badge}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-white group-hover:text-indigo-200 transition-colors truncate">
                {deck.title}
              </p>
              <p className="text-xs text-slate-400 truncate">{deck.subject}</p>
            </button>
          );
        })}
      </div>

      {/* FLASHCARD MODE */}
      {mode === "flashcards" && (
        <div className="flex flex-col min-w-0" style={{ gap: 'var(--section-gap)' }}>
          {/* Deck Mastery Bar */}
          <div className="glass-panel p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                Deck Progress: {masteredCount} of {currentDeck.cards.length} mastered ({masteryPercent}%)
              </span>
            </div>
            <div className="w-48 bg-white/10 rounded-full h-2 overflow-hidden hidden sm:block">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${masteryPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive 3D Flip Card */}
          <div className="max-w-2xl mx-auto">
            <div
              onClick={handleFlip}
              className="relative w-full h-80 sm:h-96 cursor-pointer select-none perspective-1000 group"
            >
              <div
                className={`relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d shadow-2xl ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front Side */}
                <div className="flashcard-face absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col justify-between backface-hidden border border-white/15 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                      style={{
                        backgroundColor: `${currentDeck.color}25`,
                        color: currentDeck.color,
                        border: `1px solid ${currentDeck.color}40`,
                      }}
                    >
                      {currentDeck.subject} • Card {cardIndex + 1}/{currentDeck.cards.length}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
                      <RotateCw className="w-3.5 h-3.5" /> Click anywhere to flip
                    </span>
                  </div>

                  <div className="my-auto text-center px-4">
                    <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                      {currentCard.front}
                    </p>
                    {showHint && currentCard.hint && (
                      <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs inline-block animate-fadeIn">
                        💡 <strong>Hint:</strong> {currentCard.hint}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                    {currentCard.hint && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setShowHint(!showHint);
                        }}
                        className="hover:text-amber-300 transition-colors flex items-center gap-1"
                      >
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span>{showHint ? "Hide Clue" : "Show Clue"}</span>
                      </button>
                    )}
                    <span className="ml-auto font-mono text-[11px] text-slate-500">
                      Tap card to reveal answer
                    </span>
                  </div>
                </div>

                {/* Back Side */}
                <div className="flashcard-face absolute inset-0 w-full h-full rounded-3xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 border border-indigo-500/30 bg-gradient-to-br from-[#0e172a] via-[#1e1b4b] to-[#0e172a] backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Explanation & Solution
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> Click to flip back
                    </span>
                  </div>

                  <div className="my-auto text-center px-4 overflow-y-auto max-h-52 py-2">
                    <p className="text-base sm:text-lg font-medium text-slate-100 whitespace-pre-line leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="text-center text-xs text-slate-400 pt-3 border-t border-white/10">
                    Did you get this correct?
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation & Knowledge Status Controls */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevCard}
                  className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  title="Previous card"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShuffle}
                  className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  title="Shuffle deck"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextCard}
                  className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  title="Next card"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Mastered / Review Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => markMastery(false)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold transition-all hover:scale-105"
                >
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span>Review Again</span>
                </button>
                <button
                  onClick={() => markMastery(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold transition-all hover:scale-105"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Mastered!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ ARENA MODE */}
      {mode === "quiz" && (
        <div className="max-w-2xl mx-auto">
          {activeQuizList.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-base font-bold text-white">No quiz questions for this deck yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Select Biology, Calculus, History, or CS to test questions.
              </p>
            </div>
          ) : quizFinished ? (
            /* Quiz Results Summary Screen */
            <div className="glass-panel p-8 sm:p-10 text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Quiz Completed!</h2>
                <p className="text-sm text-slate-400 mt-1">Here is your academic score breakdown</p>
              </div>

              <div className="inline-block p-6 rounded-3xl bg-white/[0.03] border border-white/10">
                <div className="text-5xl font-black text-emerald-400">
                  {Math.round((quizScore / activeQuizList.length) * 100)}%
                </div>
                <div className="text-sm text-slate-300 font-semibold mt-1">
                  {quizScore} out of {activeQuizList.length} Correct
                </div>
                <div className="mt-3 text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {quizScore === activeQuizList.length
                    ? "Grade: A+ (Outstanding Mastery!)"
                    : quizScore >= activeQuizList.length / 2
                    ? "Grade: B (Solid Performance)"
                    : "Grade: Needs Targeted Review"}
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={() => {
                    setMode("flashcards");
                    sound.playClick();
                  }}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-sm border border-white/10 transition-all"
                >
                  Back to Flashcards
                </button>
              </div>
            </div>
          ) : (
            /* Active Question Card */
            <div className="glass-panel p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Question {currentQuizIndex + 1} of {activeQuizList.length}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Score: {quizScore}/{activeQuizList.length}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  let btnStyle = "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.08]";

                  if (isAnswerSubmitted) {
                    if (idx === currentQuestion.correctIndex) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                    } else if (idx === selectedAnswer) {
                      btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                    }
                  } else if (selectedAnswer === idx) {
                    btnStyle = "bg-indigo-600/30 border-indigo-400 text-white font-semibold";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-left text-sm transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && idx === currentQuestion.correctIndex && (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted &&
                        idx === selectedAnswer &&
                        idx !== currentQuestion.correctIndex && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs sm:text-sm text-slate-200 space-y-1 animate-fadeIn">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Academic Explanation:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition-all hover:scale-105"
                  >
                    {currentQuizIndex + 1 < activeQuizList.length ? "Next Question" : "Finish Quiz"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
