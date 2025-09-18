export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-center sm:text-[5rem]">
          Welcome to your <span className="text-primary">New</span> App
        </h1>
        <p className="text-lg text-muted-foreground text-center">
          The project has been reset to a stable starting point.
          <br />
          What would you like to build next?
        </p>
      </div>
    </main>
  );
}