import { KanbanBoard } from "@/components/kanban/kanban-board";
import { NextPracticeSection } from "@/components/home/next-practice-section";

export default function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <NextPracticeSection />
      <KanbanBoard />
    </div>
  );
}
