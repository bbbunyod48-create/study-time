import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { Zap, Clock, Trash2 } from 'lucide-react';

const EisenhowerMatrix = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Final Exam Study", q: "Q1" },
    { id: 2, title: "Read Biology Paper", q: "Q2" },
  ]);

  const quadrants = {
    Q1: { title: "Do Now", color: "text-red-400", icon: <Zap size={16}/> },
    Q2: { title: "Schedule", color: "text-blue-400", icon: <Clock size={16}/> },
    Q3: { title: "Delegate", color: "text-yellow-400", icon: <Zap size={16}/> },
    Q4: { title: "Eliminate", color: "text-gray-400", icon: <Trash2 size={16}/> },
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 h-full">
      {Object.entries(quadrants).map(([id, info]) => (
        <GlassCard key={id} className="p-4 min-h-[200px] flex flex-col">
          <h3 className={`text-sm font-bold uppercase mb-3 ${info.color} flex items-center gap-2`}>
            {info.icon} {info.title}
          </h3>
          <div className="space-y-2">
            {tasks.filter(t => t.q === id).map(t => (
              <div key={t.id} className="bg-white/5 p-2 rounded border border-white/10 text-xs text-white/80 cursor-pointer hover:bg-white/20 transition">
                {t.title}
              </div>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default EisenhowerMatrix;