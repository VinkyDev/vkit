import PinyinMatch from 'pinyin-match';
import { type IPluginManifest } from '@vkit/api';

export interface SearchResult {
  plugin: IPluginManifest;
  score: number;
  matchType: 'name' | 'pinyin' | 'special';
  matchedRule?: string;
}

/**
 * 模糊匹配插件名称
 */
function fuzzyMatchName(query: string, name: string): number {
  const queryLower = query.toLowerCase();
  const nameLower = name.toLowerCase();

  if (nameLower.includes(queryLower)) {
    // 完全包含，根据匹配位置和长度计算分数
    const index = nameLower.indexOf(queryLower);
    const lengthRatio = queryLower.length / nameLower.length;
    const positionScore = index === 0 ? 1 : 0.8; // 开头匹配得分更高
    return lengthRatio * positionScore * 10;
  }

  // 字符逐个匹配
  let matchCount = 0;
  let lastIndex = -1;
  for (const char of queryLower) {
    const index = nameLower.indexOf(char, lastIndex + 1);
    if (index > lastIndex) {
      matchCount++;
      lastIndex = index;
    }
  }

  if (matchCount === queryLower.length) {
    return (matchCount / nameLower.length) * 5;
  }

  return 0;
}

/**
 * 拼音匹配
 */
function pinyinMatch(query: string, name: string): number {
  const result = PinyinMatch.match(name, query);
  if (result) {
    // 根据匹配程度计算分数
    const matchLength = result.reduce((sum, item) => sum + item, 0);
    const totalLength = name.length;
    return (matchLength / totalLength) * 8;
  }
  return 0;
}

/**
 * 特殊规则匹配
 */
function specialRuleMatch(
  query: string,
  plugin: IPluginManifest
): { score: number; rule?: string } {
  if (!plugin.matchRules || plugin.matchRules.length === 0) {
    return { score: 0 };
  }

  let maxScore = 0;
  let matchedRule = '';

  for (const rule of plugin.matchRules) {
    const regex = new RegExp(rule.pattern, 'i');
    if (regex.test(query)) {
      const score = rule.weight;
      if (score > maxScore) {
        maxScore = score;
        matchedRule = rule.description ?? rule.pattern;
      }
    }
  }

  return { score: maxScore, rule: matchedRule };
}

/**
 * 搜索插件
 */
export function searchPlugins(query: string, plugins: IPluginManifest[]): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const plugin of plugins) {
    const nameScore = fuzzyMatchName(query, plugin.name);
    const pinyinScore = pinyinMatch(query, plugin.name);
    const { score: specialScore, rule: matchedRule } = specialRuleMatch(query, plugin);

    let maxScore = 0;
    let matchType: 'name' | 'pinyin' | 'special' = 'name';

    if (nameScore > maxScore) {
      maxScore = nameScore;
      matchType = 'name';
    }

    if (pinyinScore > maxScore) {
      maxScore = pinyinScore;
      matchType = 'pinyin';
    }

    if (specialScore > maxScore) {
      maxScore = specialScore;
      matchType = 'special';
    }

    // 应用插件基础权重
    const baseWeight = plugin.weight ?? 1;
    const finalScore = maxScore * baseWeight;

    if (finalScore > 0) {
      results.push({
        plugin,
        score: finalScore,
        matchType,
        matchedRule: matchType === 'special' ? matchedRule : undefined,
      });
    }
  }

  // 按分数降序排列
  return results.sort((a, b) => b.score - a.score);
}
