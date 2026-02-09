import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="p-8 text-center space-y-4">
        <div className="text-4xl">&#x274C;</div>
        <h1 className="text-xl font-bold text-content">Payment Cancelled</h1>
        <p className="text-sm text-content-muted">
          Your search index was not activated. You can try again from your developer profile.
        </p>
        <Link href="/profile/developer">
          <Button variant="secondary">Back to Developer Profile</Button>
        </Link>
      </Card>
    </div>
  );
}
