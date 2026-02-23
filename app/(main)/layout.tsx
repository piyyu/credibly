import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#07070a] p-4 gap-4 overflow-hidden relative">
      {/* Ambient background glows for the app shell */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgba(20,241,149,0.03)] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-[250px] w-[600px] h-[600px] bg-[rgba(153,69,255,0.03)] blur-[150px] rounded-full pointer-events-none"></div>

      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto rounded-[24px] relative z-10 custom-scrollbar pr-2">
        {children}
      </main>
    </div>
  );
}
