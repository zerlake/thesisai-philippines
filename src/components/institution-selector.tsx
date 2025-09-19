"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Loading institutions..." : "Select your institution"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Approved Institutions</SelectLabel>
          {!loading && institutions.map((inst) => (
            <SelectItem key={inst.id} value={inst.id}>
              {inst.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectItem value="not-in-list">My institution is not on the list</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}