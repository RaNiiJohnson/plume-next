export const formatDate = (date: string | number | Date) =>
  new Intl.DateTimeFormat("en-EN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
