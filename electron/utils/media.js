// MIMEタイプ判定（メインプロセス用。レンダラー側は app/utils/media.ts）
export const isVideoType = (type) => /video\/.*/.test(type ?? "");
