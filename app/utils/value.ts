// 値が入力済みか（undefined / null / 空文字 でない）
export const isPresent = (v: unknown) => v !== undefined && v !== null && v !== ""
