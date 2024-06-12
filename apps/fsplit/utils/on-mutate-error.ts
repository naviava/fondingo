import { toast } from "@fondingo/ui/use-toast";

export function onMutateError({ message }: { message: string }) {
  return toast({
    title: "Somethign went wrong",
    description: message,
  });
}
