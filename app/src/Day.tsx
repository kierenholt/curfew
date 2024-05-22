

export function Day(props: {day: number, full: boolean}) {
    const fullDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const shortDays = ["Su","Mo","Tu","We","Th","Fr","Sa"];

    return (
    <span>
        { props.full ? fullDays[props.day] : shortDays[props.day] }  
    </span>
    )
}