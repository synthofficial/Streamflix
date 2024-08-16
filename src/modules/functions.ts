export const convertMinutesToHours = (duration : string) => {
    const minutes = parseInt(duration, 10);
    if(isNaN(minutes)){
        return "N/A";
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if(hours === 0) return `${mins} mins`;
    return `${hours}h ${mins}m`;
}
