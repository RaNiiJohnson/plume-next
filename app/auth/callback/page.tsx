"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createDefaultOrg } from "../auth.action";

export default function AuthCallback() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const finalizeSignup = async () => {
      if (!session?.user || isProcessing) return;

      setIsProcessing(true);

      try {
        await createDefaultOrg();
      } catch (error) {
        console.error("Erreur lors de la création de l'organisation:", error);
        toast.error("Compte créé, mais erreur lors de la configuration");
      } finally {
        router.push("/");
      }
    };

    finalizeSignup();
  }, [session, isProcessing, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">
          Finalizing your account...
        </p>
      </div>
    </div>
  );
}
