import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// GitHub API - fetch raw markdown file
async function fetchFromGitHub(owner: string, repo: string, path: string): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  
  return response.text();
}

// Parse finance data
function parseFinance(content: string) {
  const balanceMatch = content.match(/ยอดคงเหลือ.*?฿([\d,.]+)/);
  const expensesMatch = content.match(/รวมรายจ่าย.*?฿([\d,.]+)/);
  
  return {
    balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
    expenses: expensesMatch ? parseFloat(expensesMatch[1].replace(/,/g, '')) : 0,
  };
}

// Parse transactions from markdown
function parseTransactions(content: string) {
  const lines = content.split('\n');
  const transactions = [];
  
  for (const line of lines) {
    if (line.includes('|') && !line.includes('---') && line.includes('฿')) {
      const cells = line.split('|').filter(c => c.trim());
      if (cells.length >= 4 && !cells[0].includes('วันที่')) {
        const date = cells[1]?.trim();
        const category = cells[2]?.trim();
        const item = cells[3]?.trim();
        const amount = cells[4]?.trim();
        
        if (date && amount && !date.includes('วันที่')) {
          transactions.push({ date, category, item, amount });
        }
      }
    }
  }
  
  return transactions.slice(0, 5); // Latest 5
}

type Tab = 'finance' | 'fuel' | 'workout';
type Person = 'all' | 'im' | 'pim';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('finance');
  const [person, setPerson] = useState<Person>('all');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const owner = 'iimmyyy';
        const repo = 'claw_dashboard';
        
        const [financeImContent, financePimContent] = await Promise.all([
          fetchFromGitHub(owner, repo, 'finance-im.md').catch(() => ''),
          fetchFromGitHub(owner, repo, 'finance-pim.md').catch(() => ''),
        ]);
        
        const imData = parseFinance(financeImContent);
        const pimData = parseFinance(financePimContent);
        const imTransactions = parseTransactions(financeImContent);
        const pimTransactions = parseTransactions(financePimContent);
        
        setData({
          finance: {
            im: { ...imData, transactions: imTransactions },
            pim: { ...pimData, transactions: pimTransactions },
          },
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const displayData = person === 'all' 
    ? { 
        balance: (data?.finance.im.balance || 0) + (data?.finance.pim.balance || 0),
        expenses: (data?.finance.im.expenses || 0) + (data?.finance.pim.expenses || 0),
        transactions: [...(data?.finance.im.transactions || []), ...(data?.finance.pim.transactions || [])].slice(0, 5)
      }
    : data?.finance[person] || { balance: 0, expenses: 0, transactions: [] };

  const getPersonName = (p: Person) => {
    if (p === 'im') return 'อิม';
    if (p === 'pim') return 'พิม';
    return 'ทั้งหมด';
  };

  const getPersonColor = (p: Person) => {
    if (p === 'im') return '#10b981';
    if (p === 'pim') return '#f59e0b';
    return '#6366f1';
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      {/* Header */}
      <header className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            🦐 Claw Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            Your personal tracker
          </motion.p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="flex gap-2">
          {(['finance', 'fuel', 'workout'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab 
                  ? 'text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={{ 
                background: activeTab === tab ? getPersonColor(person) : 'rgba(255,255,255,0.1)',
              }}
            >
              {tab === 'finance' && '💰 Finance'}
              {tab === 'fuel' && '⛽ Fuel'}
              {tab === 'workout' && '🏃 Workout'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {activeTab === 'finance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Person Selector */}
            <div className="flex gap-3 mb-6">
              {(['all', 'im', 'pim'] as Person[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPerson(p)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    person === p ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  style={{ 
                    background: person === p ? getPersonColor(p) : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {getPersonName(p)}
                </button>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">คงเหลือ</p>
                <p className="text-3xl font-bold" style={{ color: getPersonColor(person) }}>
                  ฿{displayData.balance.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">รายจ่าย</p>
                <p className="text-3xl font-bold text-red-400">
                  ฿{displayData.expenses.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">📝 Recent Activity</h3>
              <div className="space-y-3">
                {displayData.transactions.length > 0 ? (
                  displayData.transactions.map((t: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                      <div>
                        <p className="text-white font-medium">{t.item}</p>
                        <p className="text-gray-400 text-sm">{t.date}</p>
                      </div>
                      <span className="text-red-400 font-medium">-฿{parseFloat(t.amount.replace(/,/g, '')).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">ยังไม่มีรายการ</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fuel' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur rounded-2xl p-12 text-center"
          >
            <div className="text-6xl mb-4">⛽</div>
            <h3 className="text-white text-xl font-semibold mb-2">Fuel Tracker</h3>
            <p className="text-gray-400">ยังไม่มีข้อมูล บันทึกผ่าน Telegram ได้เลย!</p>
          </motion.div>
        )}

        {activeTab === 'workout' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur rounded-2xl p-12 text-center"
          >
            <div className="text-6xl mb-4">🏃</div>
            <h3 className="text-white text-xl font-semibold mb-2">Workout Tracker</h3>
            <p className="text-gray-400">ยังไม่มีข้อมูล บันทึกผ่าน Telegram ได้เลย!</p>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        Powered by 🦐 Kung | Data synced from GitHub
      </footer>
    </div>
  );
}

export default App;
