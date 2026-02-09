import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="p-8 text-center space-y-4">
        <div className="text-4xl">&#x2705;</div>
        <h1 className="text-xl font-bold text-content">Payment Successful!</h1>
        <p className="text-sm text-content-muted">
          Your search index is now active. You&apos;ll start receiving notifications for matching posts.
        </p>
        <Link href="/profile/developer">
          <Button>Back to Developer Profile</Button>
        </Link>
      </Card>
    </div>
  );
}
