import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wifi, Key, Info, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HouseInfo() {
  const [infoItems, setInfoItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('house_info')
        .select('*')
        .order('category', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;
      setInfoItems(data || []);
    } catch (err) {
      console.error('Error fetching house info:', err);
      setError('Kunne ikke hente informationer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Wifi': return <Wifi className="h-5 w-5" />;
      case 'Key': return <Key className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  // Group items by category
  const groupedItems = infoItems.reduce((acc, item) => {
    const category = item.category || 'Generelt';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-fg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-fg-default">Info om huset</h2>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-fg-muted hover:text-fg-default"
        >
          Tilbage til oversigt
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="bg-canvas-default border border-border-default rounded-lg overflow-hidden shadow-sm">
            <div className="bg-canvas-subtle px-4 py-3 border-b border-border-muted">
              <h3 className="font-semibold text-fg-default">{category}</h3>
            </div>
            <div className="divide-y divide-border-muted">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-canvas-subtle transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-fg-muted bg-canvas-subtle p-2 rounded-full">
                      {getIcon(item.icon)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-fg-muted">{item.title}</p>
                      <SecretValue value={item.value} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(item.value, item.id)}
                    className="p-2 text-fg-muted hover:text-accent-fg transition-colors rounded-full hover:bg-canvas-subtle"
                    title="Kopier"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {infoItems.length === 0 && !error && (
          <div className="text-center py-12 text-fg-muted bg-canvas-default border border-border-default rounded-lg">
            <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Der er ingen informationer tilgængelige endnu.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SecretValue({ value }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div 
      onClick={() => setRevealed(!revealed)}
      className="mt-0.5 cursor-pointer select-none group flex items-center"
      title={revealed ? "Klik for at skjule" : "Klik for at vise"}
    >
      <p className={`text-base font-semibold transition-all duration-200 ${revealed ? 'text-fg-default' : 'text-fg-muted tracking-widest blur-[2px] group-hover:blur-[1px]'}`}>
        {revealed ? value : '••••••••'}
      </p>
      {!revealed && (
        <span className="ml-2 text-xs text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity">
          Klik for at vise
        </span>
      )}
    </div>
  );
}
