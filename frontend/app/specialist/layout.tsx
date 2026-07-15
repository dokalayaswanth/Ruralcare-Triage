import { RequireAuth } from "@/components/shared/RequiredAuth";

export default function SpecialistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}