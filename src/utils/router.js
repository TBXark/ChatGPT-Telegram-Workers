export const Router = ({ base = '', routes = [], ...other } = {}) => {
    const parseQueryParams = (searchParams) => {
        const query = Object.create(null);
        for (const [k, v] of searchParams) {
            query[k] = k in query ? [].concat(query[k], v) : v;
        }
        return query;
    };
    const normalizePath = (path) => {
        return path.replace(/\/+(\/|$)/g, '$1');
    };
    const createRouteRegex = (path) => {
        return RegExp(`^${path
            .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))') // greedy params
            .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))') // named params and image format
            .replace(/\./g, '\\.') // dot in path
            .replace(/(\/?)\*/g, '($1.*)?') // wildcard
            }/*$`);
    };
    const router = {
        routes,
        ...other,
        async fetch(request, ...args) {
            const url = new URL(request.url);
            request.query = parseQueryParams(url.searchParams);
            for (const [method, regex, handlers, path] of routes) {
                if ((method === request.method || method === 'ALL') && url.pathname.match(regex)) {
                    request.params = url.pathname.match(regex)?.groups || {};
                    request.route = path;
                    for (const handler of handlers) {
                        const response = await handler(request.proxy ?? request, ...args);
                        if (response != null) return response;
                    }
                }
            }
        },
    };
    const proxyHandler = {
        get: (target, prop, receiver) => {
            return (route, ...handlers) => {
                const path = normalizePath(base + route);
                const regex = createRouteRegex(path);
                routes.push([prop.toUpperCase(), regex, handlers, path]);
                return receiver;
            };
        },
    };

    return Object.setPrototypeOf(router, new Proxy({}, proxyHandler));
};

