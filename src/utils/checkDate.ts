export function checkDate(dateFromTable: string): boolean {
  // const dateFromTable = "05-05 05:0005-12";

  const mmdd = dateFromTable.substring(0, 5);
  
  const year = new Date().getFullYear();
  
  const dateStr = `${mmdd}-${year}`;
  console.log(`Formatted date string: ${dateStr}`);
  
  const date = new Date(dateStr);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  date.setHours(0, 0, 0, 0);
  
  const diffDays = (today - date) / (1000 * 60 * 60 * 24);
  
  return (diffDays === 0 || diffDays === -1)
}