"use client";

import {
  deleteProjectAction,
  editProjectAction,
} from "@/actions/projectActions";
import { ProjectWithPlanned } from "@/app/[locale]/types/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubdomain } from "@/context/SubdomainContext";
import { ActionResult, initialState } from "@/util/initial-action-return";
import { Settings } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function ProjectEditDialog({
  project,
}: {
  project: ProjectWithPlanned;
}) {
  const { subdomain } = useSubdomain();
  const { id, name, description } = project;
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState<ActionResult, FormData>(
    editProjectAction,
    initialState
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success("Project updated.");
      setOpen(false);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);
  const form = useForm({
    defaultValues: {
      id,
      name,
      description: description || "",
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <DialogTrigger asChild>
          <Button variant={"secondary"} size="sm">
            <Settings />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form action={action}>
            <DialogHeader>
              <DialogTitle>Edit prject: {project.name}</DialogTitle>
              <DialogDescription>
                Edit the selected project details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input type="hidden" defaultValue={id} name="id" />
              <Input type="hidden" defaultValue={subdomain} name="subdomain" />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel></FormLabel>
                    <FormControl>
                      <Input placeholder="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel></FormLabel>
                    <FormControl>
                      <Textarea {...field}></Textarea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                variant={"destructive"}
                className="mr-auto"
                type="submit"
                formAction={async () => {
                  await deleteProjectAction(subdomain, id);
                }}
              >
                Delete project
              </Button>
              <Button type="submit" disabled={isPending}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
