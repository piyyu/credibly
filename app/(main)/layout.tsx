import Sidebar from "@/components/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#f6f9fc] overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative z-10 custom-scrollbar p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
