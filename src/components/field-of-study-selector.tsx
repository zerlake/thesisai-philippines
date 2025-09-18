"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { fieldsOfStudy } from "../lib/fields-of-study";

interface FieldOfStudySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function FieldOfStudySelector({
  value,
  onValueChange,
  disabled,
}: FieldOfStudySelectorProps) {
  return (
    <Select onValueChange={onValueChange} value={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select your field of study" />
      </SelectTrigger>
      <SelectContent>
        {fieldsOfStudy.map((group) => (
          <SelectGroup key={group.category}>
            <SelectLabel>{group.category}</SelectLabel>
            {group.fields.map((field) => (
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