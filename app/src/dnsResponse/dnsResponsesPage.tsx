import { useContext, useEffect, useState } from "react";
import { IDnsResponse } from "./IDnsResponse";
import { Helpers } from "../helpers";
import { List, Stack } from "@mui/material";
import { DnsResponseListItem } from "./dnsResponseListItem";
import { IDnsResponseGrouping } from "./IDnsResponseGrouping";

export function DnsResponsesPage() {
    let [responseGroups, setResponseGroups] = useState<IDnsResponseGrouping[]>([]);
    let [newTick, setNewTick] = useState<boolean>(false);

    const addResponsesToGroups = (responses: IDnsResponse[]) => {
        let _responseGroups: IDnsResponseGrouping[] = [...responseGroups];
        for (let response of responses) {
            let foundGroups = _responseGroups.filter(g => g.domainName == response.domain);
            if (foundGroups.length == 0) {
                _responseGroups.push({
                    domainName: response.domain,
                    ips: [response.ip],
                    createdOns: [response.createdOn]
                })
            }
            else {
                let group = foundGroups[0];
                Helpers.pushIfNotExists(response.requesterIp, group.ips);
                group.createdOns.push(response.createdOn);
            }
        }
        setResponseGroups(_responseGroups);
    }

    useEffect(() => {
        Helpers.get<IDnsResponse[]>(`/api/dns-response/all`)
            .then((responses: IDnsResponse[]) => {
                if (responses) addResponsesToGroups(responses);
                setTimeout(() => { setNewTick(!newTick); }, 900);
            });
    }, [newTick]);

    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <h2>Recent activity</h2>
            </Stack>
            <List>
                {responseGroups.map((r: IDnsResponseGrouping) =>
                    <DnsResponseListItem key={r.domainName} responseGroup={r} />
                )}
            </List>
        </>
    )
}