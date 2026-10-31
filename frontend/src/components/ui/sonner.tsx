import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:pr-10",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "!flex !items-center !justify-center !size-6 !rounded-md !bg-card !border !border-border !text-foreground hover:!bg-muted hover:!text-foreground !opacity-100 !left-auto !right-2.5 !top-2.5 !translate-x-0 !translate-y-0 cursor-pointer shadow-xs transition-colors",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
