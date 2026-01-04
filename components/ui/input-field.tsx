import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";
import {
  FieldError,
  FieldPath,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

interface Props<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  disabled?: boolean;
  register: UseFormRegister<T>;
  validation?: RegisterOptions<T, FieldPath<T>>;
  error?: FieldError;
}

function InputField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  disabled,
  value,
  register,
  validation,
  error,
}: Props<T>) {
  return (
    <div className="space-y-2 ">
      <Label htmlFor={name}>{label}</Label>
      <Input
        type={type}
        id={name}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        className={cn("form-input", {
          "opacity-50 cursor-not-allowed": disabled,
        })}
        {...register(name, validation)}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}

export default InputField;
