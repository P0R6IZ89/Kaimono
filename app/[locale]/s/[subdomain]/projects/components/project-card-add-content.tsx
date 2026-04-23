"use client";

import {
  getDefaultValues,
  PlannedCreateForm,
  type PlannedImageSelection,
  type PlannedCreateFormValues,
} from "@/app/[locale]/s/[subdomain]/planned/dialogs/dialog-create";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AutoCreateForm } from "../../planned/dialogs/dialog-auto-create";

type Props = {
  projectId: string;
  subdomain: string;
  onCompleted: () => void;
  onUploadWidgetOpenChange: (isOpen: boolean) => void;
};

export function ProjectCardAddContent({
  projectId,
  subdomain,
  onCompleted,
  onUploadWidgetOpenChange,
}: Props) {
  const t = useTranslations("Projects");
  const [imageSelection, setImageSelection] = useState<
    PlannedImageSelection | undefined
  >(undefined);
  const plannedForm = useForm<PlannedCreateFormValues>({
    defaultValues: getDefaultValues(subdomain),
  });

  useEffect(() => {
    plannedForm.reset(getDefaultValues(subdomain));
    setImageSelection(undefined);
  }, [plannedForm, subdomain]);

  return (
    <div className="mt-4 space-y-2">
      <div className="bg-card border-s-blue-400 border-e-yellow-400 rounded-md p-2 lg:p-3 border">
        <AutoCreateForm
          onExtracted={({ url, product }) => {
            plannedForm.setValue("productUrl", url, {
              shouldDirty: true,
              shouldTouch: true,
            });

            if (product.name) {
              plannedForm.setValue("title", product.name, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }

            if (product.description) {
              plannedForm.setValue("description", product.description, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }

            if (product.price) {
              plannedForm.setValue("price", product.price, {
                shouldDirty: true,
                shouldTouch: true,
              });
            }

            if (product.image) {
              plannedForm.setValue("image", product.image, {
                shouldDirty: true,
                shouldTouch: true,
              });
              setImageSelection({
                source: "ai",
                url: product.image,
              });
            }
          }}
        />
      </div>
      <PlannedCreateForm
        form={plannedForm}
        mode="project"
        projectId={projectId}
        subdomain={subdomain}
        imageSelection={imageSelection}
        onImageSelectionChange={setImageSelection}
        onCompleted={onCompleted}
        onUploadWidgetOpenChange={onUploadWidgetOpenChange}
        submitLabel={t("add.new.submit")}
        submitButtonClassName="w-full"
      />
    </div>
  );
}
