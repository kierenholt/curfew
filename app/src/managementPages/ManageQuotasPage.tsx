import { useEffect, useState } from "react";
import { GroupSelect } from "../GroupSelect";
import { QuotaList } from "../QuotaList";
import { Helpers } from "../helpers";
import { IQuota, IUserGroup } from "../types";

export interface ManageQuotasProps {
    params: any //groupId
}

export function ManageQuotasPage(props: ManageQuotasProps) {
    const [groupId, setGroupId] = useState<number>(props?.params?.groupId ?? 1);
    const [group, setGroup] = useState<IUserGroup | null>(null);

    let [quotas, setQuotas] = useState<IQuota[]>([]);

    useEffect(() => {
        if (groupId > 0) {
            Helpers.get<IQuota[]>(`/api/quotas/${groupId}`)
                .then((quotas: IQuota[]) => {
                    setQuotas(quotas)
                });

            Helpers.get<IUserGroup>(`/api/userGroups/${groupId}`)
                .then((group: IUserGroup) => {
                    setGroup(group);
                });
        }
    }, [groupId]);

    return (
        <>
            <p>
                quotas for group:
                <GroupSelect setSelectedGroupId={setGroupId} selectedGroupId={groupId} />
            </p>
            {groupId === 0 ?
                <p>please select a group first</p>
                :
                group?.isUnrestricted
                    ?
                    <h2>This group is unrestricted. Quotas do not apply to it.</h2>
                    :
                    <QuotaList quotas={quotas} allowEdit={true} />
            }
        </>
    )
}