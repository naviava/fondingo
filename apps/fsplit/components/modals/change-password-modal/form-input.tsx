import { useState } from "react";

import { Eye, EyeOff } from "@fondingo/ui/lucide";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";

interface IProps {
  form: UseFormReturn<
    {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
    any,
    undefined
  >;
  fieldName: "currentPassword" | "newPassword" | "confirmPassword";
  label: string;
  disabled?: boolean;
  canReveal?: boolean;
  forceFullWidth?: boolean;
}

export function FormInput({
  form,
  label,
  disabled,
  fieldName,
  forceFullWidth,
  canReveal = false,
}: IProps) {
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className={cn(forceFullWidth && "w-full")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FormLabel
                className={cn(
                  "text-xs font-semibold md:text-sm",
                  hfont.className,
                )}
              >
                {label}
              </FormLabel>
            </div>
          </div>
          <FormControl>
            <div className="relative">
              <Input
                type={isPasswordShown ? "text" : "password"}
                disabled={disabled}
                {...field}
                className="form-input placeholder:text-neutral-400"
              />
              {canReveal && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPasswordShown((prev) => !prev)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:bg-transparent hover:text-neutral-500"
                >
                  {isPasswordShown ? <EyeOff /> : <Eye />}
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
