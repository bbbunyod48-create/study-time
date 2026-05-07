const App = () => {
  const [bioState, setBioState] = useState({ lightMode: false });

  // Simple conditional theme mapping
  const themeClass = bioState.lightMode 
    ? "bg-amber-900/20 text-amber-100" // Soft Amber for sleep debt
    : "bg-slate-950 text-cyan-100";    // Deep Neon for peak performance

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${themeClass}`}>
      <nav className="p-6 flex justify-between items-center backdrop-blur-lg border-b border-white/10">
        <h1 className="text-2xl font-black tracking-tighter italic">NEURO<span className="text-cyan-400">FLOW</span></h1>
        <div className="badge bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-xs border border-cyan-500/50">
          Focus Score: 88%
        </div>
      </nav>
      <main className="p-8 grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
           <CircadianChart />
           <div className="grid grid-cols-2 gap-6">
              <EisenhowerMatrix />
              {/* Task List and Scheduler would go here */}
           </div>
        </div>
        <div className="col-span-4">
           <GlassCard className="p-6 h-full">
              <h2 className="text-xl font-bold mb-4">Adaptive Strategy</h2>
              <p className="text-sm opacity-70">
                {bioState.lightMode 
                  ? "Sleep debt detected. Shifting to Light Review Mode. Complex tasks deferred." 
                  : "Optimal cognitive window open. Priority: Deep Work Sessions."}
              </p>
           </GlassCard>
        </div>
      </main>
    </div>
  );
};