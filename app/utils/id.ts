let seq = 0

// リスト行の :key 用の一意ID
export const newId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`

// 既存データ（id無しで保存されたもの）にidを補完する
export const ensureIds = <T extends { id?: string }>(list: T[]): T[] =>
    list.map(item => item.id ? item : {...item, id: newId()})
