import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { maskContactNumber, maskName } from "@/lib/mask";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: {
      building: true,
      ppjbs: { include: { photos: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Customer records are shown in masked form to protect privacy.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-neutral-500">No users yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold">{maskName(user.name)}</p>
                  <p className="text-sm text-neutral-500">
                    {maskContactNumber(user.contactNumber)}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    {user.building?.name ?? "Unassigned building"}
                  </p>
                  <p className="text-neutral-500">
                    Joined {formatDate(user.joinDate)}
                  </p>
                  <p className="text-neutral-500">
                    Purchased {formatDate(user.buyDate)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  PPJB Accounts
                </p>
                {user.ppjbs.length === 0 ? (
                  <p className="mt-1 text-sm text-neutral-500">
                    No PPJB on record.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-col gap-3">
                    {user.ppjbs.map((ppjb) => (
                      <div key={ppjb.id} className="flex flex-wrap items-center gap-3">
                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-sm font-mono dark:bg-neutral-900">
                          {ppjb.accountNumber}
                        </span>
                        {ppjb.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative h-14 w-14 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900"
                          >
                            <Image
                              src={photo.url}
                              alt={`PPJB ${ppjb.accountNumber}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {user.remarks && (
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Remarks
                  </p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {user.remarks}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
