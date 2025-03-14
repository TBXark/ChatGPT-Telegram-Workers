import type { I18n } from './types';
import en from './en';
import pt from './pt';
import zhHans from './zh-hans';
import zhHant from './zh-hant';

export default function loadI18n(lang?: string): I18n {
    switch (lang?.toLowerCase()) {
        case 'cn':
        case 'zh-cn':
        case 'zh-hans':
            return zhHans;
        case 'zh-tw':
        case 'zh-hk':
        case 'zh-mo':
        case 'zh-hant':
            return zhHant;
        case 'pt':
        case 'pt-br':
            return pt;
        case 'en':
        case 'en-us':
            return en;
        default:
            return en;
    }
}
