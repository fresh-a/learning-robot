import React, { useState, useEffect } from "react";
import { Select } from "@mantine/core";
import { AssistantList,Assistant } from "@/pages/types";
import * as assistantStore from "@/pages/utils/assistantStore";
type Props = {
  value: string;
  loading?: boolean;
  onChange: (value: Assistant) => void;
};

export const AssistantSelect = ({
  value,
  loading = false,
  onChange,
}: Props) => {
  const [list, setList] = useState<AssistantList>([]);
  useEffect(() => {
    const store = assistantStore.getList();
    setList(store);
  },[]);

  const onAssistantChange = (value:string)=>{
    const assistant = list.find((item)=>item.id ===value);
    onChange(assistant!);
  }

  return (
    <Select
      size="sm"
      onChange={onAssistantChange}
      value={value}
      className="w-32 mx-2"
      disabled={loading}
      data={list.map((item)=>({
        value:item.id,
        label:item.name,
      }))}
    >
    </Select>
  );
};
