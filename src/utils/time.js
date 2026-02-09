export const formatUsageTime = (seconds = 0) => {
  if (!seconds) return '0h 0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const totalMinutes = (h * 60) + m;

  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutesAfterDays = totalMinutes % (24 * 60);

  const remainingHours = Math.floor(remainingMinutesAfterDays / 60);
  const remainingMins = remainingMinutesAfterDays % 60;

  return days>0 ? `${days}d ${remainingHours}h ${remainingMins}m` : `${remainingHours}h ${remainingMins}m`;

  // return `${h}h ${m}m`;
};

export const formatLastActive = (date) => {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} mins ago`;
  const days = Math.floor(mins / (24 * 60));
  const remainingMinutesAfterDays = mins % (24 * 60);
  const remainingHours = Math.floor(remainingMinutesAfterDays / 60);
  // const hrs = Math.floor(mins / 60);
  return days>0 ? `${days}d ${remainingHours} hrs ago` : `${remainingHours} hrs ago`;
};

export const getShortId = (uuid) => {
  let hash = 0;

  for (let i = 0; i < uuid.length; i++) {
    hash = (hash << 5) - hash + uuid.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return `#${Math.abs(hash).toString().slice(0, 6)}`;
};


export const getLast7DaysRange = () => {
  const now = new Date();

  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);

  const formatLocalDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');

    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
      `${String(date.getMilliseconds()).padStart(3, '0')}`
    );
  };

  return {
    from: formatLocalDateTime(from),
    to: formatLocalDateTime(to),
  };
};
