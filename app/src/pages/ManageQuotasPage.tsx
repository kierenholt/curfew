import { useState } from "react";
import { GroupSelect } from "../GroupSelect";
import { QuotaList } from "../QuotaList";

export interface ManageQuotasProps {
    params: any //groupId
}

export function ManageQuotasPage(props: ManageQuotasProps) {
    const [groupId, setGroupId] = useState<number>(props.params ? props.params.groupId : 0);

    return (
        <>
            <p>
                quotas for group: 
                <GroupSelect setSelectedGroupId={setGroupId} selectedGroupId={groupId} />
            </p>
            { groupId === 0 ? 
                <p>please select a group first</p>
            :
                <QuotaList groupId={groupId} />
            }
        </>
    )
}