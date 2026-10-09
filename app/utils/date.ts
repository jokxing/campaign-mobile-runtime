const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Shanghai'
});

export function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? timeFormatter.format(date) : '--:--';
}
