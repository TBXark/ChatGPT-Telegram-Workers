/* eslint-disable unused-imports/no-unused-vars */

import type { FuncTool } from './types';

// import { decode } from "html-entities";
const SEARCH_REGEX = /DDG\.pageLayout\.load\('d',(\[.+\])\);DDG\.duckbar\.load\('images'/;
const IMAGES_REGEX = /;DDG\.duckbar\.load\('images', (\{"ads":.+"vqd":\{".+":"\d-\d+-\d+"\}\})\);DDG\.duckbar\.load\('news/;
const NEWS_REGEX = /;DDG\.duckbar\.load\('news', (\{"ads":.+"vqd":\{".+":"\d-\d+-\d+"\}\})\);DDG\.duckbar\.load\('videos/;
const VIDEOS_REGEX = /;DDG\.duckbar\.load\('videos', (\{"ads":.+"vqd":\{".+":"\d-\d+-\d+"\}\})\);DDG\.duckbar\.loadModule\('related_searches/;
const RELATED_SEARCHES_REGEX = /DDG\.duckbar\.loadModule\('related_searches', (\{"ads":.+"vqd":\{".+":"\d-\d+-\d+"\}\})\);DDG\.duckbar\.load\('products/;
const VQD_REGEX = /vqd=['"](\d+-\d+(?:-\d+)?)['"]/;
let SearchTimeType: { [s: string]: string } = {};
(function (SearchTimeType) {
    /** From any time. */
    SearchTimeType.ALL = 'a';
    /** From the past day. */
    SearchTimeType.DAY = 'd';
    /** From the past week. */
    SearchTimeType.WEEK = 'w';
    /** From the past month. */
    SearchTimeType.MONTH = 'm';
    /** From the past year. */
    SearchTimeType.YEAR = 'y';
})(SearchTimeType || (SearchTimeType = {}));
let SafeSearchType: { [x: string]: any; OFF?: any; STRICT?: any } = {};
(function (SafeSearchType) {
    /** Strict filtering, no NSFW content. */
    SafeSearchType[SafeSearchType.STRICT = 0] = 'STRICT';
    /** Moderate filtering. */
    SafeSearchType[SafeSearchType.MODERATE = -1] = 'MODERATE';
    /** No filtering. */
    SafeSearchType[SafeSearchType.OFF = -2] = 'OFF';
})(SafeSearchType || (SafeSearchType = {}));
const defaultOptions = {
    safeSearch: SafeSearchType.OFF,
    time: SearchTimeType.ALL,
    locale: 'en-us',
    region: 'wt-wt',
    offset: 0,
    marketRegion: 'us',
};

function decode(text: string) {
    const entities = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&apos;': '\'',
    };

    return text.replace(/&[a-z0-9#]+;/gi, (match: string) => (entities as { [key: string]: string })[match] || match);
}

export async function search(query: any, options: { safeSearch: any; offset: any; region: any; vqd?: any; locale?: any; marketRegion?: any; time?: any }) {
    if (!query)
        throw new Error('Query cannot be empty!');
    if (!options)
        options = defaultOptions;
    else
        options = sanityCheck(options);
    let vqd = options.vqd;
    if (!vqd)
        vqd = await getVQD(query, 'web');
    const queryObject = {
        q: query,
        ...(options.safeSearch !== SafeSearchType.STRICT ? { t: 'D' } : {}),
        l: options.locale,
        ...(options.safeSearch === SafeSearchType.STRICT ? { p: '1' } : {}),
        kl: options.region || 'wt-wt',
        s: String(options.offset),
        dl: 'en',
        ct: 'US',
        ss_mkt: options.marketRegion,
        df: options.time,
        vqd,
        ...(options.safeSearch !== SafeSearchType.STRICT
            ? { ex: String(options.safeSearch) }
            : {}),
        sp: '1',
        bpa: '1',
        biaexp: 'b',
        msvrtexp: 'b',
        ...(options.safeSearch === SafeSearchType.STRICT
            ? {
                    videxp: 'a',
                    nadse: 'b',
                    eclsexp: 'a',
                    stiaexp: 'a',
                    tjsexp: 'b',
                    related: 'b',
                    msnexp: 'a',
                }
            : {
                    nadse: 'b',
                    eclsexp: 'b',
                    tjsexp: 'b',
                // cdrexp: 'b'
                }),
    };
    const response = await fetch(`https://links.duckduckgo.com/d.js?${queryString(queryObject)}`);
    const data = await response.text();
    if (data.includes('DDG.deep.is506') || data.includes('DDG.deep.anomalyDetectionBlock'))
        throw new Error('A server error occurred!');
    const searchMatch = SEARCH_REGEX.exec(data);
    if (!searchMatch) {
        throw new Error('未能找到搜索结果！');
    }
    const searchResults = JSON.parse(searchMatch[1].replace(/\t/g, '    '));
    if (searchResults.length === 1 && !('n' in searchResults[0])) {
        const onlyResult = searchResults[0];
        /* istanbul ignore next */
        if ((!onlyResult.da && onlyResult.t === 'EOF')
            || !onlyResult.a
            || onlyResult.d === 'google.com search') {
            return {
                noResults: true,
                vqd,
                results: [],
            };
        }
    }
    const results: {
        noResults: boolean;
        vqd: string;
        results: any[];
        related: { text: any; raw: any }[];
        images?: any[];
        news?: any[];
        videos?: {
            url: any;
            title: string;
            description: string;
            image: any;
            duration: any;
            publishedOn: any;
            published: any;
            publisher: any;
            viewCount: any;
        }[];
    } = {
        noResults: false,
        vqd,
        results: [],
        related: [],
        videos: [],
    };
    for (const search of searchResults) {
        if ('n' in search)
            continue;
        let bang;
        if (search.b) {
            const [prefix, title, domain] = search.b.split('\t');
            bang = { prefix, title, domain };
        }
        results.results.push({
            title: search.t,
            description: decode(search.a),
            rawDescription: search.a,
            hostname: search.i,
            icon: `https://external-content.duckduckgo.com/ip3/${search.i}.ico`,
            url: search.u,
            bang,
        });
    }
    // Images
    const imagesMatch = IMAGES_REGEX.exec(data);
    if (imagesMatch) {
        const imagesResult = JSON.parse(imagesMatch[1].replace(/\t/g, '    '));
        results.images = imagesResult.results.map((i: { title: any }) => {
            i.title = decode(i.title);
            return i;
        });
    }
    // News
    const newsMatch = NEWS_REGEX.exec(data);
    if (newsMatch) {
        const newsResult = JSON.parse(newsMatch[1].replace(/\t/g, '    '));
        results.news = newsResult.results.map((article: { date: any; excerpt: any; image: any; relative_time: any; syndicate: any; title: any; url: any; is_old: any }) => ({
            date: article.date,
            excerpt: decode(article.excerpt),
            image: article.image,
            relativeTime: article.relative_time,
            syndicate: article.syndicate,
            title: decode(article.title),
            url: article.url,
            isOld: !!article.is_old,
        }));
    }
    // Videos
    const videosMatch = VIDEOS_REGEX.exec(data);
    if (videosMatch) {
        const videoResult = JSON.parse(videosMatch[1].replace(/\t/g, '    '));
        results.videos = [];
        /* istanbul ignore next */
        for (const video of videoResult.results) {
            results.videos.push({
                url: video.content,
                title: decode(video.title),
                description: decode(video.description),
                image: video.images.large
                    || video.images.medium
                    || video.images.small
                    || video.images.motion,
                duration: video.duration,
                publishedOn: video.publisher,
                published: video.published,
                publisher: video.uploader,
                viewCount: video.statistics.viewCount || undefined,
            });
        }
    }
    // Related Searches
    const relatedMatch = RELATED_SEARCHES_REGEX.exec(data);
    if (relatedMatch) {
        const relatedResult = JSON.parse(relatedMatch[1].replace(/\t/g, '    '));
        results.related = [];
        for (const related of relatedResult.results) {
            results.related.push({
                text: related.text,
                raw: related.display_text,
            });
        }
    }
    return results;
}
function queryString(query: string | string[][] | Record<string, string> | URLSearchParams | { nadse: string; eclsexp: string; tjsexp: string; sp: string; bpa: string; biaexp: string; msvrtexp: string; ex?: string | undefined; kl: any; s: string; dl: string; ct: string; ss_mkt: any; df: any; vqd: any; p?: string | undefined; l: any; t?: string | undefined; q: any } | undefined) {
    return new URLSearchParams(query).toString();
}
async function getVQD(query: any, ia = 'web') {
    try {
        const response = await fetch(`https://duckduckgo.com/?${queryString({ q: query, ia })}`);
        const data = await response.text();
        const match = VQD_REGEX.exec(data);
        if (!match) {
            throw new Error(`Failed to extract VQD from the response for query "${query}".`);
        }
        return match[1];
    } catch (e) {
        throw new Error(`Failed to get the VQD for query "${query}".`);
    }
}
function sanityCheck(options: { safeSearch: string; offset: number; time?: unknown; locale?: any; region: any; marketRegion?: any; vqd?: string }) {
    options = Object.assign({}, defaultOptions, options);
    if (!(options.safeSearch in SafeSearchType))
        throw new TypeError(`${options.safeSearch} is an invalid safe search type!`);
    /* istanbul ignore next */
    if (typeof options.safeSearch === 'string')
        options.safeSearch = SafeSearchType[options.safeSearch];
    if (typeof options.offset !== 'number')
        throw new TypeError(`Search offset is not a number!`);
    if (options.offset < 0)
        throw new RangeError('Search offset cannot be below zero!');
    if (options.time
        && !Object.values(SearchTimeType).includes(options.time as string)
        && typeof options.time === 'string' && !/\d{4}-\d{2}-\d{2}..\d{4}-\d{2}-\d{2}/.test(options.time)) {
        throw new TypeError(`${options.time} is an invalid search time!`);
    }
    if (!options.locale || typeof options.locale !== 'string')
        throw new TypeError('Search locale must be a string!');
    if (!options.region || typeof options.region !== 'string')
        throw new TypeError('Search region must be a string!');
    if (!options.marketRegion || typeof options.marketRegion !== 'string')
        throw new TypeError('Search market region must be a string!');
    if (options.vqd && !/\d-\d+-\d+/.test(options.vqd))
        throw new Error(`${options.vqd} is an invalid VQD!`);
    return options;
}

export const duckduckgo_search: FuncTool = {
    schema: {
        name: 'duckduckgo_search',
        description: 'Use DuckDuckGo search engine to find information. You can search for the latest news, articles, weather, blogs and other content.',
        parameters: {
            type: 'object',
            properties: {
                keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    description: `Keyword list for search. For example: ['Python', 'machine learning', 'latest developments']. The list should have a length of at least 3 and maximum of 4. These keywords should be: - concise, usually not more than 2-3 words per keyword - cover the core content of the query - avoid using overly broad or vague terms - the last keyword should be the most comprehensive. Also, do not generate keywords based on current time.`,
                },
            },
            required: ['keywords'],
            additionalProperties: false,
        },
    },

    func: async (args: any) => {
        const { keywords } = args;
        console.log('start search: ', keywords);
        const searchResults = await search(keywords.join(' '), {
            safeSearch: SafeSearchType.STRICT,
            offset: 0,
            region: 'cn-zh',
        });

        const max_length = 8;
        const content = searchResults.results
            .slice(0, max_length)
            .map(d => `title: ${d.title}\ndescription: ${d.description}\nurl: ${d.url}`)
            .join('\n---\n');
        return content;
    },
};
