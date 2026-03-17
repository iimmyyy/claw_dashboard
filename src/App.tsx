import { useState, useEffect } from 'react';

interface FinanceData {
  balance: number;
  expenses: number;
  income: number;
}

interface FuelEntry {
  date: string;
  mileage: number;
  liters: number;
  pricePerLiter: number;
  total: number;
}

interface WorkoutEntry {
  date: string;
  strain: number;
  recovery: number;
  activity: string;
}

interface DashboardData {
  finance: {
    im: FinanceData;
    pim: FinanceData;
  };
  fuel: {
    entries: FuelEntry[];
  };
  workout: {
    entries: WorkoutEntry[];
  };
}

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

// Parse markdown table to JSON (for future use)
function parseMarkdownTable(markdown: string): any[] {
  const lines = markdown.trim().split('\n');
  const result: any[] = [];
  
  // Find table start and end
  let inTable = false;
  let headers: string[] = [];
  
  for (const line of lines) {
    if (line.includes('|') && line.includes('---')) {
      if (!inTable) {
        inTable = true;
        continue;
      }
      continue;
    }
    
    if (line.includes('|')) {
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
      
      if (!inTable && cells.length > 1) {
        // First row might be headers
        headers = cells;
        inTable = true;
      } else if (inTable && cells.length > 1) {
        // Data row
        const row: any = {};
        cells.forEach((cell, index) => {
          if (headers[index]) {
            row[headers[index]] = cell;
          }
        });
        result.push(row);
      }
    }
  }
  
  return result;
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const owner = 'iimmyyy';
        const repo = 'claw_dashboard';
        
        // Fetch all data files from GitHub
        const [financeImContent, financePimContent] = await Promise.all([
          fetchFromGitHub(owner, repo, 'finance-im.md').catch(() => ''),
          fetchFromGitHub(owner, repo, 'finance-pim.md').catch(() => ''),
        ]);
        
        // Parse finance data (simple regex for now)
        const parseFinance = (content: string) => {
          const balanceMatch = content.match(/ยอดคงเหลือ.*?฿([\d,.]+)/);
          const expensesMatch = content.match(/รวมรายจ่าย.*?฿([\d,.]+)/);
          const incomeMatch = content.match(/รายรับ.*?฿([\d,.]+)/);
          
          return {
            balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0,
            expenses: expensesMatch ? parseFloat(expensesMatch[1].replace(/,/g, '')) : 0,
            income: incomeMatch ? parseFloat(incomeMatch[1].replace(/,/g, '')) : 0,
          };
        };
        
        const imData = parseFinance(financeImContent);
        const pimData = parseFinance(financePimContent);
        
        setData({
          finance: {
            im: imData,
            pim: pimData,
          },
          fuel: { entries: [] },
          workout: { entries: [] }
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const totalBalance = (data?.finance.im.balance || 0) + (data?.finance.pim.balance || 0);
  const totalExpenses = (data?.finance.im.expenses || 0) + (data?.finance.pim.expenses || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🦐 Claw Dashboard</h1>
          <p className="text-gray-500 mt-1">Your personal finance & workout tracker</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Finance Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">💰 Finance</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">อิม:</span>
                <span className="font-medium text-green-600">฿{data?.finance.im.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">พิม:</span>
                <span className="font-medium text-green-600">฿{data?.finance.pim.balance.toLocaleString()}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between">
                <span className="text-gray-600">รวม:</span>
                <span className="font-bold">฿{totalBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">รายจ่าย:</span>
                <span className="text-red-500">฿{totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Fuel Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">⛽ Fuel</h2>
            <div className="text-center text-gray-500">
              <p>ยังไม่มีข้อมูล</p>
              <p className="text-sm mt-2">บันทึกผ่าน Telegram ได้เลย!</p>
            </div>
          </div>

          {/* Workout Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">🏃 Workout</h2>
            <div className="text-center text-gray-500">
              <p>ยังไม่มีข้อมูล</p>
              <p className="text-sm mt-2">บันทึกผ่าน Telegram ได้เลย!</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">📝 Recent Activity</h2>
          <div className="text-gray-500 text-center py-8">
            <p>รอข้อมูลจาก Telegram...</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          Powered by 🦐 Kung | Data synced from GitHub
        </div>
      </footer>
    </div>
  );
}

export default App;
