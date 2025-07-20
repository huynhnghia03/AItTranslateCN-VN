"use client";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  menuItems,
  activeSection,
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed top-16 inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-50/95 to-purple-50/95 backdrop-blur-md shadow-xl p-6 flex flex-col gap-4 z-20 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h1 className="text-xl font-bold text-indigo-700 mb-6 md:hidden">AI Dịch Trung - Việt</h1>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 ${
              activeSection === item.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-indigo-100/50 hover:text-indigo-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-10 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}