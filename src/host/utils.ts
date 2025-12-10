
import { StringDecoder } from "string_decoder";

export  function binary2str(arr: Uint8Array) {
  const decoder = new StringDecoder();
  return decoder.end(Buffer.from(arr));
}