"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { toast } from "sonner";
import { AlertCircle, Loader2, Plus, Upload } from "lucide-react";
import { useSubdomain } from "@/context/SubdomainContext";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createPlannedAction } from "@/actions/plannedActions";

type FormValues = {
  title: string;
  price: string;
  status: string;
  priority: string;
  image: string;
  productUrl: string;
  description?: string;
  subdomain: string;
};

export function CreatePlannedDialog() {
  const { subdomain } = useSubdomain();
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      price: "",
      status: "pending",
      priority: "",
      image: "",
      productUrl: "",
      description: "",
      subdomain: subdomain,
    },
  });
  const initialState = { error: "" };

  const [uploadedInfo, setUploadedInfo] = useState<
    string | CloudinaryUploadWidgetInfo | undefined
  >(undefined);

  const [state, action, isPending] = useActionState(
    createPlannedAction,
    initialState
  );

  useEffect(() => {
    if (state.message?.isSuccess) {
      toast.success("Item criado com sucesso!");
      form.reset();
    }
  }, [state.message?.isSuccess, form]);

  return (
    <div className="space-y-8">
      <Dialog modal={false}>
        <DialogTrigger asChild>
          <Button className="h-8 px-2 lg:px-3">
            <Plus />
            <span>Adicionar</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Adicionar novo item</DialogTitle>
            <DialogDescription>
              Adicione novo item na lista de essenciais.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form action={action} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Chocolate" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 500"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Prioridade</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className="w-1/2">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="low">Baixo</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="high">Alto</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="">
                    <FormControl>
                      <CldUploadWidget
                        {...field}
                        options={{
                          sources: ["local", "url", "camera"],
                        }}
                        uploadPreset="test-preset"
                        onSuccess={(result, { widget }) => {
                          const info = result.info;
                          if (!info || typeof info === "string") {
                            widget.close();
                            return;
                          }
                          field.onChange(info.secure_url);
                          console.log(info);
                          setUploadedInfo(info);
                          widget.close();
                        }}
                      >
                        {({ open }) => {
                          return (
                            <Button
                              variant={"secondary"}
                              className="justify-between"
                              onClick={(e) => {
                                e.preventDefault();
                                open();
                              }}
                            >
                              <p>
                                {uploadedInfo &&
                                typeof uploadedInfo !== "string"
                                  ? `Selecionado: ${uploadedInfo.original_filename}.${uploadedInfo.format}`
                                  : "Upload an Image"}
                              </p>
                              <Upload />
                            </Button>
                          );
                        }}
                      </CldUploadWidget>
                    </FormControl>
                    <input
                      type="hidden"
                      name="image"
                      value={field.value ?? ""}
                    />
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link {"(opcional)"}</FormLabel>
                    <FormControl>
                      <Input className="resize-none" type="url" {...field} />
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
                    <FormLabel>Descrição {"(opcional)"}</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                {state?.error && (
                  <Alert variant={"destructive"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro:</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <input type="hidden" name="subdomain" value={subdomain} />
              <input type="hidden" name="status" value={"pending"} />
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : null}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
