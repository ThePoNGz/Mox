import { format, parseISO, toDate } from 'date-fns';
import { toZonedTime, format as formatTz } from 'date-fns-tz';

export const formatDate = (date: Date | string | number, formatStr: string = 'PP') => {
    const d = date instanceof Date ? date : new Date(date);
    return format(d, formatStr);
};

export const nowISO = () => new Date().toISOString();

export const parseSQLDate = (sqlDate: string) => parseISO(sqlDate);
