import { Button } from "@mui/material";
import { useContext } from "react";
import { CurrentPage, PageContext } from "../App";

export interface EditOwnerProps {

}

export function EditUserPage() {
    const pageContext = useContext(PageContext);
    
    return (
        <>
            <p>
                name this device
            </p>
            <Button onClick={() => pageContext.setCurrentPage(CurrentPage.manageUsers)} >manage owners</Button>
        </>
    )
}