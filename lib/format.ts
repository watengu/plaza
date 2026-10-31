/** 残り時間の表示とバッジの濃淡（確定文法：赤系は残り3時間以内だけ、30分以内は濃い赤）。 */
export function remainingLabel(expiresAt: Date | string, now = new Date()): string {
  const ms = new Date(expiresAt).getTime() - now.getTime();
  if (ms <= 0) return "まもなく消えます";
  const min = Math.floor(ms / 60000);
  if (min < 60) return `あと ${Math.max(min, 1)}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h >= 24) return `あと ${h}時間`;
  return m > 0 ? `あと ${h}時間${m}分` : `あと ${h}時間`;
}

export function ttlClass(expiresAt: Date | string, now = new Date()): string {
  const ms = new Date(expiresAt).getTime() - now.getTime();
  if (ms <= 30 * 60000) return "ttl crit";
  if (ms <= 3 * 3600000) return "ttl hot";
  return "ttl";
}

/** 「◯分前」表示（板の行・スレッドの行用。赤にはしない）。 */
export function agoLabel(at: Date | string, now = new Date()): string {
  const min = Math.max(0, Math.floor((now.getTime() - new Date(at).getTime()) / 60000));
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}
