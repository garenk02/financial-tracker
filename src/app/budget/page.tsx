import { MainLayout } from "@/components/main-layout";
import { protectRoute } from "@/utils/auth/protected-route";
import { BudgetContent } from "./budget-content";

export default async function BudgetPage() {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();

  return (
    <MainLayout>
      <BudgetContent />
    </MainLayout>
  );
}
