import { useState } from 'react';
import { TopNav } from '../components/TopNav.jsx';
import { TablesTab } from './manager/TablesTab.jsx';
import { MenuTab } from './manager/MenuTab.jsx';
import { StaffTab } from './manager/StaffTab.jsx';

const TABS = [
  { id: 'tables', label: 'Tables', component: TablesTab },
  { id: 'menu', label: 'Menu', component: MenuTab },
  { id: 'staff', label: 'Staff', component: StaffTab },
];

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('tables');
  const Active = TABS.find((t) => t.id === activeTab).component;

  return (
    <div className="page manager-dashboard">
      <TopNav />
      <h1>Manager Dashboard</h1>
      <div className="manager-tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'selected' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  );
}
