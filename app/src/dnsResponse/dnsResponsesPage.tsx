import { useContext, useEffect, useState } from "react";
import { Helpers } from "../helpers";
import { List, Stack } from "@mui/material";
import { DnsResponseListItem } from "./dnsResponseListItem";
import { IDnsResponseGrouping } from "./IDnsResponseGrouping";
import { DnsResponse, DnsResponseWithFlag } from "./dnsTypes";

export function DnsResponsesPage() {
    let [flaggedResponseGroups, setFlaggedResponseGroups] = useState<IDnsResponseGrouping[]>([]);
    let [responseGroups, setResponseGroups] = useState<IDnsResponseGrouping[]>([]);
    let [hiddenResponseGroups, setHiddenResponseGroups] = useState<IDnsResponseGrouping[]>([]);
    let [newTick, setNewTick] = useState<boolean>(false);

    const addResponseToGroup = (response: DnsResponseWithFlag, _responseGroups: IDnsResponseGrouping[]) => {
        let foundGroups = _responseGroups.filter(g => g.domainName == response.domain);
        if (foundGroups.length == 0) {
            _responseGroups.push({
                domainName: response.domain,
                ips: [response.ip],
                createdOns: [response.createdOn],
                flagged: response.flagged,
                hidden: response.hidden,
            })
        }
        else {
            let group = foundGroups[0];
            Helpers.pushIfNotExists(response.requesterIp, group.ips);
            group.createdOns.push(response.createdOn);
            group.flagged = response.flagged;
            group.hidden = response.hidden;
        }
    }

    const addResponsesToGroups = (responses: DnsResponseWithFlag[]) => {
        let _flaggedResponseGroups: IDnsResponseGrouping[] = [];
        let _responseGroups: IDnsResponseGrouping[] = [];
        let _hiddenResponseGroups: IDnsResponseGrouping[] = [];
        for (let response of responses) {
            if (response.flagged) {
                addResponseToGroup(response, _flaggedResponseGroups);
            }
            else if(response.hidden) {
                addResponseToGroup(response, _hiddenResponseGroups);
            }
            else {
                addResponseToGroup(response, _responseGroups);
            }
        }
        setFlaggedResponseGroups(_flaggedResponseGroups);
        setResponseGroups(_responseGroups);
        setHiddenResponseGroups(_hiddenResponseGroups);
    }

    useEffect(() => {
        Helpers.get<DnsResponseWithFlag[]>(`/api/dns-response/all`)
            .then((responses: DnsResponseWithFlag[]) => {
                if (responses) addResponsesToGroups(responses);
                setTimeout(() => { setNewTick(!newTick); }, 900);
            });
    }, [newTick]);

    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <h2>Recent activity</h2>
            </Stack>
            <h3>Flagged</h3>
            <List>
                {flaggedResponseGroups.map((r: IDnsResponseGrouping) =>
                    <DnsResponseListItem key={r.domainName} responseGroup={r} />
                )}
            </List>
            <h3>Unflagged</h3>
            <List>
                {responseGroups.map((r: IDnsResponseGrouping) =>
                    <DnsResponseListItem key={r.domainName} responseGroup={r} />
                )}
            </List>
            <h3>Hidden</h3>
            <List>
                {hiddenResponseGroups.map((r: IDnsResponseGrouping) =>
                    <DnsResponseListItem key={r.domainName} responseGroup={r} />
                )}
            </List>
        </>
    )
}