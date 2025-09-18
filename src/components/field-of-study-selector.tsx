"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fieldsOfStudy } from "@/lib/fields-of-study";

interface FieldOfStudySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function FieldOfStudySelector({ value, onValueChange, disabled }: FieldOfStudySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a field of study" />
      </SelectTrigger>
      <SelectContent>
        {fieldsOfStudy.map((category) => (
          <SelectGroup key={category.category}>
            <SelectLabel>{category.category}</SelectLabel>
            {category.fields.map((field) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}