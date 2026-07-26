"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BecomeDriverPrompt() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drive with RideConnect</CardTitle>
        <CardDescription>
          E-rickshaw chalate ho? Apna profile complete karke driver banein aur
          riders paayein.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => router.push("/dashboard/become-driver")}>
          Become a Driver
        </Button>
      </CardContent>
    </Card>
  );
}
