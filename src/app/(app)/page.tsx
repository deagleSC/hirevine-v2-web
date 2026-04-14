import { HirevineMark } from "@/components/brand/hirevine-mark";

export default function HomePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-4">
      <HirevineMark size={72} />
      <h1 className="text-2xl font-semibold tracking-tight">Hirevine</h1>
    </div>
  );
}
