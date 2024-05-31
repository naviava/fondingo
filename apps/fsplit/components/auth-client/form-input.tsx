import { Dispatch, SetStateAction } from "react";

import { Eye, EyeOff } from "@fondingo/ui/lucide";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";

import { Button } from "@fondingo/ui/button";
import { Input } from "@fondingo/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@fondingo/ui/form";

interface IProps {
  form: UseFormReturn<
    {
      displayName: string;
      email: string;
      password: string;
      confirmPassword: string;
      firstName?: string | undefined;
      lastName?: string | undefined;
      phone?: string | undefined;
    },
    any,
    undefined
  >;
  fieldName:
    | "displayName"
    | "email"
    | "password"
    | "confirmPassword"
    | "firstName"
    | "lastName"
    | "phone";
  type?: string;
  label?: string;
  disabled?: boolean;
  isOptional?: boolean;
  placeholder?: string;
  description?: string;
  hideErrors?: boolean;
  forceFullWidth?: boolean;
  isPasswordShown?: boolean;
  setIsPasswordShown?: Dispatch<SetStateAction<boolean>>;
}

export function AuthFormInput({
  form,
  label,
  disabled,
  fieldName,
  isOptional,
  hideErrors,
  placeholder,
  description,
  type = "text",
  forceFullWidth,
  isPasswordShown,
  setIsPasswordShown,
}: IProps) {
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
                {isOptional && (
                  <span className="ml-1 text-[11px] font-normal italic md:text-xs">
                    (optional)
                  </span>
                )}
              </FormLabel>
            </div>
            {!hideErrors && (
              <FormMessage className="text-xs italic md:text-sm" />
            )}
          </div>
          <FormControl>
            <div className="relative">
              <Input
                type={
                  !setIsPasswordShown
                    ? type
                    : isPasswordShown
                      ? "text"
                      : "password"
                }
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                className="auth-form-input placeholder:text-neutral-400"
              />
              {!!setIsPasswordShown && (
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
          {!!description && (
            <FormDescription className="text-xs italic text-neutral-500/90 md:text-sm">
              {description}
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}
