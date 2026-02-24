import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import debounce from 'lodash/debounce';
import { 
  RotateCw, 
  MousePointer2, 
  CircleDot, 
  Code2, 
  Activity, 
  Vibrate,
  ArrowRight,
  Send,
  Stethoscope,
  Smartphone,
  Info,
  ChevronRight
} from 'lucide-react';

type Gesture = 'ring_rotate_cw' | 'thumb_press' | 'console_dial1_press';
type Command = 'refactor_telehealth' | 'patient_api' | 'health_dashboard';

interface WorkflowInput {
  gesture: Gesture;
  selected_text: string;
  command: Command;
}

interface WorkflowOutput {
  action: 'code_insert' | 'notification';
  content: string;
  haptic_feedback: 'short_vibrate' | 'long_pulse' | 'none';
  next_gesture: string;
}

const GESTURES: { id: Gesture; label: string; icon: any; desc: string }[] = [
  { id: 'ring_rotate_cw', label: 'Ring Rotate', icon: RotateCw, desc: 'Scroll or cycle options' },
  { id: 'thumb_press', label: 'Thumb Press', icon: MousePointer2, desc: 'Primary action / Select' },
  { id: 'console_dial1_press', label: 'Console Dial', icon: CircleDot, desc: 'Secondary adjustment' },
];

const COMMANDS: { id: Command; label: string; desc: string }[] = [
  { id: 'refactor_telehealth', label: 'Refactor Telehealth', desc: 'Optimize existing RN code' },
  { id: 'patient_api', label: 'Patient API', desc: 'Generate fetch/post logic' },
  { id: 'health_dashboard', label: 'Health Dashboard', desc: 'Create vitals visualization' },
];

export default function App() {
  const [input, setInput] = useState<WorkflowInput>({
    gesture: 'thumb_press',
    selected_text: '',
    command: 'health_dashboard',
  });

  const [output, setOutput] = useState<WorkflowOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [hapticActive, setHapticActive] = useState(false);

  // Debounced trigger to simulate 200ms throttle mentioned in specs
  const debouncedTrigger = useCallback(
    debounce(async (currentInput: WorkflowInput) => {
      setLoading(true);
      try {
        const response = await fetch('/api/workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentInput),
        });
        const data = await response.json();
        setOutput(data);
        
        if (data.haptic_feedback !== 'none') {
          setHapticActive(true);
          setTimeout(() => setHapticActive(false), 500);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 200),
    []
  );

  const triggerWorkflow = () => {
    if (!loading) {
      debouncedTrigger(input);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Smartphone className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">CursorGenie</span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">MX Actions SDK v1.0</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${hapticActive ? 'bg-blue-400 animate-pulse' : 'bg-blue-500'}`} />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Hardware Online</span>
            </div>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Input Configuration */}
          <div className="lg:col-span-5 space-y-10">
            <header className="space-y-2">
              <h2 className="text-2xl font-semibold text-white tracking-tight">Gesture Simulator</h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Configure the hardware state to simulate a real-time event from your Logitech MX device.
              </p>
            </header>

            <div className="space-y-8">
              {/* Gestures Section */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">1. Select Gesture</h3>
                <div className="grid grid-cols-1 gap-2">
                  {GESTURES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setInput({ ...input, gesture: g.id })}
                      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                        input.gesture === g.id 
                          ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                          : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:border-white/10 hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          input.gesture === g.id ? 'bg-blue-500/20' : 'bg-black/40'
                        }`}>
                          <g.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold">{g.label}</p>
                          <p className="text-[11px] opacity-60">{g.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${input.gesture === g.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Commands Section */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">2. Define Intent</h3>
                <div className="grid grid-cols-1 gap-2">
                  {COMMANDS.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => setInput({ ...input, command: cmd.id })}
                      className={`flex flex-col p-4 rounded-2xl border transition-all duration-200 ${
                        input.command === cmd.id 
                          ? 'bg-white text-black border-white shadow-xl shadow-white/5' 
                          : 'bg-zinc-900/30 border-white/5 text-zinc-500 hover:border-white/10'
                      }`}
                    >
                      <span className="text-sm font-bold">{cmd.label}</span>
                      <span className={`text-[11px] ${input.command === cmd.id ? 'text-black/60' : 'text-zinc-600'}`}>{cmd.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Section */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">3. Code Context</h3>
                <div className="relative group">
                  <textarea
                    value={input.selected_text}
                    onChange={(e) => setInput({ ...input, selected_text: e.target.value })}
                    placeholder="Paste code snippet to refactor..."
                    className="w-full h-32 bg-zinc-900/30 border border-white/5 rounded-2xl p-4 text-sm font-mono focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/50 transition-all resize-none placeholder:text-zinc-700"
                  />
                  <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-700 pointer-events-none uppercase">
                    Optional
                  </div>
                </div>
              </div>

              <button
                onClick={triggerWorkflow}
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-900/20 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Generate Telehealth Logic
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Output Display */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
              <AnimatePresence mode="wait">
                {output ? (
                  <motion.div
                    key="output"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                      {/* Subtle Background Glow */}
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
                      
                      <div className="relative space-y-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-widest">
                            {output.action.replace('_', ' ')}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                            <Vibrate className={`w-3 h-3 ${hapticActive ? 'text-blue-400 animate-bounce' : ''}`} />
                            {output.haptic_feedback.replace('_', ' ')}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-2xl font-medium text-white tracking-tight">
                            {output.action === 'code_insert' ? 'Generated Implementation' : 'System Message'}
                          </h3>
                          <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative bg-black rounded-2xl p-6 border border-white/5 font-mono text-sm leading-relaxed text-blue-100/90 overflow-x-auto whitespace-pre">
                              {output.content}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-2xl border border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <ArrowRight className="text-blue-400 w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Next Step</p>
                            <p className="text-sm font-medium text-zinc-300">{output.next_gesture}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-8">
                      <details className="group">
                        <summary className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-zinc-400 transition-colors list-none flex items-center gap-2">
                          <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                          View Raw Payload
                        </summary>
                        <pre className="mt-4 bg-black/40 border border-white/5 rounded-2xl p-6 text-[11px] font-mono text-blue-500/60 overflow-x-auto">
                          {JSON.stringify(output, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-8 border-2 border-dashed border-white/5 rounded-[2rem] bg-zinc-900/10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
                      <div className="relative w-24 h-24 rounded-3xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-2xl">
                        <Code2 className="w-10 h-10 text-zinc-600" />
                      </div>
                    </div>
                    <div className="space-y-3 max-w-xs">
                      <h3 className="text-lg font-medium text-zinc-300">Awaiting Hardware Event</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        Select a gesture and command to simulate the Cursor.IDE plugin behavior.
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8 text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-3 h-3" />
              <span>Bengaluru Context</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>Vitals Monitoring</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-zinc-700 uppercase">Built for Logitech MX</span>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded bg-zinc-900 border border-white/5" />
              <div className="w-6 h-6 rounded bg-zinc-900 border border-white/5" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
