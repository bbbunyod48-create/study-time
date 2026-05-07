import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';

const CircadianChart = ({ zones }) => {
  // Mock data generation based on calculated zones
  const data = [
    { time: '06:00', energy: 20 }, { time: '08:00', energy: 50 },
    { time: '10:00', energy: 95 }, { time: '12:00', energy: 90 },
    { time: '14:00', energy: 40 }, { time: '16:00', energy: 30 },
    { time: '18:00', energy: 70 }, { time: '20:00', energy: 60 },
  ];

  return (
    <GlassCard className="p-6 w-full h-64">
      <h3 className="text-white font-semibold mb-4">Cognitive Energy Forecast</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#666" fontSize={12} />
          <YAxis hide />
          <Tooltip contentStyle={{backgroundColor: '#111', border: 'none', borderRadius: '8px'}} />
          <Area type="monotone" dataKey="energy" stroke="#00f2ff" fillOpacity={1} fill="url(#colorEnergy)" />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};

export default CircadianChart;