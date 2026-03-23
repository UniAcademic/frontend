import React from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0F19] border border-slate-700 rounded-lg p-4 shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color || entry.payload.fill }}>
            {entry.name}: <span className="text-white font-black">{entry.value}{entry.unit || ''}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const StudentsByCoursePie = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
    </PieChart>
  </ResponsiveContainer>
);

export const TurmaOccupancyBar = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={true} vertical={false} />
      <XAxis type="number" hide />
      <YAxis 
        dataKey="name" 
        type="category" 
        tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip 
        content={<CustomTooltip />} 
        formatter={(value, name, props) => [`${value}% (${props.payload.alunos} de ${props.payload.capacidade} vagas)`, "Ocupação"]}
      />
      <Bar dataKey="ocupacao" name="Ocupação de Vagas" fill="#F59E0B" radius={[0, 4, 4, 0]} unit="%" />
    </BarChart>
  </ResponsiveContainer>
);

export const GradesByTurmaBar = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
      <XAxis 
        dataKey="name" 
        tick={{ fontSize: 9, fontWeight: 900, fill: '#94A3B8' }}
        axisLine={{ stroke: '#1E293B' }}
        tickLine={false}
      />
      <YAxis domain={[0, 10]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="media" name="Média Geral da Turma" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
    </BarChart>
  </ResponsiveContainer>
);

export const ProfessorDeptPie = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        dataKey="value"
        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
    </PieChart>
  </ResponsiveContainer>
);

export const StudentStatusPie = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={70}
        dataKey="value"
        paddingAngle={2}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
    </PieChart>
  </ResponsiveContainer>
);


