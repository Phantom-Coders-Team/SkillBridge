"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Send, Video, Square, Sparkles, User, ShieldAlert } from "lucide-react";
import { PageHeader, Card } from "@/components/ui";

type Message = { role: "system" | "user"; text: string };

const INITIAL_MESSAGES: Message[] = [
  { role: "system", text: "Hello! I am your AI Mock Interviewer. I'll be evaluating your technical knowledge and behavioral responses today. Are you ready to begin?" }
];

export default function MockInterviewPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response based on the conversation turn
    setTimeout(() => {
      let aiResponse = "";
      const turn = messages.length;
      
      if (turn === 1) {
        aiResponse = "Great. Let's start with a behavioral question. Tell me about a time you had a disagreement with a team member on a technical decision. How did you resolve it?";
      } else if (turn === 3) {
        aiResponse = "That's a good approach to conflict resolution. Now, a technical question: Can you explain the difference between Server-Side Rendering (SSR) and Static Site Generation (SSG) in Next.js, and when you would choose one over the other?";
      } else if (turn === 5) {
        aiResponse = "Excellent explanation. Your responses show a solid understanding of both technical trade-offs and team collaboration. I've logged these results to your skill profile. We are done for today!";
      } else {
        aiResponse = "Thank you for the response. Based on your answers, your profile is looking strong!";
      }

      setMessages((prev) => [...prev, { role: "system", text: aiResponse }]);
      setIsTyping(false);
    }, 2000);
  };

  const recognitionRef = useRef<any>(null);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      recognitionRef.current?.stop();
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      let currentTranscript = input ? input + " " : "";
      
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setInput(currentTranscript + finalTranscript + interimTranscript);
        if (finalTranscript) {
           currentTranscript += finalTranscript;
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        icon={Video}
        title="AI Mock Interviews"
        subtitle="Practice behavioral and technical questions dynamically with our AI engine."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <Card className="flex flex-col h-[600px] overflow-hidden border-border-muted shadow-sm">
          {/* Header */}
          <div className="border-b border-border-muted bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="size-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="size-4" />
                </div>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Interviewer Bot</h3>
                <p className="text-xs text-slate-500">Active • Recording Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 rounded-lg">
              <ShieldAlert className="size-3.5" /> Evaluative Mode
            </div>
          </div>

          {/* Chat History */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-surface">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                <div className={`size-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === "system" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                  {msg.role === "system" ? <Sparkles className="size-4" /> : <User className="size-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white dark:bg-slate-800 border border-border-muted text-slate-800 dark:text-slate-200 rounded-tl-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="size-8 rounded-full shrink-0 flex items-center justify-center bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                  <Sparkles className="size-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-border-muted rounded-tl-sm flex items-center gap-1">
                  <span className="size-2 rounded-full bg-slate-400 animate-bounce" />
                  <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="size-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border-muted p-3 bg-white dark:bg-surface">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRecord}
                className={`p-3 rounded-xl transition-all ${isRecording ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"}`}
              >
                {isRecording ? <Square className="size-5" /> : <Mic className="size-5" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response or use voice..."
                className="flex-1 bg-slate-100 dark:bg-slate-800/50 border-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Send className="size-5" />
              </button>
            </form>
          </div>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Live Analysis</h3>
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  <span>Confidence Level</span>
                  <span className="text-emerald-600">High</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  <span>Technical Accuracy</span>
                  <span className="text-indigo-600">Pending</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full bg-indigo-500 rounded-full w-[40%]" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-5 border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/10">
            <Sparkles className="size-5 text-indigo-600 mb-2" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Why this matters?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Our AI evaluates your soft skills, conflict resolution, and technical trade-off reasoning in real-time. This helps bridge the gap between academic knowledge and industry expectations.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
