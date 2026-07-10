// 秒数を mm:ss 形式にする
export function minSecColonFrom(t: number | null | undefined) {
  if (typeof t !== "number") return ""
  return [t / 60, t % 60]
      .map((v) => `0${Math.floor(v)}`.slice(-2))
      .join(':');
}
