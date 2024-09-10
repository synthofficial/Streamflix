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

export const convertDurationToSeconds = (duration : string) => {
    //Duration is passed as mmMin
    const minutes = parseInt(duration, 10);
    if(isNaN(minutes)){
        return "N/A";
    }
    //return duration as seconds
    return minutes * 60;
}

export const getWatchlist = () : WatchlistItem[] => {
    const watchlist = localStorage.getItem("watchlist");
    return watchlist ? JSON.parse(watchlist) : [];
}

export const addToWatchlist = (item : WatchlistItem) => {
    const watchlist = getWatchlist();
    if(!watchlist.some(i => i.id === item.id)){
        watchlist.push(item);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }
}

export const updateWatchlistMovieTime = (id : string, time : number) => {
    const watchlist = getWatchlist();
    const index = watchlist.findIndex(item => item.id === id);
    if(index !== -1){
        watchlist[index].timestamp = time;
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }
}

export const removeFromWatchlist = (id: string): void => {
    const watchlist = getWatchlist();
    const updatedWatchlist = watchlist.filter(item => item.id !== id);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };
  
  export const isInWatchlist = (id: string): boolean => {
    const watchlist = getWatchlist();
    return watchlist.some(item => item.id === id);
  };

export const getWatchingList = () : WatchlistItem[] => {
    const watchlist = localStorage.getItem("watchinglist");
    return watchlist ? JSON.parse(watchlist) : [];
}

export const addToWatchingList = (item : WatchlistItem) => {
    const watchlist = getWatchingList();
    if(!watchlist.some(i => i.id === item.id)){
        watchlist.push(item);
        localStorage.setItem("watchinglist", JSON.stringify(watchlist));
    }
}

export const updateEpisodeWatchTime = (id : string, episodeId : string, time : number, finishTime : number) => {
    const watchlist = getWatchingList();
    const index = watchlist.findIndex(item => item.id === id);
    if(index !== -1){
        const episodeIndex : number = watchlist[index].episodes?.findIndex(ep => ep.id === episodeId)!;
        if(episodeIndex !== -1){
            console.log(time, finishTime);
            watchlist[index].episodes![episodeIndex].timestamp = time;
            watchlist[index].episodes![episodeIndex].completed = time >= finishTime ? true : false;
            localStorage.setItem("watchinglist", JSON.stringify(watchlist));
        }
    }
}

export const updateWatchingListMovieTime = (id : string, time : number) => {
    const watchlist = getWatchingList();
    const index = watchlist.findIndex(item => item.id === id);
    if(index !== -1){
        watchlist[index].timestamp = time;
        localStorage.setItem("watchinglist", JSON.stringify(watchlist));
    }
}

export const removeFromWatchingList = (id: string): void => {
    const watchlist = getWatchingList();
    const updatedWatchlist = watchlist.filter(item => item.id !== id);
    localStorage.setItem('watchinglist', JSON.stringify(updatedWatchlist));
};
  
export const isInWatchingList = (id: string): boolean => {
    const watchlist = getWatchingList();
    return watchlist.some(item => item.id === id);
};

export const markAsCompleteInWatchingList = (id: string): void => {
    const watchlist = getWatchingList();
    const index = watchlist.findIndex(item => item.id === id);

    if(index !== -1){
        // Copy the item before removing it
        const completedItem = { ...watchlist[index] };

        // Remove this item from watchinglist
        watchlist.splice(index, 1);

        // Mark as completed and increment timesWatched
        completedItem.completed = true;
        completedItem.timesWatched = completedItem.timesWatched ? completedItem.timesWatched + 1 : 1;

        // Update the localStorage with modified lists
        localStorage.setItem("watchinglist", JSON.stringify(watchlist));
        localStorage.setItem("completedlist", JSON.stringify([...getCompletedList(), completedItem]));
    }
}

export const getCompletedList = () : WatchlistItem[] => {
    const watchlist = localStorage.getItem("completedlist");
    return watchlist ? JSON.parse(watchlist) : [];
}