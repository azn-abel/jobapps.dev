type JSONSuccess<T = undefined> = {
  success: true
  msg: string
} & (T extends undefined | void ? {} : { data: T })

type JSONFail = {
  success: false
  detail: string
}

type JSONResponse<T = undefined> = JSONSuccess<T> | JSONFail
