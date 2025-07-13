/**
 * JSON工具函数
 */

/**
 * 安全解析JSON字符串，支持fallback
 * @param text JSON字符串
 * @param fallback 解析失败时的fallback值
 * @returns 解析结果
 */
export function parse<T = unknown>(text: string, fallback: Partial<T>): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback as Required<T>;
  }
}

/**
 * 将值转换为JSON字符串
 * @param value 要转换的值
 * @returns JSON字符串
 */
export function stringify<T = unknown>(value: T) {
  return JSON.stringify(value);
}

/**
 * 格式化JSON字符串
 * @param jsonString 要格式化的JSON字符串
 * @param indent 缩进空格数，默认为2
 * @returns 格式化后的JSON字符串，如果解析失败则返回原字符串
 */
export function formatJSON(jsonString: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(jsonString) as object;
    return JSON.stringify(parsed, null, indent);
  } catch {
    return jsonString;
  }
}

/**
 * 压缩JSON字符串（移除空格和换行）
 * @param jsonString 要压缩的JSON字符串
 * @returns 压缩后的JSON字符串，如果解析失败则返回原字符串
 */
export function minifyJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString) as object;
    return JSON.stringify(parsed);
  } catch {
    return jsonString;
  }
}

/**
 * 验证JSON字符串是否有效
 * @param jsonString 要验证的JSON字符串
 * @returns 是否为有效的JSON
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * 将值转换为JSON字符串
 * @param value 要转换的值
 * @param indent 缩进空格数，默认为2
 * @returns JSON字符串
 */
export function valueToJSONString(value: string | object, indent: number = 2): string {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return '';
  }
}

/**
 * 安全解析JSON字符串，返回详细结果
 * @param jsonString JSON字符串
 * @returns 解析结果，包含成功状态和数据或错误信息
 */
export function safeParseJSON<T = unknown>(jsonString: string): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString) as T;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
