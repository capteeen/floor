import { Button } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="ff-card mx-auto max-w-md px-6 py-16 text-center">
      <p className="font-display text-2xl font-bold">Nothing on the floor yet.</p>
      <p className="mt-2 text-fog">That route is empty. Try home, launch, or sweeps.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button href="/">Home</Button>
        <Button href="/sweeps" variant="secondary">
          See sweeps
        </Button>
      </div>
    </div>
  );
}
