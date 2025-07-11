import PinyinMatch from 'pinyin-match';
import { type ISearchResultItem, type IInstantSearchResultItem, type IPlugin } from '@vkit/api';

/**
 * 搜索结果（统一的搜索结果类型）
 */
export interface SearchResult {
  /** 搜索结果项 */
  item: ISearchResultItem | IInstantSearchResultItem;
  /** 匹配分数 */
  score: number;
  /** 匹配类型 */
  matchType: 'name' | 'pinyin' | 'searchTerms' | 'description';
  /** 匹配的搜索词 */
  matchedTerm?: string;
}

/**
 * 模糊匹配文本
 */
function fuzzyMatchText(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  if (textLower.includes(queryLower)) {
    // 完全包含，根据匹配位置和长度计算分数
    const index = textLower.indexOf(queryLower);
    const lengthRatio = queryLower.length / textLower.length;
    const positionScore = index === 0 ? 1 : 0.8; // 开头匹配得分更高
    return lengthRatio * positionScore * 10;
  }

  // 字符逐个匹配
  let matchCount = 0;
  let lastIndex = -1;
  for (const char of queryLower) {
    const index = textLower.indexOf(char, lastIndex + 1);
    if (index > lastIndex) {
      matchCount++;
      lastIndex = index;
    }
  }

  if (matchCount === queryLower.length) {
    return (matchCount / textLower.length) * 5;
  }

  return 0;
}

/**
 * 拼音匹配
 */
function pinyinMatch(query: string, text: string): number {
  const result = PinyinMatch.match(text, query);
  if (result) {
    // 根据匹配程度计算分数
    const matchLength = result.reduce((sum, item) => sum + item, 0);
    const totalLength = text.length;
    return (matchLength / totalLength) * 8;
  }
  return 0;
}

/**
 * 搜索词匹配
 */
function searchTermsMatch(query: string, searchTerms: string[]): { score: number; term?: string } {
  let maxScore = 0;
  let matchedTerm = '';

  for (const term of searchTerms) {
    const termLower = term.toLowerCase();
    const queryLower = query.toLowerCase();

    if (termLower.includes(queryLower)) {
      const lengthRatio = queryLower.length / termLower.length;
      const score = lengthRatio * 12; // 搜索词匹配权重较高
      if (score > maxScore) {
        maxScore = score;
        matchedTerm = term;
      }
    }
  }

  return { score: maxScore, term: matchedTerm };
}

/**
 * 计算搜索结果项的匹配分数
 */
function calculateScore(
  query: string,
  item: ISearchResultItem | IInstantSearchResultItem
): SearchResult | null {
  if (!query.trim()) {
    return null;
  }

  const nameScore = fuzzyMatchText(query, item.name);
  const pinyinScore = pinyinMatch(query, item.name);
  const descriptionScore = item.description ? fuzzyMatchText(query, item.description) * 0.5 : 0;

  // 对于ISearchResultItem，检查searchTerms匹配
  const searchTermsScore =
    'searchTerms' in item ? searchTermsMatch(query, item.searchTerms) : { score: 0 };

  let maxScore = 0;
  let matchType: 'name' | 'pinyin' | 'searchTerms' | 'description' = 'name';
  let matchedTerm: string | undefined;

  if (nameScore > maxScore) {
    maxScore = nameScore;
    matchType = 'name';
  }

  if (pinyinScore > maxScore) {
    maxScore = pinyinScore;
    matchType = 'pinyin';
  }

  if (searchTermsScore.score > maxScore) {
    maxScore = searchTermsScore.score;
    matchType = 'searchTerms';
    matchedTerm = searchTermsScore.term;
  }

  if (descriptionScore > maxScore) {
    maxScore = descriptionScore;
    matchType = 'description';
  }

  // 应用项目权重
  const itemWeight = item.weight ?? 1;
  const finalScore = maxScore * itemWeight;

  if (finalScore > 0) {
    return {
      item,
      score: finalScore,
      matchType,
      matchedTerm,
    };
  }

  return null;
}

/**
 * 在已缓存的搜索结果项中搜索
 */
export function searchInItems(
  query: string,
  allItems: (ISearchResultItem | IInstantSearchResultItem)[]
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const item of allItems) {
    const result = calculateScore(query, item);
    if (result) {
      results.push(result);
    }
  }

  // 按分数降序排列
  return results.sort((a, b) => b.score - a.score);
}

/**
 * 获取所有插件的搜索结果项（缓存用）
 */
export async function getAllSearchItems(plugins: IPlugin[]): Promise<ISearchResultItem[]> {
  const allItems: ISearchResultItem[] = [];

  for (const plugin of plugins) {
    if (!plugin.isSupported() || plugin.manifest.allowSearch === false) {
      continue;
    }

    try {
      const items = await plugin.getSearchResultItems();
      allItems.push(...items);
    } catch (error) {
      console.warn(`Failed to get search items from plugin ${plugin.manifest.id}:`, error);
    }
  }

  return allItems;
}

/**
 * 获取实时搜索结果
 */
export function getInstantSearchResults(query: string, plugins: IPlugin[]): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const plugin of plugins) {
    if (!plugin.isSupported() || plugin.manifest.allowSearch === false) {
      continue;
    }

    try {
      if (plugin.getInstantSearchResultItems) {
        const instantResults = plugin.getInstantSearchResultItems(query);
        for (const item of instantResults.items) {
          const result = calculateScore(query, item);
          if (result) {
            results.push(result);
          }
        }
      }
    } catch (error) {
      console.warn(
        `Failed to get instant search results from plugin ${plugin.manifest.id}:`,
        error
      );
    }
  }

  // 按分数降序排列
  return results.sort((a, b) => b.score - a.score);
}
