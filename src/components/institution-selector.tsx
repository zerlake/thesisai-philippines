"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface InstitutionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

type Institution = {
  id: string;
  name: string;
};

export function InstitutionSelector({ value, onValueChange }: InstitutionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstitutions() {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching institutions:", error);
      } else {
        setInstitutions(data);
      }
      setLoading(false);
    }

    fetchInstitutions();
  }, []);

  const allOptions = [
    { id: "not-in-list", name: "NOT ON THE LIST" },
    ...institutions,
  ];

  const selectedInstitutionName = allOptions.find(
    (inst) => inst.id === value
  )?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && value !== 'not-in-list'
            ? selectedInstitutionName
            : loading
            ? "Loading institutions..."
            : "Select your institution"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search institution..." />
          <CommandList>
            <CommandEmpty>No institution found.</CommandEmpty>
            <CommandGroup>
              {allOptions.map((institution) => (
                <CommandItem
                  key={institution.id}
                  value={institution.name}
                  onSelect={(currentValue: string) => {
                    const selectedId = allOptions.find(
                      (inst) => inst.name.toLowerCase() === currentValue.toLowerCase()
                    )?.id;
                    onValueChange(selectedId === value ? "" : selectedId || "");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === institution.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {institution.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}