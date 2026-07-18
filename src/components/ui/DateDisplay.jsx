import React from 'react';

const DateDisplay = ({ dd=31, mm=1, yy=2026 }) => {
  // If user passes custom date, use it; else use today's date
  const today = new Date();

  const day = dd ?? today.getDate();
  const month = mm ?? today.getMonth() + 1; // months are 0-indexed
  const year = yy ?? today.getFullYear() % 100; // get last two digits

  // Format with leading zeros
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  const formattedYear = String(year).padStart(2, '0');

  const formattedDate = `${formattedMonth}/${formattedDay}/${formattedYear}`;

  return <div className='ml-2  text-gray-600'>{formattedDate}</div>;
};

export default DateDisplay;
