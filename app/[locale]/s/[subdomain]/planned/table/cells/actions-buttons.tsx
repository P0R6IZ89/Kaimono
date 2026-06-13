import { PlannedSchema } from "@/app/[locale]/types/planned";
import { Button } from "@/components/ui/button";
import { Row } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditPlannedDialog } from "../../dialogs/dialog-edit";

export default function ActionsButton({ row }: { row: Row<PlannedSchema> }) {
  const tCommon = useTranslations("Common");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={tCommon("actions.edit")}
        title={tCommon("actions.edit")}
        onClick={() => setDialogOpen(true)}
      >
        <Pencil />
      </Button>
      <EditPlannedDialog
        row={row}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
