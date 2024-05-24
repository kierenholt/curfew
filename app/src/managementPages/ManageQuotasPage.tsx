import { useEffect, useState } from "react";
import { GroupSelect } from "../GroupSelect";
import { QuotaList } from "../QuotaList";
import { Helpers } from "../helpers";
import { IQuota } from "../types";

export interface ManageQuotasProps {
    params: any //groupId
}

export function ManageQuotasPage(props: ManageQuotasProps) {
    const [groupId, setGroupId] = useState<number>(props.params ? props.params.groupId : 0);

    let [quotas, setQuotas] = useState<IQuota[]>([]);

    useEffect(() => {
        if (groupId > 0) {
            Helpers.get<IQuota[]>(`/api/quotas/${groupId}`)
                .then((quotas: IQuota[]) => {
                    setQuotas(quotas)
                })
        }
    }, [groupId]);
    
    return (
        <>
            <p>
                quotas for group: 
                <GroupSelect setSelectedGroupId={setGroupId} selectedGroupId={groupId} />
            </p>
            { groupId === 0 ? 
                <p>please select a group first</p>
            :
                <QuotaList quotas={quotas} />
            }
        </>
    )
}