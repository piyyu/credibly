import Header from "@/components/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-layout">
      <Header />
      <div className="dash-body">
        {children}
      </div>
    </div>
  );
}
