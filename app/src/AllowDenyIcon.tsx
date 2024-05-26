import { RedirectDestination } from "./types"
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';

export interface AllowDenyIconProps {
    redirectDestination: RedirectDestination
}

export const AllowDenyIcon = (props: AllowDenyIconProps) => {
    return (
        props.redirectDestination === RedirectDestination.blocked ?
            <BlockIcon />
            :
            <CheckIcon />
    )
}