import { UseFormReturn } from "react-hook-form";
import { Input } from "@fondingo/ui/input";
import { cn } from "@fondingo/ui/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";

interface IProps {
  label: string;
  fieldName: "phone" | "firstName" | "lastName" | "displayName" | "email";
  value?: string;
  disabled?: boolean;
  showError?: boolean;
  isOptional?: boolean;
  placeholder?: string;
  description?: string;
  form: UseFormReturn<
    {
      displayName: string;
      email: string;
      firstName?: string | undefined;
      lastName?: string | undefined;
      phone?: string | undefined;
    },
    any,
    undefined
  >;
}

export function FormInput({
  form,
  label,
  value,
  fieldName,
  description,
  placeholder,
  disabled = false,
  showError = false,
  isOptional = false,
}: IProps) {
  return (
    <FormField
      control={form.control}
      name={fieldName}
      // @ts-ignore
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel
            className={cn("flex items-center", !!value && "text-neutral-400")}
          >
            <span>{label}</span>
            {isOptional && (
              <span className="ml-2 text-xs italic text-neutral-400">
                (optional)
              </span>
            )}
          </FormLabel>
          <FormControl>
            {!value ? (
              <Input
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                className="form-input text-base placeholder:text-base placeholder:font-normal placeholder:text-neutral-300"
              />
            ) : (
              <Input
                value={value}
                disabled
                className="form-input text-base placeholder:text-neutral-300"
              />
            )}
          </FormControl>
          <FormDescription className="text-neutral-400">
            {description}
          </FormDescription>
          {showError && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
