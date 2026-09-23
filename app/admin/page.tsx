import { AdminGate } from "@/components/admin/admin-gate";
import { RehearsalPlanForm } from "@/components/admin/rehearsal-plan-form";

export default function AdminPage() {
  return (
    <AdminGate>
      <RehearsalPlanForm />
    </AdminGate>
  );
}
