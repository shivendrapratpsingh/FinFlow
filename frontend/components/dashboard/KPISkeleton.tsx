import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}
