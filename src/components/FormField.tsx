
import React from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  tooltip?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  type?: "number" | "text" | "percentage" | "currency";
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  tooltip,
  prefix,
  suffix,
  min,
  max,
  step = 1,
  className,
  type = "number",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else if (e.target.value === "") {
      onChange(0);
    }
  };

  const displayValue = typeof value === "number" ? value : "";

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
          type="number"
          value={displayValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
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
