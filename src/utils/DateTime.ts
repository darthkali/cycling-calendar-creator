// src/utils/DateTime.ts
export type DateTime = [number, number, number, number, number];

export const convertDateAndTimeToDateTime = (date: Date, time: Date): DateTime => {
    return [
        date.getFullYear(),
        date.getMonth() + 1, // Monate sind nullbasiert
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
    ];
};

export const getNow= () : string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    console.log(value)
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};
