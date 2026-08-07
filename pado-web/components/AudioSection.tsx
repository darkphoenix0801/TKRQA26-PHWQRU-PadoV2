"use client";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function AudioSection({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [questionGenerated, setQuestionGenerated] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [sessionId, setSessionId] = useState("");
  
  // Audio recording state
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const resultRef = useRef(null);

  function animateIn(el) {
    if (!el) return;
    gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
  }

  async function generateQuestion() {
    setError("");
    setResult(null);
    setAudioUrl(null);
    setAudioBlob(null);
    setLoading(true);
    
    try {
      const studentId = user?.student_id || "demo_user";
      const res = await fetch(`${BACKEND}/student/${studentId}`);
      if (!res.ok) {
        throw new Error("Please register your profile in Step 01 first.");
      }
      
      const profile = await res.json();
      setSessionId(`audio_${Date.now()}`);
      
      const qRes = await fetch(`${BACKEND}/interview/random_behavioral`);
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestionText(qData.question);
      } else {
        setQuestionText("Tell me about a time you faced a significant technical challenge at work or college and how you overcame it.");
      }
      
      setQuestionGenerated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    setError("");
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        // Stop all audio tracks in stream
        stream.getTracks().forEach((track) => track.stop());
      };
      
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setError("Microphone access denied or unavailable.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function submitAudio() {
    if (!audioBlob) return;
    setError("");
    setLoading(true);
    
    const fd = new FormData();
    fd.append("student_id", user?.student_id || "demo_user");
    fd.append("session_id", sessionId);
    fd.append("question_number", "1");
    fd.append("question_text", questionText);
    fd.append("category", "Behavioral");
    // Append audio file as answer.wav
    fd.append("audio_file", audioBlob, "answer.wav");
    
    try {
      const res = await fetch(`${BACKEND}/interview/answer_audio`, {
        method: "POST",
        body: fd,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Audio submission failed.");
      
      setResult(data);
      setTimeout(() => animateIn(resultRef.current), 50);
    } catch (err) {
      if (err.message.toLowerCase().includes("timeout") || err.message.includes("fetch")) {
        setError("The AI analysis took too long. This usually happens on slow connections or if the transcription service is waking up. Please try again.");
      } else {
        setError("Analysis failed: " + err.message + ". If this persists, try recording a shorter answer.");
      }
    } finally {
      setLoading(false);
    }
  }

  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 font-serif" style={{ letterSpacing: "-0.01em" }}>
            Audio & Speech Confidence Training
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
            Practice speaking clearly. The system transcribes your answer via Whisper, analyzes voice tone features using Librosa, and grades your content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Audio Controls */}
          <div className="space-y-6">
            <button
              onClick={generateQuestion}
              disabled={loading}
              className="w-full py-3.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              {loading && !questionGenerated ? "Generating..." : "Generate Audio Question"}
            </button>

            {questionGenerated && (
              <div className="glass-tile p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Question</p>
                  <p className="text-sm font-semibold text-gray-900 leading-relaxed">{questionText}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-200/50 rounded-xl bg-white/55 space-y-4">
                  {!recording ? (
                    <button
                      onClick={startRecording}
                      className="px-6 py-3 bg-red-500 text-white text-xs font-semibold rounded-full hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-red-500/20"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                      Record Answer
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-black text-white text-xs font-semibold rounded-full hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-sm animate-pulse" />
                      Stop Recording
                    </button>
                  )}

                  {audioUrl && (
                    <div className="w-full flex flex-col items-center gap-3 pt-2">
                      <audio src={audioUrl} controls className="w-full h-9" />
                      <button
                        onClick={submitAudio}
                        disabled={loading}
                        className="w-full py-2.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-all disabled:bg-gray-200 disabled:text-gray-400"
                      >
                        {loading ? "Analyzing..." : "Submit Audio Answer →"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          </div>

          {/* Results Output */}
          <div ref={resultRef}>
            {result ? (
              <div className="glass-tile p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Analysis Complete</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/80 border border-white/50 p-4 rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-gray-900">{result.confidence_score.toFixed(1)}<span className="text-sm text-gray-400 font-normal">/100</span></p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mt-1">Confidence Score</p>
                    </div>
                    <div className="bg-white/80 border border-white/50 p-4 rounded-xl shadow-sm">
                      <p className="text-2xl font-bold text-gray-900">{result.turn_result.content_score}<span className="text-sm text-gray-400 font-normal">/100</span></p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mt-1">Content Score</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Whisper Transcription</p>
                      <p className="text-sm text-gray-600 italic bg-white/80 p-4 rounded-xl border border-white/50">
                        "{result.transcription}"
                      </p>
                    </div>

                    {result.turn_result.weakness_tag && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Weakness Identified</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 inline-block">
                          {result.turn_result.weakness_tag}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Evaluation & Feedback</p>
                      <p className="text-sm text-gray-900 leading-relaxed bg-white/80 p-4 rounded-xl border border-white/50 whitespace-pre-wrap">
                        {result.turn_result.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-64 flex flex-col items-center justify-center border border-dashed border-gray-200/50 bg-white/35 rounded-2xl text-center p-8">
                <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-4 text-gray-500 text-xl border border-white/50">
                  🎙️
                </div>
                <p className="text-sm font-medium text-gray-700">Audio feedback will appear here</p>
                <p className="text-xs text-gray-400 mt-1">Submit your recorded answer to see the speech & score analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
