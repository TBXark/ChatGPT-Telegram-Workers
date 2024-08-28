/* eslint-disable regexp/no-potentially-useless-backreference */
const INTERPOLATE_LOOP_REGEXP = /\{\{#each(?::(\w+))?\s+(\w+)\s+in\s+([\w.[\]]+)\}\}([\s\S]*?)\{\{\/each(?::\1)?\}\}/g;
const INTERPOLATE_CONDITION_REGEXP = /\{\{#if(?::(\w+))?\s+([\w.[\]]+)\}\}([\s\S]*?)(?:\{\{#else(?::\1)?\}\}([\s\S]*?))?\{\{\/if(?::\1)?\}\}/g;
const INTERPOLATE_VARIABLE_REGEXP = /\{\{([\w.[\]]+)\}\}/g;

function evaluateExpression(expr: string, localData: any): undefined | any {
    if (expr === '.') {
        return localData['.'] ?? localData;
    }
    try {
        return expr.split('.').reduce((value, key) => {
            if (key.includes('[') && key.includes(']')) {
                const [arrayKey, indexStr] = key.split('[');
                const indexExpr = indexStr.slice(0, -1); // 移除最后的 ']'
                let index = Number.parseInt(indexExpr, 10);
                if (Number.isNaN(index)) {
                    index = evaluateExpression(indexExpr, localData);
                }
                return value?.[arrayKey]?.[index];
            }
            return value?.[key];
        }, localData);
    } catch (error) {
        console.error(`Error evaluating expression: ${expr}`, error);
        return undefined;
    }
}

type Formatter = (value: any) => string;

export function interpolate(template: string, data: any, formatter: Formatter | null = null): string {
    const processConditional = (condition: string, trueBlock: string, falseBlock: string, localData: any): string => {
        const result = evaluateExpression(condition, localData);
        return result ? trueBlock : (falseBlock || '');
    };

    const processLoop = (itemName: string, arrayExpr: string, loopContent: string, localData: any): string => {
        const array = evaluateExpression(arrayExpr, localData);
        if (!Array.isArray(array)) {
            console.warn(`Expression "${arrayExpr}" did not evaluate to an array`);
            return '';
        }
        return array.map((item) => {
            const itemData = { ...localData, [itemName]: item, '.': item };
            return interpolate(loopContent, itemData);
        }).join('');
    };

    const processTemplate = (tmpl: string, localData: any) => {
        tmpl = tmpl.replace(INTERPOLATE_LOOP_REGEXP, (_, alias, itemName, arrayExpr, loopContent) =>
            processLoop(itemName, arrayExpr, loopContent, localData));

        tmpl = tmpl.replace(INTERPOLATE_CONDITION_REGEXP, (_, alias, condition, trueBlock, falseBlock) =>
            processConditional(condition, trueBlock, falseBlock, localData));

        return tmpl.replace(INTERPOLATE_VARIABLE_REGEXP, (_, expr) => {
            const value = evaluateExpression(expr, localData);
            if (value === undefined) {
                return `{{${expr}}}`;
            }
            if (formatter) {
                return formatter(value);
            }
            return String(value);
        });
    };

    return processTemplate(template, data);
}
