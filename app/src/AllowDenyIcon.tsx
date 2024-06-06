import { AllowIcon, DenyIcon } from "./Icon";
import { RedirectDestination } from "./types"

export interface AllowDenyIconProps {
    redirectDestination: RedirectDestination
}

export const AllowDenyIcon = (props: AllowDenyIconProps) => {
    return (
        props.redirectDestination === RedirectDestination.blocked ?
            <DenyIcon />
            :
            <AllowIcon />
    )
}