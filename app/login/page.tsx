"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AI_NAME } from "@/config";
import { hasSupabaseConfig } from "@/lib/supabase/config";

const authSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type AuthValues = z.infer<typeof authSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const onSubmit = async (values: AuthValues) => {
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(values.email, values.password);
        toast.success("Signed in.");
      } else {
        await signUp(values.email, values.password);
        toast.success("Account created.");
      }
      router.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/35">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasSupabaseConfig()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/35 px-5">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Setup required
            </div>
            <CardTitle className="text-2xl">Supabase is not configured</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
            to your environment before using account login and persistent renter
            workflows.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/35 px-5 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-border/70 bg-background px-8 py-10 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.18)]">
          <div className="max-w-xl space-y-6">
            <div className="space-y-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Professional renter workflow
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {AI_NAME}
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                A renter-focused assistant for comparing apartments, tracking tours,
                reviewing leases, and managing applications in one place.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="gap-3">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm">Persistent chat history</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  Keep past searches, apartment comparisons, and advice tied to your account.
                </CardContent>
              </Card>
              <Card className="gap-3">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm">Saved apartment workflow</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  Track your shortlist, tours, notes, applications, and decisions across sessions.
                </CardContent>
              </Card>
              <Card className="gap-3">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm">Financial clarity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  See affordability, upfront costs, and listing risk before you commit time or money.
                </CardContent>
              </Card>
              <Card className="gap-3">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm">Lease and outreach support</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  Review lease language, prepare tour questions, and draft messages professionally.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Card className="gap-4">
          <CardHeader className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Account
            </div>
            <CardTitle className="text-2xl">Sign in to continue</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as "signin" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-xl border border-border/70 bg-muted/50 p-1">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input {...form.register("email")} type="email" />
                    </Field>
                    <Field>
                      <FieldLabel>Password</FieldLabel>
                      <Input {...form.register("password")} type="password" />
                    </Field>
                  </FieldGroup>
                  <div className="space-y-2 text-sm text-destructive">
                    {form.formState.errors.email?.message}
                    {form.formState.errors.password?.message}
                  </div>
                  <Button className="w-full" disabled={submitting} type="submit">
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input {...form.register("email")} type="email" />
                    </Field>
                    <Field>
                      <FieldLabel>Password</FieldLabel>
                      <Input {...form.register("password")} type="password" />
                    </Field>
                  </FieldGroup>
                  <div className="space-y-2 text-sm text-destructive">
                    {form.formState.errors.email?.message}
                    {form.formState.errors.password?.message}
                  </div>
                  <Button className="w-full" disabled={submitting} type="submit">
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : "Create account"}
                  </Button>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Use a real email and a password with at least 8 characters.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
