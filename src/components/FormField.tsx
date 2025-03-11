
import React from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  type?: "number" | "text" | "percentage" | "currency";
  placeholder?: string;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  tooltip,
  prefix,
  suffix,
  min = 0, // Default to 0 to prevent negative values
  max,
  step = 1,
  className,
  type = "number",
  placeholder,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "text") {
      onChange(e.target.value);
      return;
    }
    
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      // Enforce percentage range if type is percentage
      if (type === "percentage" && (newValue < 0 || newValue > 100)) {
        return;
      }
      onChange(newValue);
    } else if (e.target.value === "") {
      onChange(type === "text" ? "" : 0);
    }
  };

  const displayValue = value !== undefined ? value : "";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-input">
        {prefix && (
          <span className="flex items-center justify-center px-3 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type={type === "text" ? "text" : "number"}
          value={displayValue}
          onChange={handleChange}
          min={type !== "text" ? min : undefined}
          max={type === "percentage" ? 100 : (type !== "text" ? max : undefined)}
          step={type === "percentage" ? 0.1 : (type !== "text" ? step : undefined)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "border-0 shadow-none focus-visible:ring-0",
            prefix && "rounded-l-none",
            suffix && "rounded-r-none"
          )}
        />
        {suffix && (
          <span className="flex items-center justify-center px-3 text-sm text-muted-foreground bg-muted rounded-r-md">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default FormField;
