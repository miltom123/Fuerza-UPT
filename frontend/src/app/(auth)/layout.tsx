export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#eef4ff] px-4 py-10 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(18,91,219,0.18),transparent_30%),radial-gradient(circle_at_85%_78%,rgba(0,179,190,0.14),transparent_28%),linear-gradient(145deg,#f8fbff_0%,#edf4ff_48%,#e7effb_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(11,38,87,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(11,38,87,0.06)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}
