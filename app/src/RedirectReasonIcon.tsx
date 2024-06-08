import { BanIcon, BookingIcon, FilterIcon, NoFilterIcon } from "./Icon";
import { RedirectReason } from "./types";

interface RedirectReasonIconProps {
    reason: RedirectReason;
}

export const RedirectReasonIcon = (props: RedirectReasonIconProps) => {


    return (props.reason === RedirectReason.deviceIsBanned || props.reason === RedirectReason.userIsBanned || props.reason === RedirectReason.groupIsBanned 
    ?
    <BanIcon />
    :
    props.reason === RedirectReason.domainIsAlwaysAllowed || RedirectReason.domainIsAlwaysBlocked || RedirectReason.needsToBook 
    ? 
    <FilterIcon />
    :
    props.reason === RedirectReason.hasBooked
    ?
    <BookingIcon />
    :
    props.reason === RedirectReason.filterNotFound
    ?
    <NoFilterIcon />
    :
    <></>
    )
}