// MIMEタイプ判定（Nuxtのauto-importで各コンポーネントから直接利用可能）
export const isVideoType = (type: string | undefined | null) => /video\/.*/.test(type ?? "")

export const isAudioType = (type: string | undefined | null) => /audio\/.*/.test(type ?? "")

export const isAllowedMediaType = (type: string | undefined | null) =>
    isVideoType(type) || isAudioType(type)
