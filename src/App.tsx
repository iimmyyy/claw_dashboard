import { useState, useEffect } from 'react';

interface DashboardData {
  finance: {
    im: any;
    pim: any;
  };
  fuel: any;
  workout: any;
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from GitHub API
    const fetchData = async () => {
      try {
        const owner = 'iimmyyy';
        const repo = 'claw_dashboard';
        
        // In real app, these would be separate files in the repo
        // For now, we'll show placeholder
        setData({
          finance: {
            im: { balance: 1573.51, expenses: 120 },
            pim: { balance: 6029, expenses: 337 }
          },
          fuel: { entries: [] },
          workout: { entries: [] }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
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
                <span className="font-bold">฿{(data?.finance.im.balance + data?.finance.pim.balance).toLocaleString()}</span>
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
