import { TwoFactorManagement } from "@/components/auth/two-factor-management";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const user = await requireWorkspaceRole("ADMIN");
  const twoFactor = await prisma.twoFactorSecret.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      enabledAt: true,
      user: {
        select: {
          _count: {
            select: {
              twoFactorRecoveryCodes: {
                where: {
                  usedAt: null,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!twoFactor?.enabledAt) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-teal-700">
          Настройки администратора
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Безопасность аккаунта
        </h1>
      </div>
      <TwoFactorManagement
        enabledAt={twoFactor.enabledAt.toISOString()}
        initialRemainingRecoveryCodeCount={
          twoFactor.user._count.twoFactorRecoveryCodes
        }
      />
    </div>
  );
}
