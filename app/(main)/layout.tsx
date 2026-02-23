import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative z-10 custom-scrollbar p-6 lg:p-10 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]">
        {children}
      </main>
    </div>
  );
}
