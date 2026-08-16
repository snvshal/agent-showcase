"use client"

import { AlertDialog } from "@base-ui/react/alert-dialog"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ConfirmLinkTarget {
  url: string
  title: string
  hostname: string
}

interface ConfirmLinkDialogProps {
  target: ConfirmLinkTarget | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function ConfirmLinkDialog({
  target,
  onOpenChange,
  onConfirm,
}: ConfirmLinkDialogProps) {
  return (
    <AlertDialog.Root open={target !== null} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <AlertDialog.Popup className="border-border bg-background text-foreground data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 fixed top-1/2 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-5 shadow-lg outline-none">
          <AlertDialog.Title className="text-base font-semibold tracking-tight">
            Open external link?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            <span className="text-foreground font-medium">{target?.hostname}</span> will open in a
            new tab. Make sure it looks like the source you want.
          </AlertDialog.Description>
          <p className="text-muted-foreground bg-muted/50 mt-3 rounded-lg px-3 py-2 text-xs break-all">
            {target?.url}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Close
              render={
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              }
            />
            <Button type="button" size="sm" onClick={onConfirm}>
              <ExternalLink className="size-3.5" />
              Open
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
