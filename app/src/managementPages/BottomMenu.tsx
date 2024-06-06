import { ToggleButtonGroup, ToggleButton, Stack } from "@mui/material";
import { CurrentPage } from "./PageContent";
import { useState } from "react";

import GroupIcon from '@mui/icons-material/Group';
import { BanIcon, BookingIcon, FilterIcon, QuotaIcon, RequestIcon, SettingIcon } from "../Icon";

export interface BottomMenuProps {
    setCurrentPage: (p: CurrentPage) => void,
    setParams: (p: any) => void
}

export const BottomMenu = (props: BottomMenuProps) => {
    const [menu, setMenu] = useState<number>(0);

    const iconButtonStyle = {
        padding: "2px 20px",
        cursor: "pointer",
    }

    return (
        <>
            <ToggleButtonGroup sx={{ display: "block", width: "100%" }}
                color="primary"
                value={menu}
                exclusive
                onChange={(e: any, value: any) => {
                    if (value !== null) {
                        setMenu(value);
                    }
                }}
                aria-label="show users"
            >
                <ToggleButton sx={{ width: "33%" }} value={0}>Users</ToggleButton>
                <ToggleButton sx={{ width: "33%" }} value={1}>Manage</ToggleButton>
                <ToggleButton sx={{ width: "33%" }} value={2}>Monitor</ToggleButton>
            </ToggleButtonGroup>

            {
                menu === 0
                    ?
                    <Stack
                        direction="row" justifyContent="space-around" alignItems="stretch"
                        height="100px">
                        <Stack direction="column" alignItems="center"
                            onClick={() => {
                                props.setParams({});
                                props.setCurrentPage(CurrentPage.manageGroups)
                            }}
                            sx={iconButtonStyle}>
                            <GroupIcon fontSize="large" />
                            <p>Groups</p>
                        </Stack>
                    </Stack>
                    : menu === 1
                        ?
                        <Stack direction="row" justifyContent="space-around" alignItems="stretch"
                            height="100px">
                            <Stack direction="column" alignItems="center"
                                onClick={() => {
                                    props.setParams({ groupId: 1 });
                                    props.setCurrentPage(CurrentPage.manageQuotas);
                                }}
                                sx={iconButtonStyle}>
                                <QuotaIcon fontSize="large" />
                                <p>Quotas</p>
                            </Stack>
                            <Stack direction="column" alignItems="center"
                                onClick={() => {
                                    props.setParams({});
                                    props.setCurrentPage(CurrentPage.manageFilters);
                                }}
                                sx={iconButtonStyle}>
                                <FilterIcon fontSize="large" />
                                <p>Filters</p>
                            </Stack>
                            <Stack direction="column" alignItems="center"
                                onClick={() => {
                                    props.setParams({});
                                    props.setCurrentPage(CurrentPage.manageBans);
                                }}
                                sx={iconButtonStyle}>
                                <BanIcon fontSize="large" />
                                <p>Bans</p>
                            </Stack>
                        </Stack>
                        :
                        <Stack direction="row" justifyContent="space-around" alignItems="stretch" >

                            <Stack direction="column" alignItems="center"
                                onClick={() => {
                                    props.setParams({ userId: 1 });
                                    props.setCurrentPage(CurrentPage.manageBookings);
                                }}
                                sx={iconButtonStyle}>
                                <BookingIcon fontSize="large" />
                                <p>Bookings</p>
                            </Stack>
                            <Stack direction="column" alignItems="center"
                                onClick={() => {
                                    props.setParams({});
                                    props.setCurrentPage(CurrentPage.manageRequests);
                                }}
                                sx={iconButtonStyle}>
                                <RequestIcon fontSize="large" />
                                <p>Requests</p>
                            </Stack>
                            <Stack direction="column" alignItems="center"
                                onClick={() => {
                                    props.setParams({});
                                    props.setCurrentPage(CurrentPage.manageSettings);
                                }}
                                sx={iconButtonStyle}>
                                <SettingIcon fontSize="large" />
                                <p>Settings</p>
                            </Stack>
                        </Stack>
            }
        </>
    )
}