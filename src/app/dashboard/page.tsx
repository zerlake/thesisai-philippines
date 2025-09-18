import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            You have no manuscripts
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            You can start reviewing as soon as you add a manuscript.
          </p>
          <Button>Add Manuscript</Button>
        </div>
      </div>
    </>
  );
}