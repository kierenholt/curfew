import { BanIcon, BookingIcon, FilterIcon, NoFilterIcon } from "./Icon";
import { IRequest, RedirectReason } from "./types";


export const reasonIcon = (r: IRequest) => {

        switch (r.redirectReason) {
            case RedirectReason.deviceIsBanned:
                return <BanIcon />;
            case RedirectReason.userIsBanned:
                return <BanIcon />;
            case RedirectReason.groupIsBanned:
                return <BanIcon />;
            case RedirectReason.domainIsAlwaysAllowed:
                return <FilterIcon />;
            case RedirectReason.domainIsAlwaysBlocked:
                return <FilterIcon />;
            case RedirectReason.filterNotFound:
                return <NoFilterIcon />;
            case RedirectReason.hasBooked:
                return <BookingIcon />;
            case RedirectReason.needsToBook:
                return <BookingIcon />;
            case RedirectReason.error:
                return <></>;
            default:
                return <></>
        }
}