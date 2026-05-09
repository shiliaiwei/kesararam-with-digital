"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export function RBACForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    startTransition(async () => {
      // Stub action for RBAC modification
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(`Role updated! User ${email} is now a ${role}`);
    });
  }

  return (
    <Card className="@container/card mt-4 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Access Control
        </CardTitle>
        <CardDescription>
          Assign system roles to individual users by email.
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@kesararam.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="role">Assign Role</Label>
            <Select name="role" defaultValue="student">
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 pt-4">
          <Button disabled={isPending} type="submit">
            {isPending ? "Updating..." : "Update Role"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
