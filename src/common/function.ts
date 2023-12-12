export const getDaysDifference = (date: string | null): number => {
  if (!date) {
    return Infinity;
  }

  let dateString = date?.toString();
  if (dateString == '') {
    return Infinity;
  } else {
    const [time, date] = dateString.split(' ');
    const [hour, minute] = time.slice(0, -1).split(':');
    const [day, month, year] = date.split('/');

    const now = new Date();
    const dateObject = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
    );

    const differenceInTime = now.getTime() - dateObject.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600);

    return Math.abs(Math.round(differenceInDays));
  }
};

export const generateRandomCode = () => {
  const randomString = Math.random().toString(36).substr(2, 6).toUpperCase();
  const currentTime = Date.now().toString();
  return randomString + '_' + currentTime;
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  const date = ('0' + now.getDate()).slice(-2);
  const month = ('0' + (now.getMonth() + 1)).slice(-2);
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = ('0' + now.getMinutes()).slice(-2);

  return `${hours}:${minutes} ${date}/${month}/${year}`;
};
