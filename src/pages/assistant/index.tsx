import { AssistantList,EditAssistant,Assistant } from "../types";
import * as assistantStore from "@/pages/utils/assistantStore"; 
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { NextPage } from "next";
import React,{useState} from 'react';

const showNotification = (message:string)=>{
    notifications.show({
        id:"Success",
        title:"Success",
        message,
        color:"green",
        autoClose:3000,
    });
}
const Assistant:NextPage = () =>{
    const [assistantList,setAssistantList] = React.useState<AssistantList>([]);
    const [opened,drawerhandler] = useDisclosure(false);
    const [editAssistant,setEditAssistant] = useState<EditAssistant>();

    const saveAssistant = (data:EditAssistant)=>{
        if(data.id){
            let newAssistantlist = assistantStore.updateAssistant(data.id,data);
            setAssistantList(newAssistantlist);
        }else{
            const newAssistant = {
                ...data,
                id:Date.now().toString(),
            }
            let newAssistantList = assistantStore.addAssistant(newAssistant);
            setAssistantList(newAssistantList);
        }
        showNotification("Save Successfully");
        drawerhandler.close();
    }

    const removeAssistant = (id:string)=>{
        let newAssistantList = assistantStore.removeAssistant(id);
        setAssistantList(newAssistantList);
        showNotification("remove successfully");
        drawerhandler.close();

    }

    return (
        <div>index</div>
    )
}