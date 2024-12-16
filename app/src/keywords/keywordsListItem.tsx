


import { Accordion, Box, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import { ReactNode, useContext, useEffect, useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Stack, Switch } from "@mui/joy";
import { IKeyword } from "../types";
import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import { Helpers } from "../helpers";
import { CurrentPage, PageContext } from "../pageSelector/pageSelector";

export interface KeywordListItemProps {
    id: number;
}

export const KeywordListItem = (props: KeywordListItemProps) => {
    const pageContext = useContext(PageContext);

    let [isActive, setIsActive] = useState<boolean>(false);
    let [expanded, setExpanded] = useState<boolean>(false);
    let [name, setName] = useState<string>("");
    let [expression, setExpression] = useState<string>("");

    useEffect(() => {
        Helpers.get<IKeyword>(`/api/keyword/${props.id}`)
            .then((keyword: IKeyword) => {
                setName(keyword.name);
                setExpression(keyword.expression);
                setIsActive(keyword.isActive == 1);
            })
    }, [props.id])

    const isActiveClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        setExpanded(expanded);
        let value = e.target.checked;
        Helpers.put<number>(`/api/keyword/${props.id}/isActive=${value ? 1 : 0}`, {})
            .then((updated: number) => {
                if (updated > 0) {
                    setIsActive(value);
                }
            })
    }

    return (
        <Accordion color="neutral" expanded={expanded}>

            <Box sx={{ display: "flex" }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel2a-header"
                    sx={{ flexGrow: 1 }}
                    onClick={() => setExpanded(!expanded)}
                >
                    <LocationSearchingIcon />
                    <Typography sx={{ verticalAlign: "center", marginLeft: "1rem" }}>
                        {name}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}></Box>
                    <Switch
                        checked={isActive}
                        onChange={isActiveClick}
                    />
                </AccordionSummary>
            </Box>
            <AccordionDetails>
                <Stack>
                    Keywords: {expression}
                    <Button onClick={() => {
                        pageContext.setParams({
                            keyword: {
                                id: props.id,
                                name: name,
                                expression: expression
                            },
                            updateKeyword: (name: string, expression: string) => {
                                setName(name);
                                setExpression(expression);
                            }
                        });
                        pageContext.goTo(CurrentPage.editKeyword);
                    }}>
                        Edit
                    </Button>
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}