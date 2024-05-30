import { AllowIcon } from "./Icon";
import { RedirectDestination } from "./types"
import BlockIcon from '@mui/icons-material/Block';

export interface AllowDenyIconProps {
    redirectDestination: RedirectDestination
}

export const AllowDenyIcon = (props: AllowDenyIconProps) => {
    return (
        props.redirectDestination === RedirectDestination.blocked ?
            <BlockIcon />
            :
            <AllowIcon />
    )
}