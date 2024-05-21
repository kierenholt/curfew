

export function Day(props: {day: number, full: boolean}) {
    const fullDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const shortDays = ["Mo","Tu","We","Th","Fr","Sa","Su"];

    return (
    <span>
        { props.full ? fullDays[props.day] : shortDays[props.day] }  
    </span>
    )
}