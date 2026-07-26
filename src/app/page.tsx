"use client";

import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";

export default function Home() {
  const testOtp = async () => {
    const res = await authApi.requestOtp("7827095778");
    console.log(res.data);
  };

  return (
    <div className="p-10">
      <Button onClick={testOtp}>Test OTP Request</Button>
    </div>
  );
}
