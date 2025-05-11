import { MainLayout } from "@/components/main-layout";
import { protectRoute } from "@/utils/auth/protected-route";
import { GoalsContent } from "./goals-content";

export default async function GoalsPage() {
  // Protect this route - redirects to /auth if not authenticated
  await protectRoute();

  return (
    <MainLayout>
      <GoalsContent />
    </MainLayout>
  );
}
